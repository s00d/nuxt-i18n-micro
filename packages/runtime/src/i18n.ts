import {
  BaseI18n,
  createReactiveI18nStore,
  TranslationHelper,
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
  /** BCP 47 tag per locale code (`iso`), for a code that is no language tag: `ua` → `uk-UA`. `localeIsoMap(locales)` builds it. */
  localeIso?: Record<string, string>
  /** Set by `fork()`: the instance whose dictionaries, formatters and rules this one shares. */
  parent?: I18n
}

/**
 * Reads the parent's chunks until the first write, then works on its own copy: a fork costs nothing
 * however many chunks there are, and a request that writes cannot reach another one. Stored trees
 * are immutable, so copying the Map is enough. Every write of an instance comes through here;
 * `storage` detaches first, and only `helper.translations` itself still is the parent's Map.
 */
class ForkHelper extends TranslationHelper {
  declare translations: Map<string, Translations>
  private shared = true

  detach(): void {
    if (!this.shared) return
    this.shared = false
    this.translations = new Map(this.translations)
  }

  override setTranslations(locale: string, data: Translations, routeName?: string): void {
    this.detach()
    super.setTranslations(locale, data, routeName)
  }

  override mergeTranslation(locale: string, routeName: string, incoming: Translations): void {
    this.detach()
    super.mergeTranslation(locale, routeName, incoming)
  }

  override clearCache(): void {
    this.detach()
    super.clearCache()
  }
}

export class I18n extends BaseI18n {
  protected readonly ownStore: ReactiveI18nStore
  /** A fork reads its parent's map until its first own rule, as it reads its dictionaries. Only the owner writes to a map. */
  private borrowsLocaleIso = false

  constructor(options: I18nOptions) {
    const { parent } = options
    super({
      // `storage`: a parent that is a fork detaches first, so its later writes land in the Map this fork reads
      helper: parent ? new ForkHelper(parent.storage) : undefined,
      formatter: parent?.formatter,
      plural: options.plural,
      missingWarn: options.missingWarn,
      missingHandler: options.missingHandler,
      numberFormats: options.numberFormats,
      datetimeFormats: options.datetimeFormats,
      timeZone: options.timeZone,
      now: options.now,
      localeIso: options.localeIso,
    })

    // the map itself: `addLocaleIso` on the parent reaches its forks
    if (parent) {
      this.localeIso = parent.localeIso
      this.borrowsLocaleIso = true
    }

    this.ownStore = createReactiveI18nStore({
      locale: options.locale,
      fallbackLocale: options.fallbackLocale || options.locale,
      route: parent?.getRoute(),
    })

    if (parent) {
      this.pluralFunc = parent.pluralFunc
      this.missingWarn = parent.missingWarn
      this.missingHandler = parent.missingHandler
      this.getCustomMissingHandler = parent.getCustomMissingHandler
    }

    if (options.messages || options.routeMessages) {
      this.loadMessages(options.messages, options.routeMessages)
    }
  }

  /** The chunks of this instance. Handing them out detaches a fork: what the caller does with them stays here. */
  get storage(): TranslationStorage {
    if (this.helper instanceof ForkHelper) this.helper.detach()
    return this.helper
  }

  /** The locale, fallback and route state in force. An adapter with per-request state answers its own. */
  protected get store(): ReactiveI18nStore {
    return this.ownStore
  }

  /**
   * A cheap instance for one request or task: own locale, fallback and route, the same dictionaries,
   * formatters and rules. It sees writes to the parent until its first own write; its writes stay in it.
   * Forking a fork counts as that fork's first write.
   */
  public fork(locale: string = this.getLocale()): this {
    const Instance = this.constructor as new (options: I18nOptions) => this
    this.ownLocaleIso()
    return new Instance({ locale, fallbackLocale: this.getFallbackLocale(), parent: this })
  }

  private ownLocaleIso(): void {
    if (this.borrowsLocaleIso) this.localeIso = { ...this.localeIso }
    this.borrowsLocaleIso = false
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
    const loaded = [...Object.keys(messages ?? {}), ...Object.values(routeMessages ?? {}).flatMap((locales) => Object.keys(locales))]
    if (loaded.some((locale) => this.isReadable(locale))) this.store.notify()
  }

  /** Text on screen follows a new plural tag. A render passes `notify: false`: it must not wake other components. */
  public override addLocaleIso(localeIso: Record<string, string>, notify = true): void {
    const before = this.pluralLocale()
    this.ownLocaleIso()
    super.addLocaleIso(localeIso)
    if (notify && this.pluralLocale() !== before) this.store.notify()
  }

  public async loadFromUrl(url: string, options: LoadFromUrlOptions = {}): Promise<void> {
    const locale = options.locale ?? this.getLocale()
    const translations = await fetchJsonTranslations(url, options.init)
    this.addRouteTranslations(locale, options.routeName || 'index', translations)
  }

  /** All or nothing: a failed fetch leaves the dictionaries as they were. Merged in entry order. */
  public async loadFromUrls(entries: LoadFromUrlEntry[]): Promise<void> {
    const loaded = await Promise.all(entries.map((entry) => fetchJsonTranslations(entry.url, entry.init)))
    loaded.forEach((translations, index) => {
      const entry = entries[index]!
      this.addRouteTranslations(entry.locale, entry.routeName || 'index', translations)
    })
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
  private isReadable(locale: string): boolean {
    const { ownStore } = this
    return locale === ownStore.getLocale() || locale === ownStore.getFallbackLocale()
  }

  // `ownStore`: the write landed in this instance, so its subscribers hear it, also inside a request of `run`.
  protected override onTranslationsChanged(locale?: string): void {
    if (locale === undefined || this.isReadable(locale)) this.ownStore.notify()
  }
}

export function createI18n(options: I18nOptions): I18n {
  return new I18n(options)
}
