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
  }
}

async function run(path: string, init: Parameters<typeof request>[1] = {}, options: Record<string, unknown> = {}) {
  const i18n = createI18n({ locale: 'en', messages: { en: {} } })
  const middleware = createI18nMiddleware({ i18n, defaultLocale: 'en', locales, ...options })
  const context = request(path, init)
  await middleware(context as never, async () => new Response(''))
  const requestI18n = context.locals.i18n as ReturnType<typeof createI18n>
  return { locale: context.locals.locale, route: requestI18n.getRoute() }
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

  test('unprefixed: cookie, then Accept-Language (q-aware), then default', async () => {
    expect((await run('/about', { cookies: { 'i18n-locale': 'fr' }, headers: { 'accept-language': 'de' } }, { routingStrategy })).locale).toBe('fr')
    expect((await run('/about', { headers: { 'accept-language': 'de;q=0.1, fr;q=0.9' } }, { routingStrategy })).locale).toBe('fr')
    expect((await run('/about', {}, { routingStrategy })).locale).toBe('en')
  })

  test('localeCookie is configurable and null disables it; autoDetect: false leaves the URL only', async () => {
    const init = { cookies: { 'user-locale': 'de', 'i18n-locale': 'fr' } }
    expect((await run('/about', init, { routingStrategy, localeCookie: 'user-locale' })).locale).toBe('de')
    expect((await run('/about', init, { routingStrategy, localeCookie: null })).locale).toBe('en')
    expect((await run('/about', { ...init, headers: { 'accept-language': 'de' } }, { routingStrategy, autoDetect: false })).locale).toBe('en')
  })

  test('a prerendered page reads no cookie or header', async () => {
    const init = { cookies: { 'i18n-locale': 'fr' }, isPrerendered: true }
    expect((await run('/about', init, { routingStrategy })).locale).toBe('en')
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
