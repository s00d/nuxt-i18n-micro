import type { Locale } from '@i18n-micro/types'
import { resolveLocales } from '../src/utils/locales'

describe('resolveLocales (utils/locales)', () => {
  test('returns merged locales and defaultLocale for defaultLocaleCode present in list', () => {
    const locales: Locale[] = [
      { code: 'en', iso: 'en-US' },
      { code: 'de', iso: 'de-DE' },
    ]
    const result = resolveLocales(locales, 'en')
    expect(result.locales).toHaveLength(2)
    expect(result.locales.map(l => l.code)).toEqual(['en', 'de'])
    expect(result.defaultLocale).toEqual({ code: 'en', iso: 'en-US' })
  })

  test('creates defaultLocale when defaultLocaleCode not in list', () => {
    const locales: Locale[] = [
      { code: 'de', iso: 'de-DE' },
      { code: 'ru', iso: 'ru-RU' },
    ]
    const result = resolveLocales(locales, 'en')
    expect(result.locales).toHaveLength(2)
    expect(result.defaultLocale).toEqual({ code: 'en' })
  })

  test('merges duplicates by code: later entry overwrites props', () => {
    const locales: Locale[] = [
      { code: 'en', iso: 'en-US', displayName: 'English' },
      { code: 'en', iso: 'en-GB', displayName: 'British English' },
    ]
    const result = resolveLocales(locales, 'en')
    expect(result.locales).toHaveLength(1)
    expect(result.locales[0]).toMatchObject({ code: 'en', iso: 'en-GB', displayName: 'British English' })
    expect(result.defaultLocale).toMatchObject({ code: 'en', iso: 'en-GB' })
  })

  test('filters out disabled locales', () => {
    const locales: Locale[] = [
      { code: 'en', iso: 'en-US' },
      { code: 'de', iso: 'de-DE', disabled: true },
      { code: 'ru', iso: 'ru-RU' },
    ]
    const result = resolveLocales(locales, 'en')
    expect(result.locales).toHaveLength(2)
    expect(result.locales.map(l => l.code)).toEqual(['en', 'ru'])
    expect(result.defaultLocale.code).toBe('en')
  })

  test('when defaultLocaleCode is in a disabled locale, defaultLocale is synthetic', () => {
    const locales: Locale[] = [
      { code: 'en', disabled: true },
      { code: 'de', iso: 'de-DE' },
    ]
    const result = resolveLocales(locales, 'en')
    expect(result.locales).toHaveLength(1)
    expect(result.locales[0]!.code).toBe('de')
    expect(result.defaultLocale).toEqual({ code: 'en' })
  })

  test('empty locales list: only defaultLocale object', () => {
    const result = resolveLocales([], 'en')
    expect(result.locales).toHaveLength(0)
    expect(result.defaultLocale).toEqual({ code: 'en' })
  })

  test('single locale as default', () => {
    const locales: Locale[] = [{ code: 'fr', iso: 'fr-FR' }]
    const result = resolveLocales(locales, 'fr')
    expect(result.locales).toHaveLength(1)
    expect(result.defaultLocale).toEqual({ code: 'fr', iso: 'fr-FR' })
  })
})
