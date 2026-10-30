import { describe, expect, test } from 'vitest'
import { writable } from 'svelte/store'
import { createAstroRouterAdapter, createI18n, createI18nMiddleware, detectLocale } from '../src'
import { hasTranslation, type I18nState, translate, translatePlural } from '../src/client/core'
import { useAstroI18n } from '../src/client/svelte'

const locales = ['en', 'de', 'fr']

function request(path: string, { cookies = {} as Record<string, string>, headers = {} as Record<string, string>, isPrerendered = false } = {}) {
  return {
    url: new URL(`http://x${path}`),
    locals: {} as Record<string, unknown>,
    cookies: { get: (name: string) => (name in cookies ? { value: cookies[name]! } : undefined) },
    request: { headers: new Headers(headers) },
    isPrerendered,
    redirect: (location: string, status: number) => new Response(null, { status, headers: { Location: location } }),
  }
}

const vary: { last: string | null; location: string | null } = { last: null, location: null }

async function run(path: string, init: Parameters<typeof request>[1] = {}, options: Record<string, unknown> = {}) {
  const i18n = createI18n({ locale: 'en', messages: { en: {} } })
  const middleware = createI18nMiddleware({ i18n, defaultLocale: 'en', locales, ...options })
  const context = request(path, init)
  const response = (await middleware(context as never, async () => new Response(''))) as Response
  vary.last = response.headers.get('vary')
  vary.location = response.headers.get('location')
  const requestI18n = context.locals.i18n as ReturnType<typeof createI18n> | undefined
  return { locale: context.locals.locale, route: requestI18n?.getRoute() }
}

describe('createI18nMiddleware (F10, D5)', () => {
  const routingStrategy = createAstroRouterAdapter(
    locales.map((code) => ({ code })),
    'en',
  )

  test('an explicit prefix wins over cookie and header', async () => {
    const init = { cookies: { 'i18n-locale': 'fr' }, headers: { 'accept-language': 'de' } }
    expect(await run('/en/about', init, { routingStrategy })).toEqual({ locale: 'en', route: 'about' })
  })

  test("an unprefixed URL is the default locale's page: cookie and header do not re-render it", async () => {
    const init = { cookies: { 'i18n-locale': 'fr' }, headers: { 'accept-language': 'de' } }
    expect(await run('/about', init, { routingStrategy })).toEqual({ locale: 'en', route: 'about' })
    expect(vary.last).toBeNull()
  })

  test('redirectToDefault: the home page without a preference redirects to the default locale', async () => {
    await run('/', {}, { redirectToDefault: true, routingStrategy: { resolvePath: () => '/en' } })
    expect(vary.location).toBe('/en')
    await run('/', { headers: { 'accept-language': 'de' } }, { redirectToDefault: true })
    expect(vary.location).toBe('/de')
    await run('/', {}, { redirectToDefault: true, autoDetect: false, routingStrategy: { resolvePath: () => '/en' } })
    expect(vary.location).toBe('/en')
    // no strategy resolves a home: `/` is the default locale's page, a `/en` would be a 404
    expect(await run('/', {}, { redirectToDefault: true })).toEqual({ locale: 'en', route: 'index' })
    expect(vary.location).toBeNull()
    await run('/', {}, { redirectToDefault: true, autoDetect: false })
    expect(vary.location).toBeNull()
    // no redirect loop where the default locale's home is the root, and never on a prerendered page
    await run('/', {}, { redirectToDefault: true, routingStrategy: { resolvePath: () => '/' } })
    expect(vary.location).toBeNull()
    // resolvePath may answer with a route object: its path is the home
    await run('/', {}, { redirectToDefault: true, routingStrategy: { resolvePath: () => ({ path: '/home-en' }) } })
    expect(vary.location).toBe('/home-en')
    await run('/', { isPrerendered: true }, { redirectToDefault: true })
    expect(vary.location).toBeNull()
    await run('/', {}, {})
    expect(vary.location).toBeNull()
  })

  test('autoDetect: the home page redirects to the preferred locale (cookie, then q-aware header)', async () => {
    await run('/', { cookies: { 'i18n-locale': 'fr' }, headers: { 'accept-language': 'de' } }, { routingStrategy })
    expect(vary.location).toBe('/fr')
    await run('/', { headers: { 'accept-language': 'de;q=0.1, fr;q=0.9' } }, { routingStrategy })
    expect(vary.location).toBe('/fr')
    expect(vary.last).toBe('Cookie, Accept-Language')
    // the default locale's visitor stays, and the page still varies on what decided that
    expect(await run('/', {}, { routingStrategy })).toEqual({ locale: 'en', route: 'index' })
    expect(vary.location).toBeNull()
    expect(vary.last).toBe('Cookie, Accept-Language')
  })

  test('localeCookie is configurable and null disables it; autoDetect: false never redirects', async () => {
    const init = { cookies: { 'user-locale': 'de', 'i18n-locale': 'fr' } }
    await run('/', init, { routingStrategy, localeCookie: 'user-locale' })
    expect(vary.location).toBe('/de')
    await run('/', init, { routingStrategy, localeCookie: null })
    expect(vary.location).toBeNull()
    expect(vary.last).toBe('Accept-Language')
    expect(await run('/', { ...init, headers: { 'accept-language': 'de' } }, { routingStrategy, autoDetect: false })).toEqual({
      locale: 'en',
      route: 'index',
    })
    expect(vary.last).toBeNull()
  })

  test('a prerendered home reads no cookie or header and does not vary', async () => {
    expect((await run('/', { cookies: { 'i18n-locale': 'fr' }, isPrerendered: true }, { routingStrategy })).locale).toBe('en')
    expect(vary.location).toBeNull()
    expect(vary.last).toBeNull()
  })

  test('without a routing strategy the prefix still names the locale and leaves the route name', async () => {
    expect(await run('/fr/blog/post')).toEqual({ locale: 'fr', route: 'blog-post' })
    expect(await run('/')).toEqual({ locale: 'en', route: 'index' })
  })
})

