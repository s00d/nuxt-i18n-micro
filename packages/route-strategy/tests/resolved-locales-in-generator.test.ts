import type { Locale } from '@i18n-micro/types'
import { RouteGenerator } from '../src/index'

describe('RouteGenerator – resolved locales from raw options', () => {
  test('resolves locales: merges duplicates by code', () => {
    const rawLocales: Locale[] = [
      { code: 'en', iso: 'en-US' },
      { code: 'en', displayName: 'English' },
      { code: 'de', iso: 'de-DE' },
    ]
    const generator = new RouteGenerator({
      locales: rawLocales,
      defaultLocaleCode: 'en',
      strategy: 'prefix_except_default',
      globalLocaleRoutes: {},
      routeLocales: {},
      noPrefixRedirect: false,
    })
    expect(generator.locales).toHaveLength(2)
    expect(generator.locales.map(l => l.code)).toEqual(['en', 'de'])
    expect(generator.defaultLocale).toMatchObject({ code: 'en', iso: 'en-US', displayName: 'English' })
  })

  test('resolves locales: filters out disabled', () => {
    const rawLocales: Locale[] = [
      { code: 'en', iso: 'en-US' },
      { code: 'de', iso: 'de-DE', disabled: true },
      { code: 'ru', iso: 'ru-RU' },
    ]
    const generator = new RouteGenerator({
      locales: rawLocales,
      defaultLocaleCode: 'en',
      strategy: 'prefix_except_default',
      globalLocaleRoutes: {},
      routeLocales: {},
      noPrefixRedirect: false,
    })
    expect(generator.locales).toHaveLength(2)
    expect(generator.locales.map(l => l.code)).toEqual(['en', 'ru'])
    expect(generator.defaultLocale.code).toBe('en')
  })

  test('resolves locales: defaultLocaleCode not in list yields synthetic defaultLocale', () => {
    const rawLocales: Locale[] = [
      { code: 'de', iso: 'de-DE' },
      { code: 'ru', iso: 'ru-RU' },
    ]
    const generator = new RouteGenerator({
      locales: rawLocales,
      defaultLocaleCode: 'en',
      strategy: 'prefix_except_default',
      globalLocaleRoutes: {},
      routeLocales: {},
      noPrefixRedirect: false,
    })
    expect(generator.locales).toHaveLength(2)
    expect(generator.defaultLocale).toEqual({ code: 'en' })
  })

  test('activeLocaleCodes use resolved locales', () => {
    const rawLocales: Locale[] = [
      { code: 'en', iso: 'en-US' },
      { code: 'de', disabled: true },
      { code: 'ru', iso: 'ru-RU' },
    ]
    const generator = new RouteGenerator({
      locales: rawLocales,
      defaultLocaleCode: 'en',
      strategy: 'prefix_except_default',
      globalLocaleRoutes: {},
      routeLocales: {},
      noPrefixRedirect: false,
    })
    expect(generator.activeLocaleCodes).toEqual(['ru'])
  })
})
