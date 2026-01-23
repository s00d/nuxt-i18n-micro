import { useTranslationHelper, type TranslationCache } from './translation'
import { FormatService } from './format-service'
import { interpolate, defaultPlural } from './helpers'
import type {
  Translations,
  Params,
  PluralFunc,
  Getter,
  CleanTranslation,
  TranslationKey,
  MissingHandler,
} from '@i18n-micro/types'

/**
 * Cache for compiled message functions
 * Used to store compiled translation functions to avoid recompilation
 */
export type CompiledMessageCache = Map<string, (params?: Params) => CleanTranslation>

/**
 * Create a new compiled message cache instance
 */
export function createCompiledCache(): CompiledMessageCache {
  return new Map()
}

export interface BaseI18nOptions {
  cache?: TranslationCache
  compiledCache?: CompiledMessageCache
  plural?: PluralFunc
  missingWarn?: boolean
  missingHandler?: (locale: string, key: string, routeName: string) => void
  // Optional hooks for Nuxt runtime specific features
  getPreviousPageInfo?: () => { locale: string, routeName: string } | null
  getCustomMissingHandler?: () => MissingHandler | null
  enablePreviousPageFallback?: boolean
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
  // Optional hooks for Nuxt runtime specific features
  public getPreviousPageInfo?: () => { locale: string, routeName: string } | null
  public getCustomMissingHandler?: () => MissingHandler | null
  public enablePreviousPageFallback: boolean
  public compiledMessageCache: CompiledMessageCache

  constructor(options: BaseI18nOptions = {}) {
    this.helper = useTranslationHelper(options.cache)
    this.formatter = new FormatService()
    this.pluralFunc = options.plural || defaultPlural
    this.missingWarn = options.missingWarn ?? true
    this.missingHandler = options.missingHandler
    this.getPreviousPageInfo = options.getPreviousPageInfo
    this.getCustomMissingHandler = options.getCustomMissingHandler
    this.enablePreviousPageFallback = options.enablePreviousPageFallback ?? false
    // Use provided cache or create a new one
    this.compiledMessageCache = options.compiledCache || createCompiledCache()
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
  public t(
    key: TranslationKey,
    params?: Params,
    defaultValue?: string | null,
    routeName?: string,
    locale?: string,
  ): CleanTranslation {
    if (!key) return ''

    // Priority: passed locale -> abstract getter
    const currentLocale = locale || this.getLocale()
    const currentRoute = routeName || this.getRoute()

    // 1. Try to find translation in current locale
    // Note: In Nuxt runtime, server already merges global translations, so we don't need explicit fallback
    let value = this.helper.getTranslation<string>(currentLocale, currentRoute, key)

    // 2. If translation not found and there are saved previous translations, use them (only if enabled)
    if (!value && this.enablePreviousPageFallback && this.getPreviousPageInfo) {
      const prev = this.getPreviousPageInfo()
      if (prev) {
        const prevValue = this.helper.getTranslation<string>(prev.locale, prev.routeName, key)
        if (prevValue) {
          value = prevValue
          if (process.env.NODE_ENV !== 'production') {
            console.log(`Using fallback translation from previous route: ${prev.routeName} -> ${key}`)
          }
        }
      }
    }

    // 3. Fallback to fallbackLocale if not found and different (for non-Nuxt adapters)
    if (!value) {
      const fallbackLocale = this.getFallbackLocale()
      if (currentLocale !== fallbackLocale) {
        value = this.helper.getTranslation<string>(fallbackLocale, currentRoute, key)
      }
    }

    // 4. Handle missing
    if (!value) {
      // Call custom handler if set (Nuxt runtime), otherwise use instance handler
      const customHandler = this.getCustomMissingHandler?.()
      if (customHandler) {
        customHandler(currentLocale, key, currentRoute)
      }
      else if (this.missingHandler) {
        this.missingHandler(currentLocale, key as string, currentRoute)
      }
      else if (this.missingWarn) {
        const isDev = process.env.NODE_ENV !== 'production'
        const isClient = typeof window !== 'undefined'
        if (isDev && isClient) {
          console.warn(`Not found '${key}' key in '${currentLocale}' locale messages for route '${currentRoute}'.`)
        }
      }
      value = defaultValue === undefined ? key : (defaultValue || key)
    }

    // 5. Interpolate
    return typeof value === 'string' && params ? interpolate(value, params) : value as CleanTranslation
  }

  /**
   * Get translation as string
   */
  public ts(
    key: TranslationKey,
    params?: Params,
    defaultValue?: string,
    routeName?: string,
  ): string {
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

    const result = this.pluralFunc(
      key,
      Number.parseInt(countValue.toString()),
      params,
      this.getLocale(),
      getter,
    )

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

  /**
   * Clear compiled message cache
   */
  public clearCompiledCache(): void {
    this.compiledMessageCache.clear()
  }

  // --- Public methods (for subclasses to use) ---

  /**
   * Core translation loading logic (without reactivity)
   * Subclasses can override addTranslations/addRouteTranslations to add reactivity
   */
  public loadTranslationsCore(locale: string, translations: Translations, merge: boolean): void {
    if (merge) {
      this.helper.mergeGlobalTranslation(locale, translations, true)
    }
    else {
      this.helper.loadTranslations(locale, translations)
    }
  }

  /**
   * Core route translation loading logic (without reactivity)
   * Subclasses can override addRouteTranslations to add reactivity
   */
  public loadRouteTranslationsCore(
    locale: string,
    routeName: string,
    translations: Translations,
    merge: boolean,
  ): void {
    if (merge) {
      this.helper.mergeTranslation(locale, routeName, translations, true)
    }
    else {
      this.helper.loadPageTranslations(locale, routeName, translations)
    }
  }
}
