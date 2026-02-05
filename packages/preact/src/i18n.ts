import { BaseI18n, type TranslationStorage } from '@i18n-micro/core'
import type { Translations, PluralFunc } from '@i18n-micro/types'

export interface PreactI18nOptions {
  locale: string
  fallbackLocale?: string
  messages?: Record<string, Translations>
  plural?: PluralFunc
  missingWarn?: boolean
  missingHandler?: (locale: string, key: string, routeName: string) => void
}

export class PreactI18n extends BaseI18n {
  private _locale: string
  private _fallbackLocale: string
  private _currentRoute: string = 'general'
  private listeners = new Set<() => void>()
  private revision = 0

  public readonly storage: TranslationStorage

  constructor(options: PreactI18nOptions) {
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
    this._locale = options.locale
    this._fallbackLocale = options.fallbackLocale || options.locale

    if (options.messages) {
      for (const [lang, msgs] of Object.entries(options.messages)) {
        this.helper.loadTranslations(lang, msgs)
      }
    }
  }

  subscribe = (listener: () => void) => {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  getSnapshot = () => `${this._locale}:${this._currentRoute}:${this.revision}`

  private notify() {
    this.revision++
    this.listeners.forEach(listener => listener())
  }

  get locale(): string {
    return this._locale
  }

  set locale(val: string) {
    if (this._locale !== val) {
      this._locale = val
      this.notify()
    }
  }

  get fallbackLocale(): string {
    return this._fallbackLocale
  }

  set fallbackLocale(val: string) {
    this._fallbackLocale = val
  }

  get currentRoute(): string {
    return this._currentRoute
  }

  setRoute(routeName: string): void {
    if (this._currentRoute !== routeName) {
      this._currentRoute = routeName
      this.notify()
    }
  }

  public getLocale(): string {
    return this._locale
  }

  public getFallbackLocale(): string {
    return this._fallbackLocale
  }

  public getRoute(): string {
    return this._currentRoute
  }

  public addTranslations(locale: string, translations: Translations, merge = true): void {
    super.loadTranslationsCore(locale, translations, merge)
    this.notify()
  }

  public addRouteTranslations(
    locale: string,
    routeName: string,
    translations: Translations,
    merge = true,
  ): void {
    super.loadRouteTranslationsCore(locale, routeName, translations, merge)
    this.notify()
  }

  public override clearCache(): void {
    super.clearCache()
    this.notify()
  }
}

export function createI18n(options: PreactI18nOptions): PreactI18n {
  return new PreactI18n(options)
}
