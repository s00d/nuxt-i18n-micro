import { afterEach, describe, expect, test, vi } from 'vitest'
import { createI18n, I18n } from '../src'

const site = () =>
  createI18n({
    locale: 'en',
    fallbackLocale: 'en',
    messages: { en: { hi: 'Hello', apples: 'a | b' }, de: { hi: 'Hallo' } },
    routeMessages: { about: { en: { title: 'About' } } },
    missingWarn: false,
  })

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('fork', () => {
  test('has its own locale, fallback and route, starting from the parent', () => {
    const root = site()
    root.setRoute('about')
    root.fallbackLocale = 'de'
    const fork = root.fork('de')
    expect(fork).toBeInstanceOf(I18n)
    expect([fork.getLocale(), fork.getFallbackLocale(), fork.getRoute()]).toEqual(['de', 'de', 'about'])
    fork.locale = 'en'
    fork.setRoute('x')
    expect([root.getLocale(), root.getRoute()]).toEqual(['en', 'about'])
    expect(root.fork().getLocale()).toBe('en')
  })

  test('shares formatters and rules', () => {
    const plural = vi.fn(() => 'custom')
    const missingHandler = vi.fn()
    const root = createI18n({ locale: 'en', plural, missingHandler, numberFormats: { en: { pct: { style: 'percent' } } } })
    const fork = root.fork()
    expect(fork.formatter).toBe(root.formatter)
    expect(fork.pluralFunc).toBe(root.pluralFunc)
    expect(fork.tn(0.5, 'pct')).toBe('50%')
    expect(fork.tc('x', 1)).toBe('custom')
    fork.t('nope')
    expect(missingHandler).toHaveBeenCalledWith('en', 'nope', 'index')
  })

  test('sees the parent until its first write; its writes never reach the parent or a sibling', () => {
    const root = site()
    const a = root.fork()
    const b = root.fork()
    root.addTranslations('en', { later: 'Later' })
    expect(a.t('later')).toBe('Later')

    a.addTranslations('en', { own: 'Own' })
    a.addRouteTranslations('en', 'about', { page: 'Page' })
    a.setTranslation('hi', 'Changed')
    expect([a.t('own'), a.t('hi'), a.t('page', undefined, undefined, 'about')]).toEqual(['Own', 'Changed', 'Page'])
    expect([b.t('own'), b.t('hi'), root.t('own'), root.t('hi')]).toEqual(['own', 'Hello', 'own', 'Hello'])
  })

  test('clearing a fork empties the fork alone', () => {
    const root = site()
    const fork = root.fork()
    fork.clearCache()
    expect(fork.t('hi')).toBe('hi')
    expect(root.t('hi')).toBe('Hello')
  })

  test('a write through its storage or helper stays in the fork too', () => {
    const root = site()
    const viaStorage = root.fork()
    viaStorage.storage.translations.set('en:index', { hi: 'Direct' })
    expect([viaStorage.t('hi'), root.t('hi')]).toEqual(['Direct', 'Hello'])

    const viaMerge = root.fork()
    viaMerge.helper.loadTranslations('en', { hi: 'Helper' })
    expect([viaMerge.t('hi'), root.t('hi')]).toEqual(['Helper', 'Hello'])

    const viaSet = root.fork()
    viaSet.helper.setTranslations('en', { x: 'y' }, 'route')
    expect(root.helper.hasCache('en', 'route')).toBe(false)
  })

  test('stored trees are shared, not copied: forking does not depend on the number of chunks', () => {
    const root = site()
    expect(root.fork().helper.translations).toBe(root.helper.translations)
    expect(root.fork().fork('de').t('hi')).toBe('Hallo')
  })

  test('subscribers of the parent hear nothing of a fork', () => {
    const root = site()
    const listener = vi.fn()
    root.subscribe(listener)
    const fork = root.fork()
    fork.locale = 'de'
    fork.addTranslations('de', { x: 'y' })
    expect(listener).not.toHaveBeenCalled()
  })
})

describe('loadFromUrls', () => {
  test('a failed fetch leaves the dictionaries as they were', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => ({ ok: !url.includes('bad'), status: 500, statusText: 'x', json: async () => ({ a: 'A' }) })),
    )
    const i18n = createI18n({ locale: 'en', missingWarn: false })
    await expect(
      i18n.loadFromUrls([
        { url: '/good.json', locale: 'en' },
        { url: '/bad.json', locale: 'en' },
      ]),
    ).rejects.toThrow('500')
    expect(i18n.t('a')).toBe('a')
  })

  test('fetches at once, merges in entry order whatever arrives first', async () => {
    let release = () => {}
    const slow = new Promise<void>((resolve) => {
      release = resolve
    })
    const fetchMock = vi.fn(async (url: string) => {
      if (url === '/first.json') await slow
      return { ok: true, json: async () => ({ v: url }) }
    })
    vi.stubGlobal('fetch', fetchMock)
    const i18n = createI18n({ locale: 'en' })
    const loading = i18n.loadFromUrls([
      { url: '/first.json', locale: 'en' },
      { url: '/second.json', locale: 'en' },
    ])
    expect(fetchMock).toHaveBeenCalledTimes(2)
    release()
    await loading
    expect(i18n.t('v')).toBe('/second.json')
  })
})

test('a fork keeps the locale tags: plurals of a code that is no language tag', () => {
  const root = createI18n({
    locale: 'ua',
    localeIso: { ua: 'uk-UA' },
    messages: { ua: { items: '=0 нема | {count} предмет | {count} предмети | {count} предметів' } },
    missingWarn: false,
  })
  expect(root.fork().tc('items', 21)).toBe(root.tc('items', 21))
  expect(root.fork().tc('items', 21)).toBe('21 предмет')
})
