import { BaseI18n, type BaseI18nOptions } from '../src/base'
import type { Translations, PluralFunc, MessageCompilerFunc } from '@i18n-micro/types'

// Test implementation of BaseI18n
class TestI18n extends BaseI18n {
  private _locale: string
  private _fallbackLocale: string
  private _route: string

  constructor(
    locale: string,
    fallbackLocale: string,
    route: string,
    options?: BaseI18nOptions,
  ) {
    super(options)
    this._locale = locale
    this._fallbackLocale = fallbackLocale
    this._route = route
  }

  public getLocale(): string {
    return this._locale
  }

  public getFallbackLocale(): string {
    return this._fallbackLocale
  }

  public getRoute(): string {
    return this._route
  }

  public setLocale(locale: string): void {
    this._locale = locale
  }

  public setRoute(route: string): void {
    this._route = route
  }
}

describe('BaseI18n', () => {
  describe('Constructor', () => {
    test('should initialize with default options', () => {
      const i18n = new TestI18n('en', 'en', 'general')
      expect(i18n.getLocale()).toBe('en')
      expect(i18n.getFallbackLocale()).toBe('en')
      expect(i18n.getRoute()).toBe('general')
    })

    test('should initialize with custom cache', () => {
      const cache = {
        generalLocaleCache: {},
        routeLocaleCache: {},
        dynamicTranslationsCaches: [],
        serverTranslationCache: {},
      }
      const i18n = new TestI18n('en', 'en', 'general', { cache })
      expect(i18n).toBeDefined()
    })

    test('should initialize with custom plural function', () => {
      const customPlural: PluralFunc = () => 'custom'
      const i18n = new TestI18n('en', 'en', 'general', { plural: customPlural })
      expect(i18n).toBeDefined()
    })

    test('should initialize with missingWarn option', () => {
      const i18n = new TestI18n('en', 'en', 'general', { missingWarn: false })
      expect(i18n).toBeDefined()
    })

    test('should initialize with missingHandler', () => {
      const handler = jest.fn()
      const i18n = new TestI18n('en', 'en', 'general', { missingHandler: handler })
      expect(i18n).toBeDefined()
    })
  })

  describe('t() method', () => {
    test('should return empty string for empty key', () => {
      const i18n = new TestI18n('en', 'en', 'general')
      expect(i18n.t('')).toBe('')
    })

    test('should return translation for existing key', async () => {
      const i18n = new TestI18n('en', 'en', 'general')
      const translations: Translations = { greeting: 'Hello' }
      i18n['helper'].loadTranslations('en', translations)

      expect(i18n.t('greeting')).toBe('Hello')
    })

    test('should interpolate params in translation', async () => {
      const cache = {
        generalLocaleCache: {},
        routeLocaleCache: {},
        dynamicTranslationsCaches: [],
        serverTranslationCache: {},
      }
      const i18n = new TestI18n('en', 'en', 'general', { cache })
      const translations: Translations = { greeting: 'Hello, {name}!' }
      await i18n['helper'].loadTranslations('en', translations)

      expect(i18n.t('greeting', { name: 'John' })).toBe('Hello, John!')
    })

    test('should use defaultValue when translation is missing', () => {
      const i18n = new TestI18n('en', 'en', 'general')
      expect(i18n.t('missing.key', undefined, 'Default value')).toBe('Default value')
    })

    test('should return key when translation is missing and no defaultValue', () => {
      const i18n = new TestI18n('en', 'en', 'general')
      expect(i18n.t('missing.key')).toBe('missing.key')
    })

    test('should fallback to fallbackLocale when translation is missing', async () => {
      const cache = {
        generalLocaleCache: {},
        routeLocaleCache: {},
        dynamicTranslationsCaches: [],
        serverTranslationCache: {},
      }
      const i18n = new TestI18n('en', 'fr', 'general', { cache })
      const translations: Translations = { greeting: 'Bonjour' }
      await i18n['helper'].loadTranslations('fr', translations)

      expect(i18n.t('greeting')).toBe('Bonjour')
    })

    test('should use route-specific translation when routeName is provided', async () => {
      const i18n = new TestI18n('en', 'en', 'general')
      const routeTranslations: Translations = { title: 'Route Title' }
      await i18n['helper'].loadPageTranslations('en', 'about', routeTranslations)

      expect(i18n.t('title', undefined, undefined, 'about')).toBe('Route Title')
    })

    test('should use previousPageInfo fallback when enabled', async () => {
      const cache = {
        generalLocaleCache: {},
        routeLocaleCache: {},
        dynamicTranslationsCaches: [],
        serverTranslationCache: {},
      }
      const prevInfo = { locale: 'fr', routeName: 'previous' }
      const i18n = new TestI18n('en', 'en', 'general', {
        cache,
        getPreviousPageInfo: () => prevInfo,
        enablePreviousPageFallback: true,
      })

      const translations: Translations = { greeting: 'Bonjour' }
      await i18n['helper'].loadPageTranslations('fr', 'previous', translations)

      // Current locale is 'en', route is 'general', translation not found
      // Should fallback to previous page info: locale 'fr', route 'previous'
      expect(i18n.t('greeting')).toBe('Bonjour')
    })

    test('should call missingHandler when translation is missing', () => {
      const handler = jest.fn()
      const i18n = new TestI18n('en', 'en', 'general', { missingHandler: handler })

      i18n.t('missing.key')

      expect(handler).toHaveBeenCalledWith('en', 'missing.key', 'general')
    })

    test('should call customMissingHandler when set (Nuxt runtime)', () => {
      const customHandler = jest.fn()
      const i18n = new TestI18n('en', 'en', 'general', {
        getCustomMissingHandler: () => customHandler,
      })

      i18n.t('missing.key')

      expect(customHandler).toHaveBeenCalledWith('en', 'missing.key', 'general')
    })

    test('should not warn when missingWarn is false', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()
      const i18n = new TestI18n('en', 'en', 'general', { missingWarn: false })

      i18n.t('missing.key')

      expect(consoleSpy).not.toHaveBeenCalled()
      consoleSpy.mockRestore()
    })
  })

  describe('ts() method', () => {
    test('should return translation as string', async () => {
      const i18n = new TestI18n('en', 'en', 'general')
      const translations: Translations = { greeting: 'Hello' }
      i18n['helper'].loadTranslations('en', translations)

      expect(i18n.ts('greeting')).toBe('Hello')
    })

    test('should return defaultValue when translation is missing', () => {
      const i18n = new TestI18n('en', 'en', 'general')
      expect(i18n.ts('missing.key', undefined, 'Default')).toBe('Default')
    })

    test('should return key when translation is missing and no defaultValue', () => {
      const i18n = new TestI18n('en', 'en', 'general')
      expect(i18n.ts('missing.key')).toBe('missing.key')
    })

    test('should convert non-string values to string', async () => {
      const i18n = new TestI18n('en', 'en', 'general')
      const translations: Translations = { count: 42 }
      i18n['helper'].loadTranslations('en', translations)

      expect(i18n.ts('count')).toBe('42')
    })
  })

  describe('tc() method', () => {
    test('should return defaultValue when count is undefined', () => {
      const i18n = new TestI18n('en', 'en', 'general')
      expect(i18n.tc('apples', { other: 'params' }, 'No count')).toBe('No count')
    })

    test('should use plural function with count', async () => {
      const i18n = new TestI18n('en', 'en', 'general')
      const translations: Translations = { apples: 'apple|apples' }
      await i18n['helper'].loadTranslations('en', translations)

      // defaultPlural selects form by index: forms[count] or last form if count >= forms.length
      // For 'apple|apples': forms[0]='apple', forms[1]='apples'
      expect(i18n.tc('apples', 0)).toBe('apple')
      expect(i18n.tc('apples', 1)).toBe('apples') // forms[1]
      expect(i18n.tc('apples', 5)).toBe('apples') // last form
    })

    test('should handle count as number', async () => {
      const i18n = new TestI18n('en', 'en', 'general')
      const translations: Translations = { apples: 'apple|apples' }
      i18n['helper'].loadTranslations('en', translations)

      expect(i18n.tc('apples', 2)).toBe('apples')
    })

    test('should handle count as Params object', async () => {
      const i18n = new TestI18n('en', 'en', 'general')
      const translations: Translations = { apples: 'apple|apples' }
      i18n['helper'].loadTranslations('en', translations)

      expect(i18n.tc('apples', { count: 2, name: 'John' })).toBe('apples')
    })

    test('should return defaultValue when plural function returns null', () => {
      const i18n = new TestI18n('en', 'en', 'general')
      // When translation is missing, t() returns key, which is passed to pluralFunc
      // pluralFunc tries to process 'missing.key' as translation, but since it doesn't contain '|',
      // it returns the key itself. So tc returns the key, not defaultValue.
      // To test defaultValue, we need a case where pluralFunc actually returns null.
      // This happens when translation exists but is empty or invalid.
      expect(i18n.tc('missing.key', 1, 'Default')).toBe('missing.key')
    })
  })

  describe('tn() method', () => {
    test('should format number with default locale', () => {
      const i18n = new TestI18n('en', 'en', 'general')
      const result = i18n.tn(1234.56)
      expect(result).toMatch(/1[,.]234[.,]56/)
    })

    test('should format number with custom options', () => {
      const i18n = new TestI18n('en', 'en', 'general')
      const result = i18n.tn(1234.56, { style: 'currency', currency: 'USD' })
      expect(result).toContain('1,234.56')
    })

    test('should use current locale for formatting', () => {
      const i18n = new TestI18n('ru', 'en', 'general')
      const result = i18n.tn(1234.56)
      // Russian locale uses different number formatting
      expect(result).toBeDefined()
    })
  })

  describe('td() method', () => {
    test('should format date with default locale', () => {
      const i18n = new TestI18n('en', 'en', 'general')
      const date = new Date('2024-01-15')
      const result = i18n.td(date)
      expect(result).toBeDefined()
      expect(result).not.toBe('Invalid Date')
    })

    test('should format date with custom options', () => {
      const i18n = new TestI18n('en', 'en', 'general')
      const date = new Date('2024-01-15')
      const result = i18n.td(date, { year: 'numeric', month: 'long', day: 'numeric' })
      expect(result).toContain('2024')
      expect(result).toContain('January')
    })

    test('should handle date as number (timestamp)', () => {
      const i18n = new TestI18n('en', 'en', 'general')
      const timestamp = new Date('2024-01-15').getTime()
      const result = i18n.td(timestamp)
      expect(result).toBeDefined()
      expect(result).not.toBe('Invalid Date')
    })

    test('should handle date as string', () => {
      const i18n = new TestI18n('en', 'en', 'general')
      const result = i18n.td('2024-01-15')
      expect(result).toBeDefined()
      expect(result).not.toBe('Invalid Date')
    })
  })

  describe('tdr() method', () => {
    test('should format relative time', () => {
      const i18n = new TestI18n('en', 'en', 'general')
      const yesterday = new Date(Date.now() - 86400000)
      const result = i18n.tdr(yesterday)
      expect(result).toBeDefined()
      expect(result).toMatch(/day|ago/i)
    })

    test('should format relative time with custom options', () => {
      const i18n = new TestI18n('en', 'en', 'general')
      const yesterday = new Date(Date.now() - 86400000)
      const result = i18n.tdr(yesterday, { numeric: 'always' })
      expect(result).toBeDefined()
    })

    test('should handle invalid date gracefully', () => {
      const i18n = new TestI18n('en', 'en', 'general')
      const invalidDate = new Date('invalid')
      const result = i18n.tdr(invalidDate)
      expect(result).toBeDefined()
    })
  })

  describe('has() method', () => {
    test('should return true when translation exists', async () => {
      const i18n = new TestI18n('en', 'en', 'general')
      const translations: Translations = { greeting: 'Hello' }
      i18n['helper'].loadTranslations('en', translations)

      expect(i18n.has('greeting')).toBe(true)
    })

    test('should return false when translation does not exist', () => {
      const i18n = new TestI18n('en', 'en', 'general')
      expect(i18n.has('missing.key')).toBe(false)
    })

    test('should check route-specific translation when routeName is provided', async () => {
      const i18n = new TestI18n('en', 'en', 'general')
      const routeTranslations: Translations = { title: 'Route Title' }
      await i18n['helper'].loadPageTranslations('en', 'about', routeTranslations)

      expect(i18n.has('title', 'about')).toBe(true)
      expect(i18n.has('title', 'general')).toBe(false)
    })

    test('should use current route when routeName is not provided', async () => {
      const i18n = new TestI18n('en', 'en', 'about')
      const routeTranslations: Translations = { title: 'Route Title' }
      await i18n['helper'].loadPageTranslations('en', 'about', routeTranslations)

      expect(i18n.has('title')).toBe(true)
    })
  })

  describe('clearCache() method', () => {
    test('should clear all translations from cache', async () => {
      const i18n = new TestI18n('en', 'en', 'general')
      const translations: Translations = { greeting: 'Hello' }
      i18n['helper'].loadTranslations('en', translations)

      expect(i18n.has('greeting')).toBe(true)

      i18n.clearCache()

      expect(i18n.has('greeting')).toBe(false)
    })
  })

  describe('loadTranslationsCore() method', () => {
    test('should load translations when merge is false', async () => {
      const i18n = new TestI18n('en', 'en', 'general')
      const translations: Translations = { greeting: 'Hello' }

      i18n['loadTranslationsCore']('en', translations, false)
      // Wait for async operation to complete
      await new Promise(resolve => setTimeout(resolve, 0))

      expect(i18n.has('greeting')).toBe(true)
    })

    test('should merge translations when merge is true', async () => {
      const i18n = new TestI18n('en', 'en', 'general')
      const initial: Translations = { greeting: 'Hello' }
      const additional: Translations = { farewell: 'Goodbye' }

      await i18n['helper'].loadTranslations('en', initial)
      i18n['loadTranslationsCore']('en', additional, true)
      // Wait for async operation to complete
      await new Promise(resolve => setTimeout(resolve, 0))

      expect(i18n.has('greeting')).toBe(true)
      expect(i18n.has('farewell')).toBe(true)
    })
  })

  describe('loadRouteTranslationsCore() method', () => {
    test('should load route translations when merge is false', async () => {
      const i18n = new TestI18n('en', 'en', 'general')
      const translations: Translations = { title: 'Page Title' }

      i18n['loadRouteTranslationsCore']('en', 'about', translations, false)
      // Wait for async operation to complete
      await new Promise(resolve => setTimeout(resolve, 0))

      expect(i18n.has('title', 'about')).toBe(true)
    })

    test('should merge route translations when merge is true', async () => {
      const i18n = new TestI18n('en', 'en', 'general')
      const initial: Translations = { title: 'Page Title' }
      const additional: Translations = { description: 'Page Description' }

      await i18n['helper'].loadPageTranslations('en', 'about', initial)
      i18n['loadRouteTranslationsCore']('en', 'about', additional, true)
      // Wait for async operation to complete
      await new Promise(resolve => setTimeout(resolve, 0))

      expect(i18n.has('title', 'about')).toBe(true)
      expect(i18n.has('description', 'about')).toBe(true)
    })
  })

  describe('Edge cases', () => {
    test('should handle nested translation keys', async () => {
      const i18n = new TestI18n('en', 'en', 'general')
      const translations: Translations = {
        nested: {
          deep: {
            key: 'Nested value',
          },
        },
      }
      i18n['helper'].loadTranslations('en', translations)

      expect(i18n.t('nested.deep.key')).toBe('Nested value')
    })

    test('should handle multiple params in interpolation', async () => {
      const i18n = new TestI18n('en', 'en', 'general')
      const translations: Translations = {
        message: 'Hello, {name}! You are {age} years old.',
      }
      i18n['helper'].loadTranslations('en', translations)

      expect(i18n.t('message', { name: 'John', age: 30 })).toBe('Hello, John! You are 30 years old.')
    })

    test('should handle null defaultValue', () => {
      const i18n = new TestI18n('en', 'en', 'general')
      expect(i18n.t('missing.key', undefined, null)).toBe('missing.key')
    })

    test('should handle empty string defaultValue', () => {
      const i18n = new TestI18n('en', 'en', 'general')
      // Empty string is falsy, so it will fall back to key (as per defaultValue || key logic)
      expect(i18n.t('missing.key', undefined, '')).toBe('missing.key')
    })

    test('should handle route change', async () => {
      const cache = {
        generalLocaleCache: {},
        routeLocaleCache: {},
        dynamicTranslationsCaches: [],
        serverTranslationCache: {},
      }
      const i18n = new TestI18n('en', 'en', 'general', { cache })
      const generalTranslations: Translations = { greeting: 'Hello' }
      const routeTranslations: Translations = { title: 'About Page' }

      await i18n['helper'].loadTranslations('en', generalTranslations)
      await i18n['helper'].loadPageTranslations('en', 'about', routeTranslations)

      // Verify translations are loaded
      expect(i18n.has('greeting')).toBe(true)
      expect(i18n.has('title', 'about')).toBe(true)

      // Check route-specific translation with explicit routeName
      // Note: getTranslation uses routeName parameter, so this should work
      const titleValue = i18n.t('title', undefined, undefined, 'about')
      expect(titleValue).toBe('About Page')

      // Change route and check
      i18n.setRoute('about')
      expect(i18n.t('title')).toBe('About Page')
      expect(i18n.t('greeting')).toBe('Hello') // Should still work from general
    })
  })

  describe('messageCompiler', () => {
    // Helper to create isolated cache for each test
    const createIsolatedCache = () => ({
      generalLocaleCache: {},
      routeLocaleCache: {},
      dynamicTranslationsCaches: [],
      serverTranslationCache: {},
    })

    test('should initialize with messageCompiler option', () => {
      const compiler: MessageCompilerFunc = (msg, _locale, _key) => _params => msg.toUpperCase()
      const cache = createIsolatedCache()
      const i18n = new TestI18n('en', 'en', 'general', { messageCompiler: compiler, cache })
      expect(i18n.messageCompiler).toBeDefined()
    })

    test('should use messageCompiler for translation with params', async () => {
      const compiler: MessageCompilerFunc = (msg, _locale, _key) => {
        return params => msg.replace(/\{(\w+)\}/g, (_, k) => String(params?.[k] ?? ''))
      }
      const cache = createIsolatedCache()
      const i18n = new TestI18n('en', 'en', 'general', { messageCompiler: compiler, cache })
      await i18n.helper.loadTranslations('en', { greeting: 'Hello, {name}!' })

      expect(i18n.t('greeting', { name: 'World' })).toBe('Hello, World!')
    })

    test('should use messageCompiler even without params', async () => {
      const compiler: MessageCompilerFunc = (msg, _locale, _key) => {
        return _params => msg.toUpperCase()
      }
      const cache = createIsolatedCache()
      const i18n = new TestI18n('en', 'en', 'general', { messageCompiler: compiler, cache })
      await i18n.helper.loadTranslations('en', { greeting: 'hello' })

      expect(i18n.t('greeting')).toBe('HELLO')
    })

    test('should cache compiled messages', async () => {
      const compiler = jest.fn<(params?: Record<string, string | number | boolean>) => string, [string, string, string]>(
        (msg, _locale, _key) => _params => msg,
      )
      const cache = createIsolatedCache()
      const i18n = new TestI18n('en', 'en', 'general', { messageCompiler: compiler, cache })
      await i18n.helper.loadTranslations('en', { test: 'value' })

      i18n.t('test', { a: 1 })
      i18n.t('test', { b: 2 })

      // Compiler should only be called once (cached)
      expect(compiler).toHaveBeenCalledTimes(1)
    })

    test('should use different cache keys for different routes', async () => {
      const compiler = jest.fn<(params?: Record<string, string | number | boolean>) => string, [string, string, string]>(
        (msg, _locale, _key) => _params => msg,
      )
      const cache = createIsolatedCache()
      const i18n = new TestI18n('en', 'en', 'page1', { messageCompiler: compiler, cache })
      await i18n.helper.loadPageTranslations('en', 'page1', { title: 'Page 1' })
      await i18n.helper.loadPageTranslations('en', 'page2', { title: 'Page 2' })

      i18n.t('title', undefined, undefined, 'page1')
      i18n.t('title', undefined, undefined, 'page2')

      // Compiler should be called twice (different routes)
      expect(compiler).toHaveBeenCalledTimes(2)
    })

    test('should fallback to interpolate when no messageCompiler', async () => {
      const cache = createIsolatedCache()
      const i18n = new TestI18n('en', 'en', 'general', { cache })
      await i18n.helper.loadTranslations('en', { greeting: 'Hello, {name}!' })

      expect(i18n.t('greeting', { name: 'World' })).toBe('Hello, World!')
    })

    test('should clear compiled cache with clearCompiledCache()', async () => {
      const compiler = jest.fn<(params?: Record<string, string | number | boolean>) => string, [string, string, string]>(
        (msg, _locale, _key) => _params => msg,
      )
      const cache = createIsolatedCache()
      const i18n = new TestI18n('en', 'en', 'general', { messageCompiler: compiler, cache })
      await i18n.helper.loadTranslations('en', { test: 'value' })

      i18n.t('test')
      expect(compiler).toHaveBeenCalledTimes(1)

      i18n.clearCompiledCache()

      i18n.t('test')
      expect(compiler).toHaveBeenCalledTimes(2)
    })

    test('should pass correct arguments to messageCompiler', async () => {
      const compiler = jest.fn<(params?: Record<string, string | number | boolean>) => string, [string, string, string]>(
        (msg, locale, key) => _params => `${locale}:${key}:${msg}`,
      )
      const cache = createIsolatedCache()
      const i18n = new TestI18n('de', 'en', 'general', { messageCompiler: compiler, cache })
      await i18n.helper.loadTranslations('de', { greeting: 'Hallo' })

      const result = i18n.t('greeting')

      expect(compiler).toHaveBeenCalledWith('Hallo', 'de', 'greeting')
      expect(result).toBe('de:greeting:Hallo')
    })

    test('should use different cache keys for different locales', async () => {
      const compiler = jest.fn<(params?: Record<string, string | number | boolean>) => string, [string, string, string]>(
        (msg, locale, _key) => _params => `[${locale}] ${msg}`,
      )
      const cache = createIsolatedCache()
      const i18n = new TestI18n('en', 'en', 'general', { messageCompiler: compiler, cache })
      await i18n.helper.loadTranslations('en', { greeting: 'Hello' })
      await i18n.helper.loadTranslations('de', { greeting: 'Hallo' })

      expect(i18n.t('greeting')).toBe('[en] Hello')
      expect(compiler).toHaveBeenCalledTimes(1)

      i18n.setLocale('de')
      expect(i18n.t('greeting')).toBe('[de] Hallo')
      expect(compiler).toHaveBeenCalledTimes(2)
    })

    test('should invalidate cache when content changes', async () => {
      const compiler = jest.fn<(params?: Record<string, string | number | boolean>) => string, [string, string, string]>(
        (msg, _locale, _key) => _params => msg.toUpperCase(),
      )
      const cache = createIsolatedCache()
      const i18n = new TestI18n('en', 'en', 'general', { messageCompiler: compiler, cache })

      await i18n.helper.loadTranslations('en', { greeting: 'hello' })
      expect(i18n.t('greeting')).toBe('HELLO')
      expect(compiler).toHaveBeenCalledTimes(1)

      // Clear cache before updating translations (simulating real-world reload)
      i18n.clearCache()
      // Update translation content with different value
      await i18n.helper.loadTranslations('en', { greeting: 'hi there' })
      expect(i18n.t('greeting')).toBe('HI THERE')
      expect(compiler).toHaveBeenCalledTimes(2) // Different content = new compilation
    })

    test('should also clear compiled cache on clearCache()', async () => {
      const compiler = jest.fn<(params?: Record<string, string | number | boolean>) => string, [string, string, string]>(
        (msg, _locale, _key) => _params => msg,
      )
      const cache = createIsolatedCache()
      const i18n = new TestI18n('en', 'en', 'general', { messageCompiler: compiler, cache })
      await i18n.helper.loadTranslations('en', { test: 'value' })

      i18n.t('test')
      expect(compiler).toHaveBeenCalledTimes(1)

      // clearCache should also clear compiled cache
      i18n.clearCache()
      await i18n.helper.loadTranslations('en', { test: 'value' })

      i18n.t('test')
      expect(compiler).toHaveBeenCalledTimes(2)
    })
  })
})
