import {
  BaseI18n,
  type TranslationCache,
} from '@i18n-micro/core'
import type {
  Translations,
  PluralFunc,
  TranslationKey,
} from '@i18n-micro/types'
// Import our shared loading logic
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
export class I18n extends BaseI18n {
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

  constructor(options: I18nOptions) {
    // Create cache first
    const cache: TranslationCache = {
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

    // Assign cache to private property
    this.cache = cache

    this.locale = options.locale
    this.fallbackLocale = options.fallbackLocale || options.locale
    this.translationDir = options.translationDir
    this.disablePageLocales = options.disablePageLocales ?? false
  }

  /**
   * Set the current route name context.
   * Useful when processing a specific page request in Node.
   */
  public setRoute(routeName: string) {
    this.currentRoute = routeName
  }

  // --- Implementation of abstract methods ---

  public getLocale(): string {
    return this.locale
  }

  public getFallbackLocale(): string {
    return this.fallbackLocale
  }

  public getRoute(): string {
    return this.currentRoute
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

    // Use shared utility
    const { global, routes } = await loadTranslations(targetDir, this.disablePageLocales)

    // 1. Load global translations
    for (const [locale, translations] of Object.entries(global)) {
      this.helper.mergeGlobalTranslation(locale, translations, true)
    }

    // 2. Load page-specific translations (routes)
    for (const [routeName, routeLocales] of Object.entries(routes)) {
      for (const [locale, translations] of Object.entries(routeLocales)) {
        // Use loadPageTranslations for initial load, then merge for updates
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

  public hasTranslation(key: TranslationKey): boolean {
    return this.helper.hasTranslation(this.locale, key)
  }

  public clear(): void {
    super.clearCache()
  }
}

/**
 * Create a new I18n instance
 */
export function createI18n(options: I18nOptions): I18n {
  return new I18n(options)
}
