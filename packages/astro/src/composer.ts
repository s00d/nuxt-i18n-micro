import {
  BaseI18n,
  type TranslationCache,
} from '@i18n-micro/core'
import type {
  Translations,
  PluralFunc,
} from '@i18n-micro/types'

export interface AstroI18nOptions {
  locale: string
  fallbackLocale?: string
  messages?: Record<string, Translations>
  plural?: PluralFunc
  missingWarn?: boolean
  missingHandler?: (locale: string, key: string, routeName: string) => void
  // NEW: Allow passing existing cache
  _cache?: TranslationCache
}

export class AstroI18n extends BaseI18n {
  private _locale: string
  private _fallbackLocale: string
  private _currentRoute: string

  // Cache for Core (without Vue reactivity)
  public readonly cache: TranslationCache

  // Save initial translations to restore after clearCache
  private initialMessages: Record<string, Translations> = {}

  constructor(options: AstroI18nOptions) {
    // If existing cache is passed (from global instance), use it
    // Otherwise create new one
    const cache: TranslationCache = options._cache || {
      generalLocaleCache: {},
      routeLocaleCache: {},
      dynamicTranslationsCaches: [],
      serverTranslationCache: {},
    }

    // Call parent constructor with options
    super({
      cache,
      plural: options.plural,
      missingWarn: options.missingWarn,
      missingHandler: options.missingHandler,
    })

    // Assign cache to public readonly property
    this.cache = cache

    this._locale = options.locale
    this._fallbackLocale = options.fallbackLocale || options.locale
    this._currentRoute = 'general'

    // Load initial messages (only if this is primary initialization or adding new ones)
    if (options.messages) {
      // Save initial translations to restore after clearCache
      this.initialMessages = { ...options.messages }
      for (const [lang, msgs] of Object.entries(options.messages)) {
        this.helper.loadTranslations(lang, msgs)
      }
    }
  }

  /**
   * Clone cache with shallow copy to prevent memory leaks
   * Each request-scoped instance gets its own cache structure,
   * but can read from the global cache (read-only access to existing translations)
   */
  private cloneCache(sourceCache: TranslationCache): TranslationCache {
    // Helper to get value from RefLike or plain value
    const getValue = <T>(refOrValue: T | { value: T }): T => {
      return typeof refOrValue === 'object' && refOrValue !== null && 'value' in refOrValue
        ? (refOrValue as { value: T }).value
        : refOrValue as T
    }

    // Get actual values from cache (handling RefLike)
    const generalCache = getValue(sourceCache.generalLocaleCache)
    const routeCache = getValue(sourceCache.routeLocaleCache)
    const dynamicCaches = getValue(sourceCache.dynamicTranslationsCaches)
    const serverCache = getValue(sourceCache.serverTranslationCache)

    // Create new cache structure with shallow copy of existing translations
    // This allows read-only access to global translations while isolating writes
    return {
      generalLocaleCache: { ...generalCache },
      routeLocaleCache: { ...routeCache },
      dynamicTranslationsCaches: [...dynamicCaches],
      serverTranslationCache: { ...serverCache },
    }
  }

  /**
   * Create a request-scoped instance with isolated cache
   * Prevents memory leaks by isolating per-request translations from global cache
   */
  public clone(newLocale?: string): AstroI18n {
    // Create isolated cache for this request to prevent memory leaks
    // The new cache can read from global translations (shallow copy),
    // but writes (addTranslations, addRouteTranslations) won't affect global cache
    const isolatedCache = this.cloneCache(this.cache)

    return new AstroI18n({
      locale: newLocale || this._locale,
      fallbackLocale: this._fallbackLocale,
      plural: this.pluralFunc,
      missingWarn: this.missingWarn,
      missingHandler: this.missingHandler,
      _cache: isolatedCache, // Isolated cache to prevent memory leaks
    })
  }

  // Getter/Setter for locale
  get locale(): string {
    return this._locale
  }

  set locale(val: string) {
    this._locale = val
  }

  // Getter/Setter for fallback locale
  get fallbackLocale(): string {
    return this._fallbackLocale
  }

  set fallbackLocale(val: string) {
    this._fallbackLocale = val
  }

  // Getter/Setter for current route
  get currentRoute(): string {
    return this._currentRoute
  }

  setRoute(routeName: string): void {
    this._currentRoute = routeName
  }

  // --- Implementation of abstract methods ---

  public getLocale(): string {
    return this._locale
  }

  public getFallbackLocale(): string {
    return this._fallbackLocale
  }

  public getRoute(): string {
    return this._currentRoute
  }

  /**
   * Get route-specific translations for a given locale and route
   * This method encapsulates the cache key format, making it safe to use
   * without direct cache access
   */
  public getRouteTranslations(locale: string, routeName: string): Translations | null {
    const cacheKey = `${locale}:${routeName}`
    const routeCache = this.cache.routeLocaleCache

    // Cache is a plain object in AstroI18n (not Vue ref)
    if (routeCache && typeof routeCache === 'object' && !Array.isArray(routeCache)) {
      return (routeCache as Record<string, Translations>)[cacheKey] || null
    }

    return null
  }

  // Methods for adding translations
  public addTranslations(locale: string, translations: Translations, merge: boolean = true): void {
    super.loadTranslationsCore(locale, translations, merge)
  }

  public addRouteTranslations(
    locale: string,
    routeName: string,
    translations: Translations,
    merge: boolean = true,
  ): void {
    super.loadRouteTranslationsCore(locale, routeName, translations, merge)
  }

  public mergeTranslations(locale: string, routeName: string, translations: Translations): void {
    this.helper.mergeTranslation(locale, routeName, translations, true)
  }

  public mergeGlobalTranslations(locale: string, translations: Translations): void {
    this.helper.mergeGlobalTranslation(locale, translations, true)
  }

  public override clearCache(): void {
    // Save initial translations before clearing
    const initialMessages = { ...this.initialMessages }

    // Clear cache
    super.clearCache()

    // Restore initial translations
    if (Object.keys(initialMessages).length > 0) {
      for (const [lang, msgs] of Object.entries(initialMessages)) {
        this.helper.loadTranslations(lang, msgs)
      }
    }
  }
}
