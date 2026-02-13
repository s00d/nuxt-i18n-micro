import { BaseI18n, type TranslationStorage } from '@i18n-micro/core'
import type { PluralFunc, Translations } from '@i18n-micro/types'
import { type Ref, shallowRef } from 'vue'

export interface VueI18nOptions {
  locale: string
  fallbackLocale?: string
  messages?: Record<string, Translations>
  plural?: PluralFunc
  missingWarn?: boolean
  missingHandler?: (locale: string, key: string, routeName: string) => void
}

export class VueI18n extends BaseI18n {
  private _locale: Ref<string>
  private _fallbackLocale: Ref<string>
  private _currentRoute: Ref<string>
  private _revision: Ref<number>

  public readonly storage: TranslationStorage

  private listeners: Set<() => void> = new Set()

  constructor(options: VueI18nOptions) {
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
    this._locale = shallowRef(options.locale)
    this._fallbackLocale = shallowRef(options.fallbackLocale || options.locale)
    this._currentRoute = shallowRef('index')
    this._revision = shallowRef(0)

    if (options.messages) {
      for (const [lang, msgs] of Object.entries(options.messages)) {
        this.helper.loadTranslations(lang, msgs)
      }
    }
  }

  get locale(): Ref<string> {
    return this._locale
  }

  set locale(val: Ref<string> | string) {
    if (typeof val === 'string') {
      this._locale.value = val
    } else {
      this._locale = val
    }
  }

  get fallbackLocale(): Ref<string> {
    return this._fallbackLocale
  }

  set fallbackLocale(val: Ref<string> | string) {
    if (typeof val === 'string') {
      this._fallbackLocale.value = val
    } else {
      this._fallbackLocale = val
    }
  }

  get currentRoute(): Ref<string> {
    return this._currentRoute
  }

  setRoute(routeName: string): void {
    this._currentRoute.value = routeName
  }

  public getLocale(): string {
    return this._locale.value
  }

  public getFallbackLocale(): string {
    return this._fallbackLocale.value
  }

  public getRoute(): string {
    return this._currentRoute.value
  }

  public addTranslations(locale: string, translations: Translations, merge = true): void {
    super.loadTranslationsCore(locale, translations, merge)
    this._revision.value++
    this.notifyListeners()
  }

  public addRouteTranslations(locale: string, routeName: string, translations: Translations, merge = true): void {
    super.loadRouteTranslationsCore(locale, routeName, translations, merge)
    this._revision.value++
    this.notifyListeners()
  }

  public mergeTranslations(locale: string, routeName: string, translations: Translations): void {
    this.helper.mergeTranslation(locale, routeName, translations, true)
    this._revision.value++
    this.notifyListeners()
  }

  public override clearCache(): void {
    super.clearCache()
    this._revision.value++
    this.notifyListeners()
  }

  public subscribeToChanges(cb: () => void): () => void {
    this.listeners.add(cb)
    return () => this.listeners.delete(cb)
  }

  private notifyListeners(): void {
    this.listeners.forEach((cb) => cb())
  }

  public getAllTranslations(): Record<string, Translations> {
    const result: Record<string, Translations> = {}
    for (const [key, translations] of this.storage.translations) {
      if (!key.includes(':')) {
        result[key] = translations
      } else {
        const locale = key.split(':')[0]
        if (locale) {
          if (!result[locale]) result[locale] = {}
          Object.assign(result[locale], translations)
        }
      }
    }
    return result
  }

  public getStorage(): TranslationStorage {
    return this.storage
  }

  public getRouteCache(): Record<string, Translations> {
    const result: Record<string, Translations> = {}
    for (const [key, value] of this.storage.translations) {
      result[key] = value
    }
    return result
  }
}
