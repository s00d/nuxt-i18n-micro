import {
  BaseI18n,
  type TranslationCache,
} from '@i18n-micro/core'
import type {
  Translations,
  PluralFunc,
} from '@i18n-micro/types'

export interface PreactI18nOptions {
  locale: string
  fallbackLocale?: string
  messages?: Record<string, Translations>
  plural?: PluralFunc
  missingWarn?: boolean
  missingHandler?: (locale: string, key: string, routeName: string) => void
}

/**
 * Preact I18n Adapter
 *
 * Provides a Preact-compatible i18n instance that uses the shared core logic.
 * Implements Observer pattern for reactivity with useSyncExternalStore.
 * Works with Preact through preact/compat for React compatibility.
 */
export class PreactI18n extends BaseI18n {
  private _locale: string
  private _fallbackLocale: string
  private _currentRoute: string = 'general'
  private listeners = new Set<() => void>()
  private revision = 0

  // Cache для Core (plain objects, не реактивные)
  public readonly cache: TranslationCache

  constructor(options: PreactI18nOptions) {
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

    // Assign cache to public readonly property
    this.cache = cache

    this._locale = options.locale
    this._fallbackLocale = options.fallbackLocale || options.locale

    // Загружаем начальные сообщения
    if (options.messages) {
      for (const [lang, msgs] of Object.entries(options.messages)) {
        this.helper.loadTranslations(lang, msgs)
      }
    }
  }

  // Для useSyncExternalStore
  subscribe = (listener: () => void) => {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  getSnapshot = () => {
    // Возвращаем комбинированную строку локали и ревизии кэша
    // Это заставит компонент перерендериться при изменении
    return `${this._locale}:${this._currentRoute}:${this.revision}`
  }

  private notify() {
    this.revision++
    this.listeners.forEach((listener) => {
      listener()
    })
  }

  // Геттер/Сеттер для локали
  get locale(): string {
    return this._locale
  }

  set locale(val: string) {
    if (this._locale !== val) {
      this._locale = val
      this.notify()
    }
  }

  // Геттер/Сеттер для fallback локали
  get fallbackLocale(): string {
    return this._fallbackLocale
  }

  set fallbackLocale(val: string) {
    this._fallbackLocale = val
  }

  // Геттер/Сеттер для текущего роута
  get currentRoute(): string {
    return this._currentRoute
  }

  setRoute(routeName: string): void {
    if (this._currentRoute !== routeName) {
      this._currentRoute = routeName
      this.notify()
    }
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

  // Translation management (uses protected methods from base class)
  public addTranslations(locale: string, translations: Translations, merge: boolean = true): void {
    super.loadTranslationsCore(locale, translations, merge)
    this.notify()
  }

  public addRouteTranslations(
    locale: string,
    routeName: string,
    translations: Translations,
    merge: boolean = true,
  ): void {
    super.loadRouteTranslationsCore(locale, routeName, translations, merge)
    this.notify()
  }

  public override clearCache(): void {
    super.clearCache()
    this.notify()
  }
}

/**
 * Create a new PreactI18n instance
 */
export function createI18n(options: PreactI18nOptions): PreactI18n {
  return new PreactI18n(options)
}
