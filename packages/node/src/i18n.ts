import {
  useTranslationHelper,
  interpolate,
  FormatService,
  defaultPlural,
  type TranslationCache,
} from '@i18n-micro/core'
import type {
  Translations,
  Params,
  PluralFunc,
  Getter,
  TranslationKey,
} from '@i18n-micro/types'
// Импортируем нашу общую логику загрузки
import { loadTranslations } from './loader'

export interface I18nOptions {
  locale: string
  fallbackLocale?: string
  translationDir?: string
  plural?: PluralFunc
  missingWarn?: boolean
  missingHandler?: (locale: string, key: string, routeName: string) => void
  disablePageLocales?: boolean
}

/**
 * Node.js I18n Adapter
 *
 * Provides a standalone i18n instance that uses the shared core logic from nuxt-i18n-micro.
 * Fully compatible with the file structure and caching mechanisms of the Nuxt module.
 */
export class I18n {
  public locale: string
  public fallbackLocale: string
  public translationDir?: string
  private disablePageLocales: boolean

  /**
   * Current active route name for translations.
   * Defaults to 'general' (global translations only).
   * Change this using setRoute() to access page-specific translations.
   */
  public currentRoute: string = 'general'

  // In-memory cache store (plain objects, compatible with updated Core)
  private cache: TranslationCache = {
    generalLocaleCache: {},
    routeLocaleCache: {},
    dynamicTranslationsCaches: [],
    serverTranslationCache: {},
  }

  // Делаем helper публичным (readonly), может пригодиться для продвинутых юзкейсов
  public readonly helper = useTranslationHelper(this.cache)
  private formatter = new FormatService()
  private pluralFunc: PluralFunc
  private missingWarn: boolean
  private missingHandler?: (locale: string, key: string, routeName: string) => void

  constructor(options: I18nOptions) {
    this.locale = options.locale
    this.fallbackLocale = options.fallbackLocale || options.locale
    this.translationDir = options.translationDir
    this.disablePageLocales = options.disablePageLocales ?? false
    this.pluralFunc = options.plural || defaultPlural
    this.missingWarn = options.missingWarn ?? false
    this.missingHandler = options.missingHandler
  }

  /**
   * Set the current route name context.
   * Useful when processing a specific page request in Node.
   */
  public setRoute(routeName: string) {
    this.currentRoute = routeName
  }

  public getRoute(): string {
    return this.currentRoute
  }

  /**
   * Get translation for a key
   *
   * Search order:
   * 1. Current Locale + Current Route (Specific)
   * 2. Current Locale + General (Global)
   * 3. Fallback Locale + Current Route
   * 4. Fallback Locale + General
   */
  public t(
    key: TranslationKey,
    params?: Params,
    defaultValue?: string | null,
    routeName?: string,
  ): string {
    if (!key) return ''

    const route = routeName || this.currentRoute

    // 1. Try to find translation in current locale (Core helper checks Route -> Global automatically)
    let value = this.helper.getTranslation<string>(this.locale, route, key)

    // 2. Fallback to fallbackLocale if not found and different
    if (!value && this.locale !== this.fallbackLocale) {
      value = this.helper.getTranslation<string>(this.fallbackLocale, route, key)
    }

    // 3. Handle missing
    if (!value) {
      if (this.missingHandler) {
        this.missingHandler(this.locale, key, route)
      }
      else if (this.missingWarn) {
        console.warn(
          `[i18n] Translation key '${key}' not found for locale '${this.locale}' (route: '${route}').`,
        )
      }
      value = defaultValue === undefined ? key : (defaultValue || key)
    }

    // 4. Interpolate
    if (typeof value === 'string' && params) {
      return interpolate(value, params)
    }

    return value || key
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
      this.locale,
      getter,
    )

    return result ?? defaultValue ?? key
  }

  // --- Formatters ---

  public tn(value: number, options?: Intl.NumberFormatOptions): string {
    return this.formatter.formatNumber(value, this.locale, options)
  }

  public td(value: Date | number | string, options?: Intl.DateTimeFormatOptions): string {
    return this.formatter.formatDate(value, this.locale, options)
  }

  public tdr(value: Date | number | string, options?: Intl.RelativeTimeFormatOptions): string {
    return this.formatter.formatRelativeTime(value, this.locale, options)
  }

  // --- Loader & Cache Management ---

  /**
   * Load translations from directory.
   */
  public async loadTranslations(dir?: string): Promise<void> {
    const targetDir = dir || this.translationDir
    if (!targetDir) {
      console.warn('[i18n-node] No translation directory specified')
      return
    }

    // Используем общую утилиту
    const { global, routes } = await loadTranslations(targetDir, this.disablePageLocales)

    // 1. Загружаем глобальные
    for (const [locale, translations] of Object.entries(global)) {
      this.helper.mergeGlobalTranslation(locale, translations, true)
    }

    // 2. Загружаем страничные (роуты)
    for (const [routeName, routeLocales] of Object.entries(routes)) {
      for (const [locale, translations] of Object.entries(routeLocales)) {
        // Используем loadPageTranslations для первоначальной загрузки, затем merge для обновлений
        await this.helper.loadPageTranslations(locale, routeName, translations)
      }
    }
  }

  /**
   * Clear cache and reload translations from disk
   */
  public async reload(): Promise<void> {
    this.helper.clearCache()
    await this.loadTranslations()
    console.log(`[i18n-node] Cache cleared and translations reloaded.`)
  }

  // --- Manual Manipulation ---

  public addTranslations(locale: string, translations: Translations, merge: boolean = true): void {
    if (merge) {
      this.helper.mergeGlobalTranslation(locale, translations, true)
    }
    else {
      // Replace completely
      this.helper.loadTranslations(locale, translations)
    }
  }

  public addRouteTranslations(
    locale: string,
    routeName: string,
    translations: Translations,
    merge: boolean = true,
  ): void {
    if (merge) {
      // mergeTranslation с force=true создаст запись, если её нет.
      // Предварительный loadPageTranslations не обязателен.
      this.helper.mergeTranslation(locale, routeName, translations, true)
    }
    else {
      this.helper.loadPageTranslations(locale, routeName, translations)
    }
  }

  public hasTranslation(key: TranslationKey): boolean {
    return this.helper.hasTranslation(this.locale, key)
  }

  public clear(): void {
    this.helper.clearCache()
  }
}

/**
 * Create a new I18n instance
 */
export function createI18n(options: I18nOptions): I18n {
  return new I18n(options)
}
