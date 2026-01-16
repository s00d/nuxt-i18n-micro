import { createI18n, I18n } from '../src'
import { join } from 'node:path'
import type { MessageCompilerFunc } from '@i18n-micro/types'

describe('I18n (Simple API)', () => {
  const translations = {
    en: {
      greeting: 'Hello, {name}!',
      nested: {
        message: 'This is a nested message.',
      },
      apples: 'no apples|one apple|{count} apples',
      welcome: 'Welcome',
    },
    de: {
      greeting: 'Hallo, {name}!',
      welcome: 'Willkommen',
    },
  }

  describe('createI18n', () => {
    test('creates I18n instance with default options', () => {
      const i18n = createI18n({
        locale: 'en',
      })
      expect(i18n).toBeInstanceOf(I18n)
      expect(i18n.locale).toBe('en')
    })

    test('creates I18n instance and loads translations', () => {
      const i18n = createI18n({
        locale: 'en',
      })
      i18n.addTranslations('en', translations.en)
      expect(i18n.t('welcome')).toBe('Welcome')
    })
  })

  describe('t() method', () => {
    test('returns translation for simple key', () => {
      const i18n = createI18n({
        locale: 'en',
      })
      i18n.addTranslations('en', translations.en)
      expect(i18n.t('welcome')).toBe('Welcome')
    })

    test('returns translation with interpolation', () => {
      const i18n = createI18n({
        locale: 'en',
      })
      i18n.addTranslations('en', translations.en)
      expect(i18n.t('greeting', { name: 'John' })).toBe('Hello, John!')
    })

    test('returns translation for nested key', () => {
      const i18n = createI18n({
        locale: 'en',
      })
      i18n.addTranslations('en', translations.en)
      expect(i18n.t('nested.message')).toBe('This is a nested message.')
    })

    test('returns key if translation not found', () => {
      const i18n = createI18n({
        locale: 'en',
      })
      i18n.addTranslations('en', translations.en)
      expect(i18n.t('nonexistent.key')).toBe('nonexistent.key')
    })

    test('falls back to fallbackLocale if translation not found', () => {
      const i18n = createI18n({
        locale: 'de',
        fallbackLocale: 'en',
      })
      i18n.addTranslations('en', translations.en)
      i18n.addTranslations('de', translations.de)
      // 'nested.message' only exists in 'en'
      expect(i18n.t('nested.message')).toBe('This is a nested message.')
    })
  })

  describe('tc() method - pluralization', () => {
    test('returns correct plural form', () => {
      const i18n = createI18n({
        locale: 'en',
      })
      i18n.addTranslations('en', translations.en)
      expect(i18n.tc('apples', 0)).toBe('no apples')
      expect(i18n.tc('apples', 1)).toBe('one apple')
      expect(i18n.tc('apples', 5)).toBe('5 apples')
    })
  })

  describe('addTranslations', () => {
    test('adds translations dynamically', () => {
      const i18n = createI18n({
        locale: 'en',
      })
      i18n.addTranslations('en', translations.en)
      expect(i18n.t('welcome')).toBe('Welcome')
    })

    test('merges with existing translations', () => {
      const i18n = createI18n({
        locale: 'en',
      })
      i18n.addTranslations('en', { greeting: 'Hello' })
      i18n.addTranslations('en', { welcome: 'Welcome' })
      expect(i18n.t('greeting')).toBe('Hello')
      expect(i18n.t('welcome')).toBe('Welcome')
    })
  })

  describe('addRouteTranslations', () => {
    test('adds route-specific translations', () => {
      // Suppress expected warning for mergeTranslation without pre-loading
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})

      const i18n = createI18n({
        locale: 'en',
      })
      i18n.addTranslations('en', translations.en)
      i18n.addRouteTranslations('en', 'home', { title: 'Home Page' })
      expect(i18n.t('title', undefined, undefined, 'home')).toBe('Home Page')

      warnSpy.mockRestore()
    })
  })

  describe('currentRoute and setRoute/getRoute', () => {
    test('defaults to general route', () => {
      const i18n = createI18n({
        locale: 'en',
      })
      expect(i18n.currentRoute).toBe('general')
      expect(i18n.getRoute()).toBe('general')
    })

    test('setRoute changes current route', () => {
      const i18n = createI18n({
        locale: 'en',
      })
      i18n.setRoute('home')
      expect(i18n.currentRoute).toBe('home')
      expect(i18n.getRoute()).toBe('home')
    })

    test('t() uses currentRoute by default', () => {
      // Suppress expected warning for mergeTranslation without pre-loading
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})

      const i18n = createI18n({
        locale: 'en',
      })
      i18n.addTranslations('en', translations.en)
      i18n.addRouteTranslations('en', 'home', { title: 'Home Page' })

      // Default route (general) doesn't have 'title'
      expect(i18n.t('title')).toBe('title')

      // Set route to 'home'
      i18n.setRoute('home')
      expect(i18n.t('title')).toBe('Home Page')

      // Can still override with explicit routeName
      expect(i18n.t('title', undefined, undefined, 'general')).toBe('title')

      warnSpy.mockRestore()
    })
  })

  describe('loadTranslations', () => {
    test('loads translations from directory structure', async () => {
      // This test would require actual file system setup
      // For now, we test the method exists and doesn't throw
      const i18n = createI18n({
        locale: 'en',
        translationDir: join(__dirname, '../test-locales'),
      })

      // Should not throw even if directory doesn't exist
      await expect(i18n.loadTranslations()).resolves.not.toThrow()
    })
  })

  describe('locale management', () => {
    test('getter and setter work', () => {
      const i18n = createI18n({
        locale: 'en',
      })
      i18n.addTranslations('en', translations.en)
      i18n.addTranslations('de', translations.de)
      expect(i18n.locale).toBe('en')
      i18n.locale = 'de'
      expect(i18n.locale).toBe('de')
      expect(i18n.t('welcome')).toBe('Willkommen')
    })
  })

  describe('reload', () => {
    test('clears cache and reloads translations', async () => {
      const i18n = createI18n({
        locale: 'en',
        translationDir: './test-locales',
      })
      i18n.addTranslations('en', translations.en)
      expect(i18n.t('welcome')).toBe('Welcome')

      // Reload should clear and attempt to reload (even if directory doesn't exist)
      await expect(i18n.reload()).resolves.not.toThrow()
    })
  })

  describe('messageCompiler', () => {
    test('should use messageCompiler when provided', () => {
      const compiler = jest.fn<(params?: Record<string, string | number | boolean>) => string, [string, string, string]>(
        (msg: string) => () => msg.toUpperCase(),
      ) as MessageCompilerFunc
      const i18n = createI18n({
        locale: 'en',
        messageCompiler: compiler,
      })
      i18n.addTranslations('en', translations.en)

      const result = i18n.t('welcome')
      expect(result).toBe('WELCOME')
      expect(compiler).toHaveBeenCalledWith('Welcome', 'en', 'welcome')
    })

    test('should cache compiled messages', () => {
      const compiler = jest.fn<(params?: Record<string, string | number | boolean>) => string, [string, string, string]>(
        (msg: string) => () => msg.toUpperCase(),
      ) as MessageCompilerFunc
      const i18n = createI18n({
        locale: 'en',
        messageCompiler: compiler,
      })
      i18n.addTranslations('en', translations.en)

      i18n.t('welcome')
      i18n.t('welcome')
      i18n.t('welcome')

      // Compiler should be called only once due to caching
      expect(compiler).toHaveBeenCalledTimes(1)
    })

    test('should recompile when message changes', () => {
      const compiler = jest.fn<(params?: Record<string, string | number | boolean>) => string, [string, string, string]>(
        (msg: string) => () => msg.toUpperCase(),
      ) as MessageCompilerFunc
      const i18n = createI18n({
        locale: 'en',
        messageCompiler: compiler,
      })
      i18n.addTranslations('en', { greeting: 'hello' })

      i18n.t('greeting')
      i18n.addTranslations('en', { greeting: 'hi there' }, false)
      i18n.t('greeting')

      // Compiler should be called twice (different messages)
      expect(compiler).toHaveBeenCalledTimes(2)
    })

    test('should use correct locale when falling back to fallbackLocale', () => {
      const compiler = jest.fn<(params?: Record<string, string | number | boolean>) => string, [string, string, string]>(
        (msg: string, locale: string) => () => `[${locale}]${msg}`,
      ) as MessageCompilerFunc
      const i18n = createI18n({
        locale: 'de',
        fallbackLocale: 'en',
        messageCompiler: compiler,
      })
      i18n.addTranslations('en', { greeting: 'Hello' })
      i18n.addTranslations('de', {})

      const result = i18n.t('greeting')
      // Should use fallback locale 'en' for compilation
      expect(result).toBe('[en]Hello')
      expect(compiler).toHaveBeenCalledWith('Hello', 'en', 'greeting')
    })

    test('should fallback to interpolation when messageCompiler throws', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})
      const compiler = jest.fn<(params?: Record<string, string | number | boolean>) => string, [string, string, string]>(
        () => {
          throw new Error('Compiler error')
        },
      ) as MessageCompilerFunc
      const i18n = createI18n({
        locale: 'en',
        messageCompiler: compiler,
      })
      i18n.addTranslations('en', translations.en)

      const result = i18n.t('greeting', { name: 'John' })
      expect(result).toBe('Hello, John!')
      expect(consoleWarnSpy).toHaveBeenCalled()

      consoleWarnSpy.mockRestore()
    })
  })
})
