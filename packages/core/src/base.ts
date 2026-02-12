import type { CleanTranslation, Getter, MissingHandler, Params, PluralFunc, TranslationKey, Translations } from '@i18n-micro/types'
import { FormatService } from './format-service'
import { defaultPlural, interpolate } from './helpers'
import { type TranslationStorage, useTranslationHelper } from './translation'

export interface BaseI18nOptions {
  storage?: TranslationStorage
  plural?: PluralFunc
  missingWarn?: boolean
  missingHandler?: (locale: string, key: string, routeName: string) => void
  getCustomMissingHandler?: () => MissingHandler | null
}

/**
 * Abstract base class for i18n adapters
 *
 * Contains all common translation logic (t, ts, tc, tn, td, tdr, has).
 * Adapters must implement abstract methods to provide current state (locale, fallbackLocale, route).
 */
export abstract class BaseI18n {
  // Public fields (made public to allow type export in Nuxt plugins)
  public helper: ReturnType<typeof useTranslationHelper>
  public formatter = new FormatService()
  public pluralFunc: PluralFunc
  public missingWarn: boolean
  public missingHandler?: (locale: string, key: string, routeName: string) => void
  public getCustomMissingHandler?: () => MissingHandler | null

  constructor(options: BaseI18nOptions = {}) {
    this.helper = useTranslationHelper(options.storage)
    this.formatter = new FormatService()
    this.pluralFunc = options.plural || defaultPlural
    this.missingWarn = options.missingWarn ?? true
    this.missingHandler = options.missingHandler
    this.getCustomMissingHandler = options.getCustomMissingHandler
  }

  // --- Abstract methods (must be implemented by subclasses) ---

  /**
   * Get current locale
   */
  public abstract getLocale(): string

  /**
   * Get fallback locale
   */
  public abstract getFallbackLocale(): string

  /**
   * Get current route name
   */
  public abstract getRoute(): string

  // --- Public methods (implemented in base class) ---

  /**
   * Get translation for a key
   * Based on logic from src/runtime/plugins/01.plugin.ts
   */
  public t(key: TranslationKey, params?: Params, defaultValue?: string | null, routeName?: string): CleanTranslation {
    if (!key) return ''

    // Use abstract getters to get current state
    const locale = this.getLocale()
    const route = routeName || this.getRoute()

    // 1. Try to find translation in current locale
    // Note: In Nuxt runtime, server already merges global translations, so we don't need explicit fallback
    let value = this.helper.getTranslation<string>(locale, route, key)

    // 2. Fallback to fallbackLocale if not found and different (for non-Nuxt adapters)
    if (!value) {
      const fallbackLocale = this.getFallbackLocale()
      if (locale !== fallbackLocale) {
        value = this.helper.getTranslation<string>(fallbackLocale, route, key)
      }
    }

    // 3. Handle missing
    if (!value) {
      // Call custom handler if set (Nuxt runtime), otherwise use instance handler
      const customHandler = this.getCustomMissingHandler?.()
      if (customHandler) {
        customHandler(locale, key, route)
      } else if (this.missingHandler) {
        this.missingHandler(locale, key as string, route)
      } else if (this.missingWarn) {
        const isDev = process.env.NODE_ENV !== 'production'
        const isClient = typeof window !== 'undefined'
        if (isDev && isClient) {
          console.warn(`Not found '${key}' key in '${locale}' locale messages for route '${route}'.`)
        }
      }
      value = defaultValue === undefined ? key : defaultValue || key
    }

    // 4. Interpolate
    return typeof value === 'string' && params ? interpolate(value, params) : (value as CleanTranslation)
  }

  /**
   * Get translation as string
   */
  public ts(key: TranslationKey, params?: Params, defaultValue?: string, routeName?: string): string {
    const value = this.t(key, params, defaultValue, routeName)
    return value?.toString() ?? defaultValue ?? key
  }

  /**
   * Plural translation
   */
  public tc(key: TranslationKey, count: number | Params, defaultValue?: string): string {
    const { count: countValue, ...params } = typeof count === 'number' ? { count } : count

    if (countValue === undefined) {
      return defaultValue ?? key
    }

    // Getter passed to plural function
    const getter: Getter = (k: TranslationKey, p?: Params, dv?: string) => {
      return this.t(k, p, dv)
    }

    const result = this.pluralFunc(key, Number.parseInt(countValue.toString(), 10), params, this.getLocale(), getter)

    return result ?? defaultValue ?? key
  }

  /**
   * Format number
   */
  public tn(value: number, options?: Intl.NumberFormatOptions): string {
    return this.formatter.formatNumber(value, this.getLocale(), options)
  }

  /**
   * Format date
   */
  public td(value: Date | number | string, options?: Intl.DateTimeFormatOptions): string {
    return this.formatter.formatDate(value, this.getLocale(), options)
  }

  /**
   * Format relative time
   */
  public tdr(value: Date | number | string, options?: Intl.RelativeTimeFormatOptions): string {
    return this.formatter.formatRelativeTime(value, this.getLocale(), options)
  }

  /**
   * Check if translation exists
   * Based on logic from src/runtime/plugins/01.plugin.ts
   */
  public has(key: TranslationKey, routeName?: string): boolean {
    const route = routeName || this.getRoute()
    const locale = this.getLocale()

    // Check only through getTranslation (as in plugin)
    return !!this.helper.getTranslation(locale, route, key)
  }

  /**
   * Clear cache
   */
  public clearCache(): void {
    this.helper.clearCache()
  }

  // --- Public methods (for subclasses to use) ---

  /**
   * Core translation loading logic (without reactivity)
   * Subclasses can override addTranslations/addRouteTranslations to add reactivity
   */
  public loadTranslationsCore(locale: string, translations: Translations, merge: boolean): void {
    if (merge) {
      this.helper.mergeGlobalTranslation(locale, translations, true)
    } else {
      this.helper.setTranslations(locale, translations)
    }
  }

  /**
   * Core route translation loading logic (without reactivity)
   * Subclasses can override addRouteTranslations to add reactivity
   */
  public loadRouteTranslationsCore(locale: string, routeName: string, translations: Translations, merge: boolean): void {
    if (merge) {
      this.helper.mergeTranslation(locale, routeName, translations, true)
    } else {
      this.helper.loadPageTranslations(locale, routeName, translations)
    }
  }
}
