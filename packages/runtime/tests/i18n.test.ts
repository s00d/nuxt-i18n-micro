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
})
