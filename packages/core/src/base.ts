import type { CleanTranslation, Getter, MissingHandler, Params, PluralFunc, TranslationKey, Translations } from '@i18n-micro/types'
import { FormatService, type DateTimeFormatsConfig, type FormatServiceOptions, type NumberFormatsConfig } from './format-service'
import { defaultPlural, interpolate, mergeTranslationLayers, setTranslationAtKey } from './helpers'
import { type TranslationStorage, useTranslationHelper } from './translation'

export interface BaseI18nOptions {
  storage?: TranslationStorage
  plural?: PluralFunc
  missingWarn?: boolean
  missingHandler?: (locale: string, key: string, routeName: string) => void
  getCustomMissingHandler?: () => MissingHandler | null
  /** Named number formats per locale (Vue I18n-compatible). */
  numberFormats?: NumberFormatsConfig
  /** Named datetime formats per locale (Vue I18n-compatible `datetimeFormats`). */
  datetimeFormats?: DateTimeFormatsConfig
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

  /**
   * Set on the server when the SSR payload should carry only the keys the render
   * actually used. `null` on the client and in `chunk` mode, so the lookup path
   * stays a plain property read.
   */

  constructor(options: BaseI18nOptions = {}) {
    this.helper = useTranslationHelper(options.storage)
    const formatOptions: FormatServiceOptions = {
      numberFormats: options.numberFormats,
      datetimeFormats: options.datetimeFormats,
    }
    this.formatter = new FormatService(formatOptions)
    // Custom plural returning null/undefined chains to defaultPlural (#241).
    // Skip the wrapper when the caller already passed the built-in (module default).
    this.pluralFunc =
      options.plural && options.plural !== defaultPlural
        ? (key, count, params, locale, getter) => {
            const custom = options.plural!(key, count, params, locale, getter)
            return custom ?? defaultPlural(key, count, params, locale, getter)
          }
        : defaultPlural
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

    const value = this.helper.getTranslation(locale, routeName, String(key))
    if (value !== null) return value

    const fallbackLocale = this.getFallbackLocale()
    if (locale !== fallbackLocale) {
      return this.helper.getTranslation(fallbackLocale, routeName, String(key))
    }

    return null
  }

  /**
   * Check if translation exists in lookup source.
   */
  protected resolveHas(key: TranslationKey, routeContext?: unknown): boolean {
    const locale = this.getLocale()
    const routeName = this.resolveRouteName(routeContext)
    return this.helper.getTranslation(locale, routeName, String(key)) !== null
  }

  /**
   * Two live layers as one tree, via {@link mergeTranslationLayers}.
   *
   * Used when the hot path keeps two objects instead of merging them — the fallback locale,
   * or the Nuxt page-transition layer — so the dump answers what `t()` answers.
   */
  protected resolveTranslationTree(lower: Record<string, unknown>, upper: Record<string, unknown>): Translations {
    return mergeTranslationLayers(lower, upper) as Translations
  }

  /**
   * Dump of what `t()` can resolve right now for the active locale and route.
   *
   * Live tree, not a clone — read-only; mutate via {@link setTranslation} / merge helpers.
   * When a second layer is live (fallback locale, Nuxt transition hot-reload), walks both
   * through {@link resolveTranslationTree} so the dump matches `t()`.
   */
  public resolveTranslations(routeContext?: unknown): Translations {
    this.touch()
    const locale = this.getLocale()
    const routeName = this.resolveRouteName(routeContext)
    const active = (this.helper.getCache(locale, routeName) ?? {}) as Record<string, unknown>

    const fallbackLocale = this.getFallbackLocale()
    if (fallbackLocale === locale) return active

    const fallback = this.helper.getCache(fallbackLocale, routeName) as Record<string, unknown> | undefined
    if (!fallback) return active

    return this.resolveTranslationTree(fallback, active)
  }

  /**
   * Called after {@link setTranslation} changes the dictionary. Adapters override it to
   * bump whatever their reactivity is built on.
   */
  protected onTranslationsChanged(): void {}

  /**
   * Context passed to missing-key handlers.
   */
  protected getMissingContext(routeContext?: unknown): { locale: string; routeName: string } {
    return { locale: this.getLocale(), routeName: this.resolveRouteName(routeContext) }
  }

  /**
   * Dev-only client `console.warn`, gated by `missingWarn`.
   * Shared by missing translations and missing named formats.
   */
  protected warnDev(message: string): void {
    if (!this.missingWarn) return
    if (process.env.NODE_ENV === 'production') return
    if (typeof window === 'undefined') return
    console.warn(message)
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
    this.warnDev(`Not found '${key}' key in '${locale}' locale messages for route '${routeName}'.`)
  }

