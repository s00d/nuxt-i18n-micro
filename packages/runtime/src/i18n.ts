import {
  BaseI18n,
  createReactiveI18nStore,
  type DateTimeFormatsConfig,
  type NumberFormatsConfig,
  type ReactiveI18nStore,
  type TranslationStorage,
} from '@i18n-micro/core'
import type { PluralFunc, TranslationKey, Translations } from '@i18n-micro/types'
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
  /** Named number formats per locale (`tn(n, 'currency')`). */
  numberFormats?: NumberFormatsConfig
  /** Named datetime formats per locale (`td(d, 'short')`). */
  datetimeFormats?: DateTimeFormatsConfig
  /** IANA zone for dates (`Europe/Berlin`): set it so server and browser render one date. */
  timeZone?: string
  /** The clock of relative dates: hand hydration the server's time so both render one text. */
  now?: () => number
  /** BCP 47 tag per locale code (`iso`), for a code that is no language tag: `ua` → `uk-UA`. */
  localeIso?: Record<string, string>
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
      numberFormats: options.numberFormats,
      datetimeFormats: options.datetimeFormats,
      timeZone: options.timeZone,
      now: options.now,
      localeIso: options.localeIso,
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
   * Load root and optional route-scoped translation maps into the instance. A route chunk holds
   * the route's own keys; root keys resolve from the root chunk (also ones added later).
   */
  public loadMessages(messages?: Record<string, Translations>, routeMessages?: Record<string, Record<string, Translations>>): void {
    for (const [locale, translations] of Object.entries(messages ?? {})) this.helper.mergeTranslation(locale, 'index', translations)
    for (const [routeName, locales] of Object.entries(routeMessages ?? {}))
      for (const [locale, translations] of Object.entries(locales)) this.helper.mergeTranslation(locale, routeName, translations)
    this.onTranslationsChanged()
  }

  public async loadFromUrl(url: string, options: LoadFromUrlOptions = {}): Promise<void> {
    const locale = options.locale ?? this.getLocale()
    const translations = await fetchJsonTranslations(url, options.init)
    this.addRouteTranslations(locale, options.routeName || 'index', translations)
  }

  public async loadFromUrls(entries: LoadFromUrlEntry[]): Promise<void> {
    // Sequential on purpose: parallel merges into the same locale Map can race.
    for (const entry of entries) {
      // oxlint-disable-next-line no-await-in-loop -- sequential merge is required
      await this.loadFromUrl(entry.url, entry)
    }
  }

  public addTranslations(locale: string, translations: Translations, merge = true): void {
    this.loadTranslationsCore(locale, translations, merge)
  }

  public addRouteTranslations(locale: string, routeName: string, translations: Translations, merge = true): void {
    this.loadRouteTranslationsCore(locale, routeName, translations, merge)
  }

  public hasTranslation(key: TranslationKey): boolean {
    // Route-independent: scan every chunk for the active locale (unlike `has()`, which is route-scoped).
    return this.helper.hasTranslation(this.getLocale(), key)
  }

  public clear(): void {
    this.clearCache()
  }

  // Only the active and the fallback locale can be read: preloading another one renders nothing.
  protected override onTranslationsChanged(locale?: string): void {
    if (locale === undefined || locale === this.store.getLocale() || locale === this.store.getFallbackLocale()) this.store.notify()
  }
}

export function createI18n(options: I18nOptions): I18n {
  return new I18n(options)
}
