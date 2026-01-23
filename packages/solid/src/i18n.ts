import { createSignal, type Accessor, type Setter } from 'solid-js'
import { createStore, type SetStoreFunction } from 'solid-js/store'
import { BaseI18n, type TranslationCache } from '@i18n-micro/core'
import type { Translations, PluralFunc } from '@i18n-micro/types'

export interface SolidI18nOptions {
  locale: string
  fallbackLocale?: string
  messages?: Record<string, Translations>
  plural?: PluralFunc
  missingWarn?: boolean
  missingHandler?: (locale: string, key: string, routeName: string) => void
}

/**
 * SolidJS I18n Adapter
 *
 * Provides a SolidJS-compatible i18n instance that uses the shared core logic.
 * Uses createSignal for locale/route reactivity and createStore for translation cache.
 */
export class SolidI18n extends BaseI18n {
  // Solid reactive primitives
  private _locale: Accessor<string>
  private _setLocale: Setter<string>
  private _fallbackLocale: Accessor<string>
  private _currentRoute: Accessor<string>
  private _setRoute: Setter<string>

  // Store for cache
  // We use createStore for deep reactivity so that when loading
  // partial translations (mergeTranslation) the interface updates
  public readonly cacheStore: {
    general: Record<string, Translations>
    route: Record<string, Translations>
  }

  private setCacheStore: SetStoreFunction<{
    general: Record<string, Translations>
    route: Record<string, Translations>
  }>

  // Listeners for DevTools (analog of subscribe in React version)
  private listeners = new Set<() => void>()

  constructor(options: SolidI18nOptions) {
    // 1. Initialize reactive store
    // Create signals and store directly (without createRoot, as this is SolidJS, not Preact)
    const [locale, setLocale] = createSignal(options.locale)
    const [fallback] = createSignal(options.fallbackLocale || options.locale)
    const [route, setRoute] = createSignal('general')

    const [store, setStore] = createStore({
      general: {} as Record<string, Translations>,
      route: {} as Record<string, Translations>,
    })

    // 2. Adaptation for BaseI18n
    // BaseI18n expects RefLike objects. In Solid Store works as Proxy,
    // so we can wrap access to it
    const cacheAdapter: TranslationCache = {
      // Solid Store Proxy is compatible with reading objects
      generalLocaleCache: { value: store.general } as unknown as TranslationCache['generalLocaleCache'],
      routeLocaleCache: { value: store.route } as unknown as TranslationCache['routeLocaleCache'],
      dynamicTranslationsCaches: { value: [] },
      serverTranslationCache: { value: {} },
    }

    super({
      cache: cacheAdapter,
      plural: options.plural,
      missingWarn: options.missingWarn,
      missingHandler: options.missingHandler,
    })

    this._locale = locale
    this._setLocale = setLocale
    this._fallbackLocale = fallback
    this._currentRoute = route
    this._setRoute = setRoute

    this.cacheStore = store
    this.setCacheStore = setStore

    // Load initial messages
    if (options.messages) {
      for (const [lang, msgs] of Object.entries(options.messages)) {
        this.addTranslations(lang, msgs)
      }
    }
  }

  // --- Abstract Implementation ---

  public getLocale(): string {
    return this._locale()
  }

  public getFallbackLocale(): string {
    return this._fallbackLocale()
  }

  public getRoute(): string {
    return this._currentRoute()
  }

  // --- Setters ---

  public set locale(val: string) {
    this._setLocale(val)
    this.notifyListeners()
  }

  public get locale(): string {
    return this._locale()
  }

  // Public accessor for reactivity
  public get localeAccessor(): Accessor<string> {
    return this._locale
  }

  public get fallbackLocale(): string {
    return this._fallbackLocale()
  }

  public get currentRoute(): string {
    return this._currentRoute()
  }

  // Public accessor for reactivity
  public get routeAccessor(): Accessor<string> {
    return this._currentRoute
  }

  public setRoute(val: string): void {
    this._setRoute(val)
    this.notifyListeners()
  }

  // --- Overrides for Reactivity ---

  public addTranslations(locale: string, translations: Translations, merge = true): void {
    if (merge) {
      this.setCacheStore('general', locale, (prev: Translations | undefined) => ({
        ...(prev || {}),
        ...translations,
      }))
    }
    else {
      this.setCacheStore('general', locale, translations)
    }
    this.notifyListeners()
  }

  public addRouteTranslations(locale: string, routeName: string, translations: Translations, merge = true): void {
    const key = `${locale}:${routeName}`
    if (merge) {
      this.setCacheStore('route', key, (prev: Translations | undefined) => ({
        ...(prev || {}),
        ...translations,
      }))
    }
    else {
      this.setCacheStore('route', key, translations)
    }
    this.notifyListeners()
  }

  public override clearCache(): void {
    this.setCacheStore('general', {})
    this.setCacheStore('route', {})
    super.clearCache()
    this.notifyListeners()
  }

  public subscribe(cb: () => void): () => void {
    this.listeners.add(cb)
    return () => this.listeners.delete(cb)
  }

  private notifyListeners(): void {
    this.listeners.forEach((cb) => {
      cb()
    })
  }
}

export function createI18n(options: SolidI18nOptions): SolidI18n {
  return new SolidI18n(options)
}
