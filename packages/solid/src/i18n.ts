import { BaseI18n, createReactiveI18nStore, type ReactiveI18nStore, type TranslationStorage } from '@i18n-micro/core'
import type { PluralFunc, Translations } from '@i18n-micro/types'
import { createSignal, type Accessor } from 'solid-js'

export interface SolidI18nOptions {
  locale: string
  fallbackLocale?: string
  messages?: Record<string, Translations>
  plural?: PluralFunc
  missingWarn?: boolean
  missingHandler?: (locale: string, key: string, routeName: string) => void
}

export class SolidI18n extends BaseI18n {
  private readonly store: ReactiveI18nStore
  private readonly _localeSignal: Accessor<string>
  private readonly _setLocaleSignal: (v: string) => void
  private readonly _routeSignal: Accessor<string>
  private readonly _setRouteSignal: (v: string) => void
  private readonly _fallbackSignal: Accessor<string>

  public readonly storage: TranslationStorage

  constructor(options: SolidI18nOptions) {
    const storage: TranslationStorage = {
      translations: new Map<string, Translations>(),
    }

    super({
      storage,
      plural: options.plural,
      missingWarn: options.missingWarn,
      missingHandler: options.missingHandler,
    })

    this.storage = storage
    this.store = createReactiveI18nStore({
      locale: options.locale,
      fallbackLocale: options.fallbackLocale || options.locale,
    })

    const [locale, setLocale] = createSignal(options.locale)
    const [fallback] = createSignal(options.fallbackLocale || options.locale)
    const [route, setRoute] = createSignal('index')

    this._localeSignal = locale
    this._setLocaleSignal = setLocale
    this._fallbackSignal = fallback
    this._routeSignal = route
    this._setRouteSignal = setRoute

    this.store.subscribe(() => {
      setLocale(this.store.getLocale())
      setRoute(this.store.getRoute())
    })

    if (options.messages) {
      for (const [lang, msgs] of Object.entries(options.messages)) {
        this.addTranslations(lang, msgs)
      }
    }
  }

  public getLocale(): string {
    return this.store.getLocale()
  }

  public getFallbackLocale(): string {
    return this.store.getFallbackLocale()
  }

  public getRoute(): string {
    return this.store.getRoute()
  }

  public set locale(val: string) {
    this.store.setLocale(val)
    this._setLocaleSignal(val)
    this.notifyListeners()
  }

  public get locale(): string {
    return this._localeSignal()
  }

  public get localeAccessor(): Accessor<string> {
    return this._localeSignal
  }

  public get fallbackLocale(): string {
    return this._fallbackSignal()
  }

  public get currentRoute(): string {
    return this._routeSignal()
  }

  public get routeAccessor(): Accessor<string> {
    return this._routeSignal
  }

  public setRoute(val: string): void {
    this.store.setRoute(val)
    this._setRouteSignal(val)
    this.notifyListeners()
  }

  public addTranslations(locale: string, translations: Translations, merge = true): void {
    super.loadTranslationsCore(locale, translations, merge)
    this.store.notify()
    this.notifyListeners()
  }

  public addRouteTranslations(locale: string, routeName: string, translations: Translations, merge = true): void {
    super.loadRouteTranslationsCore(locale, routeName, translations, merge)
    this.store.notify()
    this.notifyListeners()
  }

  public override clearCache(): void {
    super.clearCache()
    this.store.notify()
    this.notifyListeners()
  }

  private listeners = new Set<() => void>()

  public subscribe(cb: () => void): () => void {
    this.listeners.add(cb)
    return () => this.listeners.delete(cb)
  }

  public getSnapshot(): string {
    return this.store.getSnapshot()
  }

  private notifyListeners(): void {
    this.listeners.forEach((cb) => cb())
  }
}

export function createI18n(options: SolidI18nOptions): SolidI18n {
  return new SolidI18n(options)
}
