import type { Locale } from '@i18n-micro/types'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { createApp } from 'vue'
import { createI18n, I18nDefaultLocaleKey, I18nLocalesKey, useI18n, VueI18n } from '../src'

// Suppress expected Vue warnings about router injection in tests
// These warnings are expected when router is not installed (e.g., in unit tests)
let warnSpy: ReturnType<typeof vi.spyOn> | undefined
const originalWarn = console.warn

beforeEach(() => {
  // Suppress Vue warnings about missing router injection
  // These are expected in tests where router is not set up
  warnSpy = vi.spyOn(console, 'warn').mockImplementation((message: string) => {
    // Only suppress router-related warnings
    if (
      typeof message === 'string' &&
      (message.includes('injection "Symbol(router)" not found') ||
        message.includes('injection "Symbol(route location)" not found') ||
        message.includes('RouterStrategy not found'))
    ) {
      return
    }
    // Let other warnings through using original function
    originalWarn(message)
  })
})

afterEach(() => {
  if (warnSpy) {
    warnSpy.mockRestore()
    warnSpy = undefined
  }
})

describe('VueI18n', () => {
  test('should handle route-specific translations', () => {
    const i18n = new VueI18n({
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
    const i18n = new VueI18n({
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
})

describe('useI18n composable', () => {
  const locales: Locale[] = [
    { code: 'en', displayName: 'English', iso: 'en-US' },
    { code: 'fr', displayName: 'Français', iso: 'fr-FR' },
  ]
  const defaultLocale = 'en'

  test('should return i18n instance with reactive locale', () => {
    const app = createApp({
      template: '<div></div>',
      setup() {
        const { locale } = useI18n()
        expect(locale.value).toBe('en')
        locale.value = 'fr'
        expect(locale.value).toBe('fr')
        return {}
      },
    })

    const i18nPlugin = createI18n({
      locale: 'en',
    })

    app.use(i18nPlugin)
    app.provide(I18nLocalesKey, locales)
    app.provide(I18nDefaultLocaleKey, defaultLocale)
    app.mount(document.createElement('div'))
  })

  test('should handle route-specific translations', () => {
    const app = createApp({
      template: '<div></div>',
      setup() {
        const { t, setRoute } = useI18n()
        setRoute('home')
        expect(t('title')).toBe('Home Title')
        setRoute('index')
        expect(t('title')).toBe('Global Title')
        return {}
      },
    })

    const i18nPlugin = createI18n({
      locale: 'en',
      messages: {
        en: {
          title: 'Global Title',
        },
      },
    })

    i18nPlugin.global.addRouteTranslations(
      'en',
      'home',
      {
        title: 'Home Title',
      },
      false,
    )

    app.use(i18nPlugin)
    app.provide(I18nLocalesKey, locales)
    app.provide(I18nDefaultLocaleKey, defaultLocale)
    app.mount(document.createElement('div'))
  })
})
