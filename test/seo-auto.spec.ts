import { fileURLToPath } from 'node:url'
import { expect, test } from '@nuxt/test-utils/playwright'
import type { Page } from '@playwright/test'

test.use({
  nuxt: {
    rootDir: fileURLToPath(new URL('./fixtures/seo-auto', import.meta.url)),
  },
})

/**
 * Proxy all requests from `emulatedOrigin` to the real test server.
 * The browser sees `emulatedOrigin` in its address bar and in `window.location.origin`.
 * The server receives `X-Forwarded-Host` so SSR also resolves the correct domain.
 */
async function emulateDomain(page: Page, emulatedOrigin: string, realBaseURL: string) {
  const realBase = realBaseURL.replace(/\/$/, '')
  const { hostname: fwdHost } = new URL(emulatedOrigin)

  await page.route(`${emulatedOrigin}/**`, async (route) => {
    const url = new URL(route.request().url())
    try {
      const response = await route.fetch({
        url: `${realBase}${url.pathname}${url.search}`,
        headers: {
          ...route.request().headers(),
          'x-forwarded-host': fwdHost,
          'x-forwarded-proto': url.protocol.replace(':', ''),
        },
      })
      await route.fulfill({ response })
    } catch {
      await route.abort()
    }
  })
}

test.describe('SEO with dynamic metaBaseUrl (undefined)', () => {
  // ── SSR: raw HTTP responses (no browser) ──

  test('SSR: canonical and og:url use domain from X-Forwarded-Host', async ({ request }) => {
    const res = await request.get('/en', {
      headers: {
        'X-Forwarded-Host': 'example.com',
        'X-Forwarded-Proto': 'https',
      },
    })
    expect(res.status()).toBe(200)
    const html = await res.text()

    expect(html).toMatch(/<link[^>]*rel="canonical"[^>]*href="https:\/\/example\.com\/en"/)
    expect(html).toMatch(/<meta[^>]*property="og:url"[^>]*content="https:\/\/example\.com\/en"/)
    expect(html).not.toMatch(/href="auto/)
    expect(html).not.toMatch(/content="auto/)
  })

  test('SSR: two different domains produce different canonical for the same path', async ({ request }) => {
    const res1 = await request.get('/en/about', {
      headers: { 'X-Forwarded-Host': 'site-a.example.com', 'X-Forwarded-Proto': 'https' },
    })
    const html1 = await res1.text()
    expect(html1).toMatch(/<link[^>]*rel="canonical"[^>]*href="https:\/\/site-a\.example\.com\/en\/about"/)
    expect(html1).toMatch(/<meta[^>]*property="og:url"[^>]*content="https:\/\/site-a\.example\.com\/en\/about"/)

    const res2 = await request.get('/en/about', {
      headers: { 'X-Forwarded-Host': 'site-b.example.com', 'X-Forwarded-Proto': 'https' },
    })
    const html2 = await res2.text()
    expect(html2).toMatch(/<link[^>]*rel="canonical"[^>]*href="https:\/\/site-b\.example\.com\/en\/about"/)
    expect(html2).toMatch(/<meta[^>]*property="og:url"[^>]*content="https:\/\/site-b\.example\.com\/en\/about"/)
  })

  test('SSR: alternate hreflang links use the forwarded domain', async ({ request }) => {
    const res = await request.get('/en/about', {
      headers: { 'X-Forwarded-Host': 'multi.example.org', 'X-Forwarded-Proto': 'https' },
    })
    const html = await res.text()

    const alternateRegex = /<link[^>]*rel="alternate"[^>]*href="([^"]+)"[^>]*>/g
    const hrefs: string[] = []
    let m: RegExpExecArray | null
    while ((m = alternateRegex.exec(html)) !== null) {
      if (m[1]) hrefs.push(m[1])
    }
    expect(hrefs.length).toBeGreaterThan(0)
    for (const href of hrefs) {
      expect(href).toContain('https://multi.example.org/')
      expect(href).not.toContain('auto')
    }
  })

  test('SSR: x-default hreflang link points to default locale URL', async ({ request }) => {
    const res = await request.get('/en/about', {
      headers: { 'X-Forwarded-Host': 'example.com', 'X-Forwarded-Proto': 'https' },
    })
    const html = await res.text()

    expect(html).toMatch(/<link[^>]*hreflang="x-default"[^>]*href="https:\/\/example\.com\/en\/about"/)
  })

  test('SSR: x-default hreflang uses forwarded domain', async ({ request }) => {
    const res = await request.get('/de', {
      headers: { 'X-Forwarded-Host': 'multi.example.org', 'X-Forwarded-Proto': 'https' },
    })
    const html = await res.text()

    expect(html).toMatch(/<link[^>]*hreflang="x-default"[^>]*href="https:\/\/multi\.example\.org\/en"/)
  })

  test('SSR: og:locale and html lang are correct for a non-default locale', async ({ request }) => {
    const res = await request.get('/de', {
      headers: { 'X-Forwarded-Host': 'example.com', 'X-Forwarded-Proto': 'https' },
    })
    const html = await res.text()

    expect(html).toMatch(/<html[^>]*lang="de_DE"/)
    expect(html).toMatch(/<meta[^>]*property="og:locale"[^>]*content="de_DE"/)
  })

  test('SSR: without X-Forwarded-Host falls back to actual server host', async ({ request }) => {
    const res = await request.get('/en')
    const html = await res.text()

    expect(html).not.toMatch(/href="auto/)
    expect(html).not.toMatch(/content="auto/)
    expect(html).toMatch(/<link[^>]*rel="canonical"[^>]*href="http:\/\/(localhost|127\.0\.0\.1):\d+\/en"/)
  })

  // ── Client: emulate a real domain in the browser ──

  test('client: after hydration canonical and og:url use emulated domain', async ({ page, baseURL }) => {
    const domain = 'http://my-app.example.com'
    await emulateDomain(page, domain, baseURL!)

    await page.goto(`${domain}/en`, { waitUntil: 'networkidle' })

    // Browser must believe it is on the emulated origin
    const origin = await page.evaluate(() => window.location.origin)
    expect(origin).toBe(domain)

    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href')
    expect(canonical).toBe(`${domain}/en`)

    const ogUrl = await page.locator('meta[property="og:url"]').getAttribute('content')
    expect(ogUrl).toBe(`${domain}/en`)
  })

  test('client: alternate hreflang links use emulated domain', async ({ page, baseURL }) => {
    const domain = 'https://shop.example.com'
    await emulateDomain(page, domain, baseURL!)

    await page.goto(`${domain}/en/about`, { waitUntil: 'networkidle' })

    const links = page.locator('link[rel="alternate"]')
    const count = await links.count()
    expect(count).toBeGreaterThan(0)

    for (let i = 0; i < count; i++) {
      const href = await links.nth(i).getAttribute('href')
      expect(href).toBeTruthy()
      expect(href!.startsWith(`${domain}/`)).toBe(true)
    }
  })

  test('client: x-default hreflang link uses emulated domain and points to default locale', async ({ page, baseURL }) => {
    const domain = 'https://xd-test.example.com'
    await emulateDomain(page, domain, baseURL!)

    await page.goto(`${domain}/de/about`, { waitUntil: 'networkidle' })

    const xDefault = page.locator('link[hreflang="x-default"]')
    await expect(xDefault).toHaveAttribute('href', `${domain}/en/about`)
  })

  test('client: canonical updates to correct path after SPA navigation', async ({ page, baseURL }) => {
    const domain = 'http://spa-test.example.com'
    await emulateDomain(page, domain, baseURL!)

    await page.goto(`${domain}/en`, { waitUntil: 'networkidle' })

    // Before navigation
    let canonical = await page.locator('link[rel="canonical"]').getAttribute('href')
    expect(canonical).toBe(`${domain}/en`)

    // SPA navigate to /en/about
    await page.click('#about')
    await page.waitForURL('**/en/about')

    // After navigation — path changes, origin stays the same
    canonical = await page.locator('link[rel="canonical"]').getAttribute('href')
    expect(canonical).toBe(`${domain}/en/about`)

    const ogUrl = await page.locator('meta[property="og:url"]').getAttribute('content')
    expect(ogUrl).toBe(`${domain}/en/about`)
  })

  test('client: locale switch updates og:locale and keeps emulated domain in canonical', async ({ page, baseURL }) => {
    const domain = 'https://i18n.example.com'
    await emulateDomain(page, domain, baseURL!)

    await page.goto(`${domain}/en`, { waitUntil: 'networkidle' })

    let ogLocale = await page.locator('meta[property="og:locale"]').getAttribute('content')
    expect(ogLocale).toBe('en_EN')
    let canonical = await page.locator('link[rel="canonical"]').getAttribute('href')
    expect(canonical).toBe(`${domain}/en`)

    // Navigate to German locale
    await page.goto(`${domain}/de`, { waitUntil: 'networkidle' })

    ogLocale = await page.locator('meta[property="og:locale"]').getAttribute('content')
    expect(ogLocale).toBe('de_DE')
    canonical = await page.locator('link[rel="canonical"]').getAttribute('href')
    expect(canonical).toBe(`${domain}/de`)
  })

  test('client: html lang and dir update on locale change with emulated domain', async ({ page, baseURL }) => {
    const domain = 'http://lang-test.example.com'
    await emulateDomain(page, domain, baseURL!)

    await page.goto(`${domain}/en`, { waitUntil: 'networkidle' })
    const html = page.locator('html')
    await expect(html).toHaveAttribute('lang', 'en_EN')
    await expect(html).toHaveAttribute('dir', 'auto')

    await page.goto(`${domain}/de`, { waitUntil: 'networkidle' })
    await expect(html).toHaveAttribute('lang', 'de_DE')

    await page.goto(`${domain}/ru`, { waitUntil: 'networkidle' })
    await expect(html).toHaveAttribute('lang', 'ru_RU')
  })
})
