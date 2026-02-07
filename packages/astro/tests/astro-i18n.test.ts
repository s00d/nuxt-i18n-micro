import { describe, expect, test } from '@jest/globals'
import { AstroI18n, createI18n } from '../src'

describe('AstroI18n', () => {
  test('should create i18n instance', () => {
    const i18n = new AstroI18n({
      locale: 'en',
      fallbackLocale: 'en',
      messages: {
        en: {
          greeting: 'Hello',
        },
      },
    })

    expect(i18n.locale).toBe('en')
    expect(i18n.t('greeting')).toBe('Hello')
  })

  test('should translate with interpolation', () => {
    const i18n = new AstroI18n({
      locale: 'en',
      messages: {
        en: {
          greeting: 'Hello, {name}!',
        },
      },
    })

    expect(i18n.t('greeting', { name: 'John' })).toBe('Hello, John!')
  })

  test('should handle pluralization', () => {
    const i18n = new AstroI18n({
      locale: 'en',
      messages: {
        en: {
          apples: 'no apples | one apple | {count} apples',
        },
      },
    })

    expect(i18n.tc('apples', 0)).toBe('no apples')
    expect(i18n.tc('apples', 1)).toBe('one apple')
    expect(i18n.tc('apples', 5)).toBe('5 apples')
  })

  test('should format numbers', () => {
    const i18n = new AstroI18n({
      locale: 'en',
    })

    expect(i18n.tn(1234.56)).toMatch(/1[,.]234[.,]56/)
  })

  test('should format dates', () => {
    const i18n = new AstroI18n({
      locale: 'en',
    })

    const date = new Date('2023-01-15')
    const formatted = i18n.td(date)
    expect(formatted).toBeTruthy()
  })

  test('should format relative time', () => {
    const i18n = new AstroI18n({
      locale: 'en',
    })

    const oneHourAgo = new Date(Date.now() - 3600000)
    const formatted = i18n.tdr(oneHourAgo)
    expect(formatted).toMatch(/hour/)
  })

  test('should handle route-specific translations', () => {
    const i18n = new AstroI18n({
      locale: 'en',
      messages: {
        en: {
          title: 'Global Title',
        },
      },
    })

    i18n.addRouteTranslations(
      'en',
      'home',
      {
        title: 'Home Title',
      },
      false,
    ) // Use merge: false to avoid warning

    i18n.setRoute('home')
    expect(i18n.t('title')).toBe('Home Title')

    i18n.setRoute('general')
    expect(i18n.t('title')).toBe('Global Title')
  })

  test('should fallback to fallbackLocale', () => {
    const i18n = new AstroI18n({
      locale: 'fr',
      fallbackLocale: 'en',
      messages: {
        en: {
          greeting: 'Hello',
        },
      },
    })

    expect(i18n.t('greeting')).toBe('Hello')
  })

  test('should handle locale changes', () => {
    const i18n = new AstroI18n({
      locale: 'en',
      messages: {
        en: {
          greeting: 'Hello',
        },
        fr: {
          greeting: 'Bonjour',
        },
      },
    })

    expect(i18n.t('greeting')).toBe('Hello')
    i18n.locale = 'fr'
    expect(i18n.t('greeting')).toBe('Bonjour')
  })

  test('should handle missing translations', () => {
    const i18n = new AstroI18n({
      locale: 'en',
      missingWarn: false,
      messages: {
        en: {},
      },
    })

    expect(i18n.t('missing.key')).toBe('missing.key')
    expect(i18n.t('missing.key', undefined, 'Default')).toBe('Default')
  })

  test('should check if translation exists', () => {
    const i18n = new AstroI18n({
      locale: 'en',
      messages: {
        en: {
          exists: 'Yes',
        },
      },
    })

    expect(i18n.has('exists')).toBe(true)
    expect(i18n.has('missing')).toBe(false)
  })
})

describe('createI18n', () => {
  test('should create i18n instance', () => {
    const i18n = createI18n({
      locale: 'en',
      messages: {
        en: {
          greeting: 'Hello',
        },
      },
    })

    expect(i18n).toBeInstanceOf(AstroI18n)
    expect(i18n.t('greeting')).toBe('Hello')
  })
})

describe('Translation management', () => {
  test('should add translations dynamically', () => {
    const i18n = new AstroI18n({
      locale: 'en',
    })

    i18n.addTranslations('en', {
      newKey: 'New Value',
    })

    expect(i18n.t('newKey')).toBe('New Value')
  })

  test('should merge translations', () => {
    const i18n = new AstroI18n({
      locale: 'en',
      messages: {
        en: {
          existing: 'Existing',
        },
      },
    })

    i18n.mergeGlobalTranslations('en', {
      newKey: 'New',
    })

    expect(i18n.t('existing')).toBe('Existing')
    expect(i18n.t('newKey')).toBe('New')
  })

  test('should clear cache', () => {
    const i18n = new AstroI18n({
      locale: 'en',
      messages: {
        en: {
          test: 'Test',
        },
      },
    })

    expect(i18n.t('test')).toBe('Test')
    i18n.clearCache()
    // Cache clearing shouldn't affect loaded translations
    expect(i18n.t('test')).toBe('Test')
  })
})