  /**
   * Warn when a named number/datetime format key is missing.
   * Falls back to default Intl options (visible in dev via {@link warnDev}).
   */
  protected warnMissingFormat(kind: 'number' | 'datetime', key: string, locale: string): void {
    this.warnDev(`Not found '${key}' ${kind} format in '${locale}' locale. Falling back to default Intl options.`)
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
   * Format number.
   * Supports Vue I18n-style named formats: `tn(1000, 'currency')`.
   */
  public tn(value: number, options?: Intl.NumberFormatOptions): string
  public tn(value: number, key: string, overrides?: Intl.NumberFormatOptions): string
  public tn(value: number, key: string, locale: string, overrides?: Intl.NumberFormatOptions): string
  public tn(
    value: number,
    keyOrOptions?: string | Intl.NumberFormatOptions,
    localeOrOverrides?: string | Intl.NumberFormatOptions,
    overrides?: Intl.NumberFormatOptions,
  ): string {
    this.touch()
    const resolved = this.resolveNumberFormatArgs(keyOrOptions, localeOrOverrides, overrides)
    return this.formatter.formatNumber(value, resolved.locale, resolved.options)
  }

  /**
   * Format date.
   * Supports Vue I18n-style named formats: `td(date, 'short')`.
   */
  public td(value: Date | number | string, options?: Intl.DateTimeFormatOptions): string
  public td(value: Date | number | string, key: string, overrides?: Intl.DateTimeFormatOptions): string
  public td(value: Date | number | string, key: string, locale: string, overrides?: Intl.DateTimeFormatOptions): string
  public td(
    value: Date | number | string,
    keyOrOptions?: string | Intl.DateTimeFormatOptions,
    localeOrOverrides?: string | Intl.DateTimeFormatOptions,
    overrides?: Intl.DateTimeFormatOptions,
  ): string {
    this.touch()
    const resolved = this.resolveDateTimeFormatArgs(keyOrOptions, localeOrOverrides, overrides)
    return this.formatter.formatDate(value, resolved.locale, resolved.options)
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
   * Replace the value at `key` — a subtree, a string, a number, anything.
   *
   * `set` and not `merge`: `setTranslation('aaa', { fff: 'ggg' })` leaves `aaa` holding only
   * `fff`, and `setTranslation('aaa', 'fff')` leaves a string where the subtree was. Use
   * `mergeTranslations` when the existing siblings should survive.
   *
   * Writes to the active locale and route, so the change is visible to `t()` immediately and
   * lives exactly as long as the chunk it belongs to.
   */
  public setTranslation(key: TranslationKey, value: unknown): void {
    const locale = this.getLocale()
    const routeName = this.getRoute()
    const current = (this.helper.getCache(locale, routeName) ?? {}) as Record<string, unknown>

    this.helper.setTranslations(locale, setTranslationAtKey(current, String(key), value), routeName)
    this.onTranslationsChanged()
  }

  /**
   * Clear translation + formatter caches
   */
  public clearCache(): void {
    this.helper.clearCache()
    this.formatter.clearCache()
  }

  private resolveNumberFormatArgs(
    keyOrOptions?: string | Intl.NumberFormatOptions,
    localeOrOverrides?: string | Intl.NumberFormatOptions,
    overrides?: Intl.NumberFormatOptions,
  ): { locale: string; options: Intl.NumberFormatOptions | undefined } {
    if (typeof keyOrOptions !== 'string') {
      return { locale: this.getLocale(), options: keyOrOptions }
    }

    let locale = this.getLocale()
    let extra: Intl.NumberFormatOptions | undefined
    if (typeof localeOrOverrides === 'string') {
      locale = localeOrOverrides
      extra = overrides
    } else {
      extra = localeOrOverrides
    }

    const named = this.formatter.resolveNumberFormat(locale, keyOrOptions)
    if (!named) {
      this.warnMissingFormat('number', keyOrOptions, locale)
    }
    if (!named && !extra) {
      return { locale, options: undefined }
    }
    return { locale, options: named ? { ...named, ...extra } : extra }
  }

  private resolveDateTimeFormatArgs(
    keyOrOptions?: string | Intl.DateTimeFormatOptions,
    localeOrOverrides?: string | Intl.DateTimeFormatOptions,
    overrides?: Intl.DateTimeFormatOptions,
  ): { locale: string; options: Intl.DateTimeFormatOptions | undefined } {
    if (typeof keyOrOptions !== 'string') {
      return { locale: this.getLocale(), options: keyOrOptions }
    }

    let locale = this.getLocale()
    let extra: Intl.DateTimeFormatOptions | undefined
    if (typeof localeOrOverrides === 'string') {
      locale = localeOrOverrides
      extra = overrides
    } else {
      extra = localeOrOverrides
    }

    const named = this.formatter.resolveDateTimeFormat(locale, keyOrOptions)
    if (!named) {
      this.warnMissingFormat('datetime', keyOrOptions, locale)
    }
    if (!named && !extra) {
      return { locale, options: undefined }
    }
    return { locale, options: named ? { ...named, ...extra } : extra }
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
