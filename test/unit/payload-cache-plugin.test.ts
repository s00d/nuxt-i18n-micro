/** The Nitro plugin on a response of a static handler, which answers before any route: only `beforeResponse` sees it. */
import { IncomingMessage, ServerResponse } from 'node:http'
import { Socket } from 'node:net'
import { createEvent, type H3Event } from 'h3'
import { beforeEach, expect, test, vi } from 'vitest'

const state = vi.hoisted(() => ({ config: {} as Record<string, unknown> }))
vi.mock('nitropack/runtime', () => ({
  defineNitroPlugin: (plugin: unknown) => plugin,
  useRuntimeConfig: () => ({ app: { baseURL: '/shop/' } }),
}))
vi.mock('../../src/runtime/server/utils/locale-detector', () => ({ getI18nServerConfig: () => state.config }))
vi.mock('../../src/runtime/server/utils/server-loader', () => ({ resolveServerHost: () => undefined }))

type Hook = (event: H3Event) => void

async function respond(url: string, statusCode = 200) {
  const { default: plugin } = await import('../../src/runtime/server/plugins/payload-cache')
  let hook: Hook | undefined
  ;(plugin as unknown as (app: { hooks: { hook: (name: string, run: Hook) => void } }) => void)({ hooks: { hook: (_name, run) => (hook = run) } })
  const req = new IncomingMessage(new Socket())
  req.url = url
  const res = new ServerResponse(req)
  res.statusCode = statusCode
  res.setHeader('Content-Length', '10')
  hook!(createEvent(req, res))
  return res
}

const FILE = '/shop/_locales/index/en/data.json'

beforeEach(() => {
  state.config = { apiBaseUrl: '_locales', dateBuild: 'abc', httpCacheDuration: 3600 }
})

test('the current ?v= is pinned for this browser, and the size of the build goes', async () => {
  const res = await respond(`${FILE}?v=abc`)
  expect(res.getHeader('Cache-Control')).toBe('private, max-age=3600, immutable')
  expect(res.getHeader('Content-Length')).toBeUndefined()
})

test('any other ?v=, or none, revalidates', async () => {
  for (const url of [`${FILE}?v=old`, FILE]) expect((await respond(url)).getHeader('Cache-Control')).toBe('public, max-age=0, must-revalidate')
})

test('a failed response and any other path stay as they are', async () => {
  for (const res of [await respond(`${FILE}?v=abc`, 404), await respond('/shop/about?v=abc')]) {
    expect(res.getHeader('Cache-Control')).toBeUndefined()
    expect(res.getHeader('Content-Length')).toBe('10')
  }
})

test('`httpCacheControl: false` sets no header of its own', async () => {
  state.config.httpCacheControl = false
  expect((await respond(`${FILE}?v=abc`)).getHeader('Cache-Control')).toBeUndefined()
})
