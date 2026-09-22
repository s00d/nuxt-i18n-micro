import { BaseI18n, createReactiveI18nStore, type ReactiveI18nStore, type TranslationStorage } from '@i18n-micro/core'
import type { PluralFunc, TranslationKey, Translations } from '@i18n-micro/types'
import { mergeRouteTranslationsWithRoot } from '@i18n-micro/utils/parse-path'
import { fetchJsonTranslations, type LoadFromUrlEntry, type LoadFromUrlOptions } from './loader'

export interface I18nOptions {
  locale: string
  fallbackLocale?: string
  /** Root translations keyed by locale code. */
  messages?: Record<string, Translations>
  /** Route-specific translations: routeName → locale → messages. */
  routeMessages?: Record<string, Record<string, Translations>>
  plural?: PluralFunc
  missingWarn?: boolean
  missingHandler?: (locale: string, key: string, routeName: string) => void
}

export class I18n extends BaseI18n {
  private readonly store: ReactiveI18nStore
  public readonly storage: TranslationStorage

  constructor(options: I18nOptions) {
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

    if (options.messages || options.routeMessages) {
      this.loadMessages(options.messages, options.routeMessages)
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

  public setRoute(routeName: string): void {
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

  /**
   * Load root and optional route-scoped translation maps into the instance.
   * Route layers are merged with the current root (`index`) for that locale.
   */
  public loadMessages(messages?: Record<string, Translations>, routeMessages?: Record<string, Record<string, Translations>>): void {
    if (messages) {
      for (const [locale, translations] of Object.entries(messages)) {
        this.addTranslations(locale, translations)
      }
    }

    if (routeMessages) {
      for (const [routeName, locales] of Object.entries(routeMessages)) {
        for (const [locale, translations] of Object.entries(locales)) {
          const base = this.helper.getCache(locale, 'index')
          this.helper.loadPageTranslations(locale, routeName, mergeRouteTranslationsWithRoot(base, translations))
        }
      }
      this.store.notify()
    }
  }

  public async loadFromUrl(url: string, options: LoadFromUrlOptions = {}): Promise<void> {
    const locale = options.locale ?? this.getLocale()
    const translations = await fetchJsonTranslations(url, options.init)
    const routeName = options.routeName

    if (routeName && routeName !== 'index') {
      const base = this.helper.getCache(locale, 'index')
      this.helper.loadPageTranslations(locale, routeName, mergeRouteTranslationsWithRoot(base, translations))
      this.store.notify()
      return
    }

    this.addTranslations(locale, translations)
  }

  public async loadFromUrls(entries: LoadFromUrlEntry[]): Promise<void> {
    // Sequential on purpose: parallel merges into the same locale Map can race.
    for (const entry of entries) {
      // oxlint-disable-next-line no-await-in-loop -- sequential merge is required
      await this.loadFromUrl(entry.url, entry)
    }
  }

  public addTranslations(locale: string, translations: Translations, merge = true): void {
    super.loadTranslationsCore(locale, translations, merge)
    this.store.notify()
  }

  public addRouteTranslations(locale: string, routeName: string, translations: Translations, merge = true): void {
    super.loadRouteTranslationsCore(locale, routeName, translations, merge)
    this.store.notify()
  }

  public hasTranslation(key: TranslationKey): boolean {
    return this.helper.hasTranslation(this.getLocale(), key)
  }

  public clear(): void {
    this.clearCache()
  }

  public override clearCache(): void {
    super.clearCache()
    this.store.notify()
  }

  protected override onTranslationsChanged(): void {
    this.store.notify()
  }
}

export function createI18n(options: I18nOptions): I18n {
  return new I18n(options)
}
