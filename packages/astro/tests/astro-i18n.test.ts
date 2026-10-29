import { describe, expect, test } from 'vitest'
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

    i18n.setRoute('index')
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
})
