import { createEvent, type H3Event } from 'h3'
import { IncomingMessage, ServerResponse } from 'node:http'
import { Socket } from 'node:net'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

const state = vi.hoisted(() => ({
  load: vi.fn(),
  privateConfig: {} as Record<string, unknown>,
  config: { locales: [{ code: 'en' }], apiBaseUrl: '_locales', dateBuild: 'hash', httpCacheDuration: 31536000 } as Record<string, unknown>,
  domains: false,
}))

vi.mock('../../src/runtime/server/utils/server-loader', () => ({
  loadTranslationsFromServer: state.load,
  resolveServerHost: () => process.env.NUXT_I18N_APP_BASE_SERVER_HOST ?? state.privateConfig.apiBaseServerHost,
}))
vi.mock('../../src/runtime/server/utils/locale-detector', () => ({
  getI18nServerConfig: () => state.config,
  getRequestLocale: () => 'en',
  detectRequestLocale: () => 'en',
}))
// every `#...` alias is one stub, so one mock answers for all of them
vi.mock('#i18n-internal/config', () => ({
  getI18nPrivateConfig: () => state.privateConfig,
  useRuntimeConfig: () => ({ app: { baseURL: '/' } }),
  get domains() {
    return state.domains
  },
}))

function event(url: string, params?: Record<string, string>): H3Event {
  const req = new IncomingMessage(new Socket())
  req.url = url
  req.method = 'GET'
  req.headers.host = 'localhost'
  const res = new ServerResponse(req)
  const h3 = createEvent(req, res)
  h3.context.params = params
  h3.context.matchedRoute = { path: '' } as never
  return h3
}

const handler = async (path: string) => (await import(path)).default as (e: H3Event) => Promise<unknown>

beforeEach(() => {
  state.load.mockReset()
  state.privateConfig = {}
  state.domains = false
})

afterEach(() => {
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
})

describe('/_locales', () => {
  const route = () => handler('../../src/runtime/server/routes/i18n')
  const request = (query = '?v=hash') => event(`/_locales/about/en/data.json${query}`, { page: 'about', locale: 'en' })

  test('a failed read answers 503 and no-store, never an immutable {}', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    state.load.mockRejectedValue(new Error('502 from https://backend.internal'))
    const e = request()
    await expect((await route())(e)).rejects.toMatchObject({ statusCode: 503, statusMessage: 'Translations unavailable' })
    expect(e.node.res.getHeader('cache-control')).toBe('no-store')
  })

  test('an empty dictionary is never immutable', async () => {
    state.load.mockResolvedValue({ data: {}, json: '{}' })
    const e = request()
    await (
      await route()
    )(e)
    expect(e.node.res.getHeader('cache-control')).toBe('public, max-age=0, must-revalidate')
  })

  test('a dictionary with the current ?v= is', async () => {
    state.load.mockResolvedValue({ data: { a: 1 }, json: '{"a":1}' })
    const e = request()
    await (
      await route()
    )(e)
    expect(e.node.res.getHeader('cache-control')).toContain('immutable')
  })
})

describe('the Nitro middleware hands the render its loader', () => {
  const middleware = () => handler('../../src/runtime/server/middleware/i18n.global')

  test('on a page: the render reaches the host through it only with cacheStorage', async () => {
    const run = async () => {
      const e = event('/about')
      await (
        await middleware()
      )(e)
      return e.context.i18n!
    }
    state.privateConfig = { apiBaseServerHost: 'https://backend.test' }
    expect((await run()).loadsRemote).toBe(false)

    state.privateConfig = { apiBaseServerHost: 'https://backend.test', cacheStorage: 'redis' }
    expect((await run()).loadsRemote).toBe(true)

    state.privateConfig = { cacheStorage: 'redis' }
    expect((await run()).loadsRemote).toBe(false)
    vi.stubEnv('NUXT_I18N_APP_BASE_SERVER_HOST', 'https://runtime.test')
    expect((await run()).loadsRemote).toBe(true)
  })

  test('the load it gives returns the dictionary', async () => {
    state.load.mockResolvedValue({ data: { a: 1 }, json: '{"a":1}' })
    const e = event('/about')
    await (
      await middleware()
    )(e)
    expect(await e.context.i18n!.load!('en', 'about')).toEqual({ a: 1 })
  })

  test('on an internal path too: the 404 of /_nuxt/ fills the process-wide chunk cache', async () => {
    const e = event('/_nuxt/')
    await (
      await middleware()
    )(e)
    expect(e.context.i18n!.load).toBeTypeOf('function')
    expect(e.context.i18n!.locale).toBeUndefined()
  })
})

describe('useTranslationServerMiddleware', () => {
  test('an outage costs a server route its strings, not its response, and the next call retries', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { useTranslationServerMiddleware } = await import('../../src/runtime/server/utils/translation-server-middleware')
    state.load.mockRejectedValueOnce(new Error('502'))
    const e = event('/api/x')
    expect((await useTranslationServerMiddleware(e))('hello', undefined, 'fallback')).toBe('fallback')
    state.load.mockResolvedValue({ data: { hello: 'Hello' }, json: '' })
    expect((await useTranslationServerMiddleware(e))('hello')).toBe('Hello')
  })
})
