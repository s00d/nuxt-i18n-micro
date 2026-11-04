/**
 * The server redirect plugin (06.redirect) on a real h3 event, with the strategy stubbed: the status it answers with
 * and the locale cookie it writes come from the config alone.
 */
import { createEvent, type H3Event } from 'h3'
import { IncomingMessage, ServerResponse } from 'node:http'
import { Socket } from 'node:net'
import { beforeEach, expect, test, vi } from 'vitest'

const state = vi.hoisted(() => ({ event: null as unknown, navigateTo: vi.fn() }))

vi.mock('#imports', () => ({
  defineNuxtPlugin: (plugin: unknown) => plugin,
  navigateTo: state.navigateTo,
  useRequestEvent: () => state.event,
  useRouter: () => ({ getRoutes: () => [], currentRoute: { value: { matched: [] } } }),
  useRuntimeConfig: () => ({ app: { baseURL: '/' } }),
  useState: () => ({ value: null }),
  createError: (error: unknown) => error,
}))

function event(url: string, headers: Record<string, string> = {}): H3Event {
  const req = new IncomingMessage(new Socket())
  req.url = url
  req.method = 'GET'
  Object.assign(req.headers, { host: 'localhost' }, headers)
  return createEvent(req, new ServerResponse(req))
}

const strategy = (urlLocale: string | null, target: string | null) => ({
  shouldReturn404: () => null,
  getLocaleFromPath: () => urlLocale,
  getClientRedirect: () => target,
})

const base = {
  strategy: 'prefix',
  defaultLocale: 'en',
  locales: [{ code: 'en' }, { code: 'de' }],
  autoDetectPath: '/',
  autoDetectLanguage: true,
  redirects: true,
  hashMode: false,
  excludePatterns: [],
  apiBaseUrl: '_locales',
  localeCookie: 'user-locale',
}

async function run(config: Record<string, unknown>, url: string, urlLocale: string | null, target: string | null) {
  const e = event(url, { 'accept-language': 'de' })
  state.event = e
  const plugin = (await import('../../src/runtime/plugins/06.redirect')).default as unknown as { setup: (app: unknown) => unknown }
  await plugin.setup({ $i18nStrategy: strategy(urlLocale, target), $getI18nConfig: () => ({ ...base, ...config }) })
  return e
}

beforeEach(() => state.navigateTo.mockReset())

test('the locale redirect answers 302 by default, the configured redirectStatusCode otherwise', async () => {
  await run({}, '/', null, '/de')
  expect(state.navigateTo).toHaveBeenLastCalledWith('/de', { redirectCode: 302 })
  await run({ redirectStatusCode: 301 }, '/', null, '/de')
  expect(state.navigateTo).toHaveBeenLastCalledWith('/de', { redirectCode: 301 })
})

test('the move into the hash (hashMode + prefix) answers with the same code', async () => {
  await run({ hashMode: true }, '/about', null, null)
  expect(state.navigateTo).toHaveBeenLastCalledWith('/#/about', { redirectCode: 302 })
  await run({ hashMode: true, redirectStatusCode: 308 }, '/about', null, null)
  expect(state.navigateTo).toHaveBeenLastCalledWith('/#/about', { redirectCode: 308 })
})

test('the locale cookie carries localeCookieOptions; with none it is as before', async () => {
  const header = (e: H3Event) =>
    String(e.node.res.getHeader('set-cookie') ?? '')
      .split(/,(?=\s*user-locale=)/)
      .find((entry) => entry.includes('user-locale='))
      ?.replace(/Expires=[^;]+/, 'Expires=<date>')
  expect(header(await run({}, '/de', 'de', null))).toBe('user-locale=de; Max-Age=31536000; Path=/; Expires=<date>; SameSite=Lax')
  const options = { domain: '.example.com', path: '/app', secure: true, sameSite: 'none', maxAge: 60 }
  expect(header(await run({ localeCookieOptions: options }, '/de', 'de', null))).toBe(
    'user-locale=de; Max-Age=60; Domain=.example.com; Path=/app; Expires=<date>; Secure; SameSite=None',
  )
})
