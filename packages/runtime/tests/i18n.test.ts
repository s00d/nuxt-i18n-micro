import { afterEach, describe, expect, test, vi } from 'vitest'
import { createI18n, I18n, fetchJsonTranslations } from '../src'

describe('@i18n-micro/runtime', () => {
  const messages = {
    en: {
      greeting: 'Hello, {name}!',
      nested: { message: 'Nested EN' },
      apples: 'no apples|one apple|{count} apples',
      welcome: 'Welcome',
    },
    de: {
      greeting: 'Hallo, {name}!',
      welcome: 'Willkommen',
    },
  }

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  test('createI18n returns I18n with locale and messages', () => {
    const i18n = createI18n({ locale: 'en', messages })
    expect(i18n).toBeInstanceOf(I18n)
    expect(i18n.locale).toBe('en')
    expect(i18n.t('welcome')).toBe('Welcome')
    expect(i18n.t('greeting', { name: 'John' })).toBe('Hello, John!')
  })

  test('falls back to fallbackLocale', () => {
    const i18n = createI18n({ locale: 'de', fallbackLocale: 'en', messages })
    expect(i18n.t('nested.message')).toBe('Nested EN')
  })

  test('tc() picks the plural form by count', () => {
    const i18n = createI18n({ locale: 'en', messages })
    expect([0, 1, 5].map((count) => i18n.tc('apples', count))).toEqual(['no apples', 'one apple', '5 apples'])
  })

  test('routeMessages and setRoute', () => {
    const i18n = createI18n({
      locale: 'en',
      messages: { en: { welcome: 'Welcome' } },
      routeMessages: {
        home: { en: { title: 'Home Page' } },
      },
    })
    expect(i18n.t('title')).toBe('title')
    i18n.setRoute('home')
    expect(i18n.currentRoute).toBe('home')
    expect(i18n.t('title')).toBe('Home Page')
    expect(i18n.t('welcome')).toBe('Welcome')
  })

  test('subscribers hear real changes only: locale, fallback locale, clearCache; a same value is silent', () => {
    const i18n = createI18n({ locale: 'en', fallbackLocale: 'de', messages })
    const listener = vi.fn()
    const unsubscribe = i18n.subscribe(listener)
    const heard = () => listener.mock.calls.length

    // step 1: the locale
    i18n.locale = 'en'
    expect(heard()).toBe(0)
    i18n.locale = 'de'
    expect(heard()).toBe(1)

    // step 2: the fallback locale
    i18n.fallbackLocale = 'en'
    expect(heard()).toBe(2)
    expect(i18n.t('nested.message')).toBe('Nested EN')
    i18n.fallbackLocale = 'en'
    expect(heard()).toBe(2)

    // step 3: clearCache
    i18n.clearCache()
    expect(heard()).toBe(3)

    // step 4: the route
    i18n.setRoute('index')
    expect(heard()).toBe(3)
    i18n.setRoute('about')
    expect(heard()).toBe(4)

    // step 5: gone
    unsubscribe()
    i18n.locale = 'en'
    expect(heard()).toBe(4)
  })

  test('loadMessages merges further maps, root and per route', () => {
    const i18n = createI18n({ locale: 'en' })
    i18n.loadMessages({ en: { a: 'A' } })
    i18n.loadMessages({ en: { b: 'B' } }, { about: { en: { title: 'About' } } })
    expect(i18n.t('a')).toBe('A')
    expect(i18n.t('b')).toBe('B')
    expect(i18n.t('title')).toBe('title')
    expect(i18n.t('title', undefined, undefined, 'about')).toBe('About')
  })

  test('subscribe notifies on addTranslations', () => {
    const i18n = createI18n({ locale: 'en' })
    const listener = vi.fn()
    i18n.subscribe(listener)
    i18n.addTranslations('en', { hello: 'Hi' })
    expect(listener).toHaveBeenCalled()
    expect(i18n.t('hello')).toBe('Hi')
  })

  test('loadFromUrl with routeName', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => ({ title: 'Home FR' }),
      })),
    )

    const i18n = createI18n({
      locale: 'fr',
      messages: { fr: { welcome: 'Bienvenue' } },
    })
    await i18n.loadFromUrl('/locales/pages/home/fr.json', { locale: 'fr', routeName: 'home' })
    i18n.setRoute('home')
    expect(i18n.t('title')).toBe('Home FR')
    expect(i18n.t('welcome')).toBe('Bienvenue')
  })

  test('loadFromUrls loads multiple entries', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => ({
        ok: true,
        json: async () => (url.includes('de') ? { hi: 'Hallo' } : { hi: 'Hello' }),
      })),
    )

    const i18n = createI18n({ locale: 'en' })
    await i18n.loadFromUrls([
      { url: '/en.json', locale: 'en' },
      { url: '/de.json', locale: 'de' },
    ])
    expect(i18n.t('hi')).toBe('Hello')
    i18n.locale = 'de'
    expect(i18n.t('hi')).toBe('Hallo')
  })

  test('loadFromUrls merges same-locale entries sequentially', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => ({
        ok: true,
        json: async () => (url.includes('a') ? { a: 'A' } : { b: 'B' }),
      })),
    )

    const i18n = createI18n({ locale: 'en' })
    await i18n.loadFromUrls([
      { url: '/a.json', locale: 'en' },
      { url: '/b.json', locale: 'en' },
    ])
    expect(i18n.t('a')).toBe('A')
    expect(i18n.t('b')).toBe('B')
  })

  test('fetchJsonTranslations throws on non-ok response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      })),
    )

    await expect(fetchJsonTranslations('/missing.json')).rejects.toThrow(/404/)
  })

  test('hasTranslation scans every route of the active locale; has() stays on the current one', () => {
    const i18n = createI18n({ locale: 'en', messages: { en: { welcome: 'Welcome' }, de: { nurDe: 'x' } } })
    i18n.addRouteTranslations('en', 'home', { onlyHome: 'Home only' })
    expect(i18n.hasTranslation('welcome')).toBe(true)
    expect(i18n.hasTranslation('onlyHome')).toBe(true)
    expect(i18n.has('onlyHome')).toBe(false)
    expect(i18n.hasTranslation('nurDe')).toBe(false)
    expect(i18n.hasTranslation('missing')).toBe(false)
  })

  test('hasTranslation and clear', () => {
    const i18n = createI18n({ locale: 'en', messages })
    expect(i18n.hasTranslation('welcome')).toBe(true)
    i18n.clear()
    expect(i18n.t('welcome')).toBe('welcome')
  })

  test('exposes storage map', () => {
    const i18n = createI18n({ locale: 'en', messages: { en: { a: 'A' } } })
    expect(i18n.storage.translations.size).toBeGreaterThan(0)
  })

  test('loadMessages notifies only when a loaded locale can be read', () => {
    const i18n = createI18n({ locale: 'en', fallbackLocale: 'de', messages })
    const listener = vi.fn()
    i18n.subscribe(listener)
    const snapshot = i18n.getSnapshot()
    i18n.loadMessages({ fr: { welcome: 'Bienvenue' } }, { about: { fr: { welcome: 'Bienvenue' } } })
    i18n.loadMessages()
    expect(listener).not.toHaveBeenCalled()
    expect(i18n.getSnapshot()).toBe(snapshot)
    i18n.loadMessages({ fr: { a: 'A' }, en: { a: 'A' } })
    i18n.loadMessages(undefined, { about: { de: { a: 'A' } } })
    expect(listener).toHaveBeenCalledTimes(2)
  })

  test('addLocaleIso notifies when the active plural tag moves, unless told not to', () => {
    const i18n = createI18n({ locale: 'ua', messages })
    const listener = vi.fn()
    i18n.subscribe(listener)
    const snapshot = i18n.getSnapshot()
    i18n.addLocaleIso({ fr: 'fr-FR' })
    i18n.addLocaleIso({ ua: 'uk-UA' }, false)
    expect(i18n.pluralLocale()).toBe('uk-UA')
    i18n.addLocaleIso({ ua: 'uk-UA' })
    expect(listener).not.toHaveBeenCalled()
    expect(i18n.getSnapshot()).toBe(snapshot)
    i18n.addLocaleIso({ ua: 'ru-RU' })
    expect(listener).toHaveBeenCalledTimes(1)
    expect(i18n.getSnapshot()).not.toBe(snapshot)
  })

  test('a write notifies only when the locale can be read', () => {
    const i18n = createI18n({ locale: 'en', fallbackLocale: 'de', messages })
    const listener = vi.fn()
    i18n.subscribe(listener)
    const snapshot = i18n.getSnapshot()
    i18n.addTranslations('fr', { welcome: 'Bienvenue' })
    i18n.addRouteTranslations('fr', 'about', { welcome: 'Bienvenue' })
    expect(listener).not.toHaveBeenCalled()
    expect(i18n.getSnapshot()).toBe(snapshot)
    i18n.addTranslations('en', { a: 'A' })
    i18n.addRouteTranslations('en', 'other', { a: 'A' })
    i18n.addTranslations('de', { a: 'A' })
    expect(listener).toHaveBeenCalledTimes(3)
    i18n.setTranslation('a', 'B')
    i18n.clearCache()
    expect(listener).toHaveBeenCalledTimes(5)
  })

  test('a preloaded locale is there when it becomes active', () => {
    const i18n = createI18n({ locale: 'en', messages })
    i18n.addTranslations('fr', { welcome: 'Bienvenue' })
    i18n.locale = 'fr'
    expect(i18n.t('welcome')).toBe('Bienvenue')
  })

  test('timeZone and the clock reach the formatter', () => {
    const i18n = createI18n({ locale: 'en', timeZone: 'Asia/Tokyo', now: () => 7_200_000 })
    expect(i18n.td(new Date('2024-01-15T23:30:00Z'))).toBe('1/16/2024')
    expect(i18n.tdr(3_600_000)).toBe('1 hour ago')
  })
})
