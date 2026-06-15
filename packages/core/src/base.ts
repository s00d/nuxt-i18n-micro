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

  // --- Protected hooks (subclasses may override) ---

  /**
   * Called before translation lookup — subclasses use for reactivity tracking.
   */
  protected touch(): void {}

  /**
   * Resolve route name from optional route context (string route name or adapter-specific object).
   */
  protected resolveRouteName(routeContext?: unknown): string {
    return typeof routeContext === 'string' ? routeContext : this.getRoute()
  }

  /**
   * Lookup translation value. Returns null when missing.
   */
  protected resolveLookup(key: TranslationKey, routeContext?: unknown): unknown | null {
    const locale = this.getLocale()
    const routeName = this.resolveRouteName(routeContext)

    let value = this.helper.getTranslation(locale, routeName, String(key))

    if (value === null) {
      const fallbackLocale = this.getFallbackLocale()
      if (locale !== fallbackLocale) {
        value = this.helper.getTranslation(fallbackLocale, routeName, String(key))
      }
    }

    return value
  }

  /**
   * Check if translation exists in lookup source.
   */
  protected resolveHas(key: TranslationKey, routeContext?: unknown): boolean {
    return this.resolveLookup(key, routeContext) !== null
  }

  /**
   * Context passed to missing-key handlers.
   */
  protected getMissingContext(routeContext?: unknown): { locale: string; routeName: string } {
    return { locale: this.getLocale(), routeName: this.resolveRouteName(routeContext) }
  }

  /**
   * Warn or invoke handler when translation is missing.
   */
  protected warnMissing(key: TranslationKey, routeContext?: unknown): void {
    const { locale, routeName } = this.getMissingContext(routeContext)
    const customHandler = this.getCustomMissingHandler?.()
    if (customHandler) {
      customHandler(locale, String(key), routeName)
      return
    }
    if (this.missingHandler) {
      this.missingHandler(locale, String(key), routeName)
      return
    }
    if (this.missingWarn) {
      const isDev = process.env.NODE_ENV !== 'production'
      const isClient = typeof window !== 'undefined'
      if (isDev && isClient) {
        console.warn(`Not found '${key}' key in '${locale}' locale messages for route '${routeName}'.`)
      }
    }
  }

  // --- Public methods (implemented in base class) ---

  /**
   * Get translation for a key
   */
  public t(key: TranslationKey, params?: Params, defaultValue?: string | null, routeContext?: unknown): CleanTranslation {
    if (!key) return ''

    this.touch()

    const resolved = this.resolveLookup(key, routeContext)

    if (resolved === null || resolved === undefined) {
      this.warnMissing(key, routeContext)
      const fallback = defaultValue === undefined ? key : defaultValue || key
      return fallback as CleanTranslation
    }

    if (typeof resolved !== 'string') return resolved as CleanTranslation
    if (!params) return resolved as CleanTranslation

    return interpolate(resolved, params) as CleanTranslation
  }

  /**
   * Get translation as string
   */
  public ts(key: TranslationKey, params?: Params, defaultValue?: string, routeContext?: unknown): string {
    const value = this.t(key, params, defaultValue, routeContext)
    return value?.toString() ?? defaultValue ?? key
  }

  /**
   * Plural translation
   */
  public tc(key: TranslationKey, count: number | Params, defaultValue?: string): string {
    this.touch()

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
    this.touch()
    return this.formatter.formatNumber(value, this.getLocale(), options)
  }

  /**
   * Format date
   */
  public td(value: Date | number | string, options?: Intl.DateTimeFormatOptions): string {
    this.touch()
    return this.formatter.formatDate(value, this.getLocale(), options)
  }

  /**
   * Format relative time
   */
  public tdr(value: Date | number | string, options?: Intl.RelativeTimeFormatOptions): string {
    this.touch()
    return this.formatter.formatRelativeTime(value, this.getLocale(), options)
  }

  /**
   * Check if translation exists
   */
  public has(key: TranslationKey, routeContext?: unknown): boolean {
    this.touch()
    return this.resolveHas(key, routeContext)
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
  public loadTranslationsCore(locale: string, translations: Translations, merge: boolean, routeName = 'index'): void {
    if (merge) {
      this.helper.mergeTranslation(locale, routeName, translations, true)
    } else {
      this.helper.setTranslations(locale, translations, routeName)
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
