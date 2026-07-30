import { BaseI18n, createReactiveI18nStore, type ReactiveI18nStore, type TranslationStorage } from '@i18n-micro/core'
import type { PluralFunc, Translations } from '@i18n-micro/types'

export interface PreactI18nOptions {
  locale: string
  fallbackLocale?: string
  messages?: Record<string, Translations>
  plural?: PluralFunc
  missingWarn?: boolean
  missingHandler?: (locale: string, key: string, routeName: string) => void
}

export class PreactI18n extends BaseI18n {
  private readonly store: ReactiveI18nStore
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
    this.store = createReactiveI18nStore({
      locale: options.locale,
      fallbackLocale: options.fallbackLocale || options.locale,
    })

    if (options.messages) {
      for (const [lang, msgs] of Object.entries(options.messages)) {
        this.helper.loadTranslations(lang, msgs)
      }
    }
  }

  subscribe = (listener: () => void) => this.store.subscribe(listener)

  getSnapshot = () => this.store.getSnapshot()

  get locale(): string {
    return this.store.getLocale()
  }

  set locale(val: string) {
    this.store.setLocale(val)
  }

  get fallbackLocale(): string {
    return this.store.getFallbackLocale()
  }

  set fallbackLocale(val: string) {
    this.store.setFallbackLocale(val)
  }

  get currentRoute(): string {
    return this.store.getRoute()
  }

  setRoute(routeName: string): void {
    this.store.setRoute(routeName)
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

  public addTranslations(locale: string, translations: Translations, merge = true): void {
    super.loadTranslationsCore(locale, translations, merge)
    this.store.notify()
  }

  public addRouteTranslations(locale: string, routeName: string, translations: Translations, merge = true): void {
    super.loadRouteTranslationsCore(locale, routeName, translations, merge)
    this.store.notify()
  }

  public override clearCache(): void {
    super.clearCache()
    this.store.notify()
  }

  protected override onTranslationsChanged(): void {
    this.store.notify()
  }
}

export function createI18n(options: PreactI18nOptions): PreactI18n {
  return new PreactI18n(options)
}
