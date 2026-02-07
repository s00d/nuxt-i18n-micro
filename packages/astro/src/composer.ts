import { BaseI18n, type TranslationStorage } from '@i18n-micro/core'
import type { PluralFunc, Translations } from '@i18n-micro/types'

export interface AstroI18nOptions {
  locale: string
  fallbackLocale?: string
  messages?: Record<string, Translations>
  plural?: PluralFunc
  missingWarn?: boolean
  missingHandler?: (locale: string, key: string, routeName: string) => void
  _storage?: TranslationStorage
}

export class AstroI18n extends BaseI18n {
  private _locale: string
  private _fallbackLocale: string
  private _currentRoute: string

  public readonly storage: TranslationStorage

  private initialMessages: Record<string, Translations> = {}

  constructor(options: AstroI18nOptions) {
    const storage: TranslationStorage = options._storage || {
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
    this._currentRoute = 'general'

    if (options.messages) {
      this.initialMessages = { ...options.messages }
      for (const [lang, msgs] of Object.entries(options.messages)) {
        this.helper.loadTranslations(lang, msgs)
      }
    }
  }

  private cloneStorage(source: TranslationStorage): TranslationStorage {
    const translations = new Map<string, Translations>()
    for (const [key, value] of source.translations) {
      translations.set(key, { ...value })
    }
    return { translations }
  }

  public clone(newLocale?: string): AstroI18n {
    const isolatedStorage = this.cloneStorage(this.storage)

    return new AstroI18n({
      locale: newLocale || this._locale,
      fallbackLocale: this._fallbackLocale,
      plural: this.pluralFunc,
      missingWarn: this.missingWarn,
      missingHandler: this.missingHandler,
      _storage: isolatedStorage,
    })
  }

  get locale(): string {
    return this._locale
  }

  set locale(val: string) {
    this._locale = val
  }

  get fallbackLocale(): string {
    return this._fallbackLocale
  }

  set fallbackLocale(val: string) {
    this._fallbackLocale = val
  }

  setRoute(routeName: string): void {
    this._currentRoute = routeName
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

  public getRouteTranslations(locale: string, routeName: string): Translations | null {
    const cacheKey = `${locale}:${routeName}`
    return this.storage.translations.get(cacheKey) ?? null
  }

  public addTranslations(locale: string, translations: Translations, merge = true): void {
    super.loadTranslationsCore(locale, translations, merge)
  }

  public addRouteTranslations(locale: string, routeName: string, translations: Translations, merge = true): void {
    super.loadRouteTranslationsCore(locale, routeName, translations, merge)
  }

  public mergeTranslations(locale: string, routeName: string, translations: Translations): void {
    this.helper.mergeTranslation(locale, routeName, translations, true)
  }

  public mergeGlobalTranslations(locale: string, translations: Translations): void {
    this.helper.mergeGlobalTranslation(locale, translations, true)
  }

  public override clearCache(): void {
    const initialMessages = { ...this.initialMessages }

    super.clearCache()

    if (Object.keys(initialMessages).length > 0) {
      for (const [lang, msgs] of Object.entries(initialMessages)) {
        this.helper.loadTranslations(lang, msgs)
      }
    }
  }
}