describe('detectLocale', () => {
  const cookies = { get: (name: string) => (name === 'i18n-locale' ? { value: 'fr' } : undefined) }

  test('a prefix that is the default locale is still explicit', () => {
    expect(detectLocale('/en/about', cookies, new Headers({ 'accept-language': 'de' }), 'en', locales)).toBe('en')
  })

  test('cookie before header, header when no cookie', () => {
    expect(detectLocale('/about', cookies, new Headers({ 'accept-language': 'de' }), 'en', locales)).toBe('fr')
    expect(detectLocale('/about', cookies, new Headers({ 'accept-language': 'de' }), 'en', locales, null)).toBe('de')
  })
})

describe('island core', () => {
  const state: I18nState = {
    locale: 'en',
    fallbackLocale: 'en',
    currentRoute: 'index',
    translations: { index: { apples: 'no apples | one apple | {count} apples', hi: 'Hi' } },
  }

  test('reads own keys only: inherited names are missing keys', () => {
    expect(translate(state, 'toString')).toBe('toString')
    expect(translate(state, 'constructor', undefined, 'D')).toBe('D')
    expect(translate(state, 'hi', undefined, undefined, 'toString')).toBe('hi')
    expect(hasTranslation(state, 'toString')).toBe(false)
    expect(hasTranslation(state, 'hi')).toBe(true)
  })

  test('tc: a missing key gives defaultValue, as the server BaseI18n.tc', () => {
    const server = createI18n({ locale: 'en', messages: { en: state.translations.index! } })
    for (const [key, count, dv] of [
      ['nope', 3, 'D'],
      ['nope', 3, undefined],
      ['apples', 0, undefined],
      ['apples', 5, 'D'],
    ] as const) {
      expect(translatePlural(state, key, count, dv)).toBe(server.tc(key, count, dv))
    }
    expect(translatePlural(state, 'nope', 3, 'D')).toBe('D')
  })

  test('the island adapters use the shared tc', () => {
    const { tc } = useAstroI18n(writable(state))
    expect(tc('nope', 3, 'D')).toBe('D')
    expect(tc('apples', 2)).toBe('2 apples')
  })
})
