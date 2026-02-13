import { BaseI18n, type TranslationStorage } from '@i18n-micro/core'
import type { PluralFunc, Translations } from '@i18n-micro/types'
import { type Accessor, createSignal, type Setter } from 'solid-js'

export interface SolidI18nOptions {
  locale: string
  fallbackLocale?: string
  messages?: Record<string, Translations>
  plural?: PluralFunc
  missingWarn?: boolean
  missingHandler?: (locale: string, key: string, routeName: string) => void
}

export class SolidI18n extends BaseI18n {
  private _locale: Accessor<string>
  private _setLocale: Setter<string>
  private _fallbackLocale: Accessor<string>
  private _currentRoute: Accessor<string>
  private _setRoute: Setter<string>

  public readonly storage: TranslationStorage

  private listeners = new Set<() => void>()

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

    const [locale, setLocale] = createSignal(options.locale)
    const [fallback] = createSignal(options.fallbackLocale || options.locale)
    const [route, setRoute] = createSignal('index')

    this._locale = locale
    this._setLocale = setLocale
    this._fallbackLocale = fallback
    this._currentRoute = route
    this._setRoute = setRoute

    if (options.messages) {
      for (const [lang, msgs] of Object.entries(options.messages)) {
        this.addTranslations(lang, msgs)
      }
    }
  }

  public getLocale(): string {
    return this._locale()
  }

  public getFallbackLocale(): string {
    return this._fallbackLocale()
  }

  public getRoute(): string {
    return this._currentRoute()
  }

  public set locale(val: string) {
    this._setLocale(val)
    this.notifyListeners()
  }

  public get locale(): string {
    return this._locale()
  }

  public get localeAccessor(): Accessor<string> {
    return this._locale
  }

  public get fallbackLocale(): string {
    return this._fallbackLocale()
  }

  public get currentRoute(): string {
    return this._currentRoute()
  }

  public get routeAccessor(): Accessor<string> {
    return this._currentRoute
  }

  public setRoute(val: string): void {
    this._setRoute(val)
    this.notifyListeners()
  }

  public addTranslations(locale: string, translations: Translations, merge = true): void {
    super.loadTranslationsCore(locale, translations, merge)
    this.notifyListeners()
  }

  public addRouteTranslations(locale: string, routeName: string, translations: Translations, merge = true): void {
    super.loadRouteTranslationsCore(locale, routeName, translations, merge)
    this.notifyListeners()
  }

  public override clearCache(): void {
    super.clearCache()
    this.notifyListeners()
  }

  public subscribe(cb: () => void): () => void {
    this.listeners.add(cb)
    return () => this.listeners.delete(cb)
  }

  private notifyListeners(): void {
    this.listeners.forEach((cb) => cb())
  }
}

export function createI18n(options: SolidI18nOptions): SolidI18n {
  return new SolidI18n(options)
}
