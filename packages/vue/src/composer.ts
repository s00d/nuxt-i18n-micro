import { BaseI18n, type DateTimeFormatsConfig, type NumberFormatsConfig, type TranslationStorage } from '@i18n-micro/core'
import type { PluralFunc, Translations } from '@i18n-micro/types'
import { type Ref, shallowRef } from 'vue'

export interface VueI18nOptions {
  locale: string
  fallbackLocale?: string
  messages?: Record<string, Translations>
  plural?: PluralFunc
  missingWarn?: boolean
  missingHandler?: (locale: string, key: string, routeName: string) => void
  /** Named number formats per locale (`tn(n, 'currency')`). */
  numberFormats?: NumberFormatsConfig
  /** Named datetime formats per locale (`td(d, 'short')`). */
  datetimeFormats?: DateTimeFormatsConfig
  /** IANA zone for dates (`Europe/Berlin`): set it so server and browser render one date. */
  timeZone?: string
  /** BCP 47 tag per locale code, for plurals of a code that is no language tag. `createI18n` fills it from `locales`. */
  localeIso?: Record<string, string>
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
      numberFormats: options.numberFormats,
      datetimeFormats: options.datetimeFormats,
      timeZone: options.timeZone,
      localeIso: options.localeIso,
    })

    this.storage = storage
    this._locale = shallowRef(options.locale)
    this._fallbackLocale = shallowRef(options.fallbackLocale || options.locale)
    this._currentRoute = shallowRef('index')
    this._revision = shallowRef(0)

    for (const [lang, msgs] of Object.entries(options.messages ?? {})) this.helper.loadTranslations(lang, msgs)
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
    this.loadTranslationsCore(locale, translations, merge)
  }

  public addRouteTranslations(locale: string, routeName: string, translations: Translations, merge = true): void {
    this.loadRouteTranslationsCore(locale, routeName, translations, merge)
  }

  public mergeTranslations(locale: string, routeName: string, translations: Translations): void {
    this.loadRouteTranslationsCore(locale, routeName, translations, true)
  }

  /** Every read depends on the revision, so `computed(() => t(key))` re-runs after a write. */
  protected override touch(): void {
    void this._revision.value
  }

  protected override onTranslationsChanged(): void {
    this._revision.value++
    this.notifyListeners()
  }

  public subscribeToChanges(cb: () => void): () => void {
    this.listeners.add(cb)
    return () => this.listeners.delete(cb)
  }

  private notifyListeners(): void {
    // over a copy, each guarded: one throwing listener must not stop a write or the others
    for (const listener of [...this.listeners]) {
      try {
        listener()
      } catch (error) {
        console.error('[i18n-micro] change listener failed:', error)
      }
    }
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
