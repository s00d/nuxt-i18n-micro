import { request } from 'node:http'
import type { Page } from '@playwright/test'

export interface HostResponse {
  status: number
  location: string | undefined
  headers: Record<string, unknown>
  html: string
}

/** One stateless request with a chosen Host: `fetch` cannot set that header. */
export function onHost(baseURL: string, path: string, host: string, headers: Record<string, string> = {}): Promise<HostResponse> {
  const url = new URL(path, baseURL)
  return new Promise((resolve, reject) => {
    const req = request({ hostname: url.hostname, port: url.port, path: url.pathname + url.search, headers: { ...headers, host } }, (res) => {
      const chunks: Buffer[] = []
      res.on('data', (chunk) => chunks.push(chunk))
      res.on('end', () =>
        resolve({
          status: res.statusCode ?? 0,
          location: res.headers.location,
          headers: res.headers,
          html: Buffer.concat(chunks).toString('utf-8'),
        }),
      )
    })
    req.on('error', reject)
    req.end()
  })
}

export const contentOn = (html: string) => /id="content"[^>]*>\s*([^<]*?)\s*</.exec(html)?.[1]
export const canonicalOf = (html: string) =>
  /<link[^>]*id="i18n-can"[^>]*href="([^"]*)"/.exec(html)?.[1] ?? /<link[^>]*href="([^"]*)"[^>]*id="i18n-can"/.exec(html)?.[1]
export const alternateOf = (html: string, id: string) =>
  new RegExp(`<link[^>]*id="i18n-alternate-${id}"[^>]*href="([^"]*)"`).exec(html)?.[1] ??
  new RegExp(`<link[^>]*href="([^"]*)"[^>]*id="i18n-alternate-${id}"`).exec(html)?.[1]

/** The browser opens the real domains; every request of them goes to the test server with that Host. */
export async function routeDomains(page: Page, baseURL: string) {
  await page.route(/^https:\/\/example\.(?:com|de)\//, async (route) => {
    const url = new URL(route.request().url())
    const headers = { ...route.request().headers(), host: url.host }
    const response = await route.fetch({ url: new URL(url.pathname + url.search, baseURL).href, headers, maxRedirects: 0 })
    await route.fulfill({ response })
  })
}
