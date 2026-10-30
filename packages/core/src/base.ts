import type { CleanTranslation, Getter, MissingHandler, Params, PluralFunc, TranslationKey, Translations } from '@i18n-micro/types'
import { FormatService, type DateTimeFormatsConfig, type NumberFormatsConfig } from './format-service'
import { type TranslationStorage, TranslationHelper } from './storage'
import { translationCacheKey } from './strategy'
import { clearTemplateCache, defaultPlural, interpolate } from './text'
import { mergeTranslationLayers, setTranslationAtKey, type Tree } from './tree'

export interface BaseI18nOptions {
  storage?: TranslationStorage
  /** Instead of `storage`: a helper of the adapter's own, such as a fork's copy-on-write one. */
  helper?: TranslationHelper
  /** Shared formatters: a request instance keeps its parent's `Intl` objects, which are costly to build. */
  formatter?: FormatService
  plural?: PluralFunc
  missingWarn?: boolean
  missingHandler?: (locale: string, key: string, routeName: string) => void
  getCustomMissingHandler?: () => MissingHandler | null
  /** Named number formats per locale (Vue I18n-compatible). */
  numberFormats?: NumberFormatsConfig
  /** Named datetime formats per locale (Vue I18n-compatible `datetimeFormats`). */
  datetimeFormats?: DateTimeFormatsConfig
  /** IANA zone for dates (`Europe/Berlin`): set it so server and browser render one date. */
  timeZone?: string
}

/** Remembers the `locale:route` string for the last pair, so a hot `t()` neither concatenates nor rehashes. */
class ChunkKey {
  private locale = ''
  private route = ''
  private key = ''

  of(locale: string, route: string): string {
    if (locale !== this.locale || route !== this.route || this.key === '') {
      this.locale = locale
      this.route = route
      this.key = translationCacheKey(locale, route)
    }
    return this.key
  }
}

/**
 * `process.env.NODE_ENV` as bundlers inline it; an unbundled browser has no `process` and
 * counts as development instead of throwing.
 */
function isProduction(): boolean {
  try {
    return process.env.NODE_ENV === 'production'
  } catch {
    return false
  }
}

/** Layered dumps by their layers: stored trees are never mutated, so identity is enough. */
const LAYERED = new WeakMap<object, WeakMap<object, Translations>>()

const isRootRoute = (route: string): boolean => route === 'index' || route === ''

type FormatArgs<O> = [keyOrOptions?: string | O, localeOrOverrides?: string | O, overrides?: O]

/**
 * Translation logic shared by every adapter (`t`, `ts`, `tc`, `tn`, `td`, `tdr`, `has`).
 * Adapters supply the current locale, fallback locale and route; lookups always read the
 * storage as it is now (no pinned trees; the helper's leaf cache is keyed by tree identity).
 */
export abstract class BaseI18n {
  public helper: TranslationHelper
  public formatter: FormatService
  public pluralFunc: PluralFunc
  public missingWarn: boolean
  public missingHandler?: (locale: string, key: string, routeName: string) => void
  public getCustomMissingHandler?: () => MissingHandler | null

  private activeKey = new ChunkKey()
  private activeRootKey = new ChunkKey()
  private fallbackKey = new ChunkKey()
  private fallbackRootKey = new ChunkKey()

  constructor(options: BaseI18nOptions = {}) {
    this.helper = options.helper ?? new TranslationHelper(options.storage)
    this.formatter = options.formatter ?? new FormatService(options)
    const plural = options.plural
    // A custom rule returning null/undefined falls back to the default one (#241).
    this.pluralFunc = plural && plural !== defaultPlural ? (...args) => plural(...args) ?? defaultPlural(...args) : defaultPlural
    this.missingWarn = options.missingWarn ?? true
    this.missingHandler = options.missingHandler
    this.getCustomMissingHandler = options.getCustomMissingHandler
  }

  public abstract getLocale(): string
  public abstract getFallbackLocale(): string
  public abstract getRoute(): string

  /** Called before every read; adapters use it for reactivity tracking. */
  protected touch(): void {}

  /** Route name of a route context (a string, or whatever an adapter understands). */
  protected resolveRouteName(routeContext?: unknown): string {
    return typeof routeContext === 'string' ? routeContext : this.getRoute()
  }

  /**
   * Value of `key`, `null` when nothing has it. Layers, first hit wins: the route's chunk, the
   * locale's root (`index`) chunk, then the same two in the fallback locale. A route chunk holds
   * only its own keys: root keys are read from the root chunk, never copied into every route.
   */
  protected resolveLookup(key: TranslationKey, routeContext?: unknown): unknown | null {
    const locale = this.getLocale()
    const route = this.resolveRouteName(routeContext)
    const name = String(key)
    const own = this.lookupLocale(locale, route, name, this.activeKey, this.activeRootKey)
    if (own !== null) return own
    const fallback = this.getFallbackLocale()
    return fallback === locale ? null : this.lookupLocale(fallback, route, name, this.fallbackKey, this.fallbackRootKey)
  }

  private lookupLocale(locale: string, route: string, name: string, page: ChunkKey, root: ChunkKey): unknown | null {
    const value = this.helper.lookup(page.of(locale, route), name)
    return value !== null || isRootRoute(route) ? value : this.helper.lookup(root.of(locale, 'index'), name)
  }

  /** Whether the active locale itself (its route or root chunk, not the fallback) defines `key`. */
  protected resolveHas(key: TranslationKey, routeContext?: unknown): boolean {
    return this.lookupLocale(this.getLocale(), this.resolveRouteName(routeContext), String(key), this.activeKey, this.activeRootKey) !== null
  }

  /** Two live layers as one tree, via {@link mergeTranslationLayers}; reused while both are the same objects. */
  protected resolveTranslationTree(lower: Record<string, unknown>, upper: Record<string, unknown>): Translations {
    let byUpper = LAYERED.get(lower)
    if (!byUpper) LAYERED.set(lower, (byUpper = new WeakMap()))
    let tree = byUpper.get(upper)
    if (!tree) byUpper.set(upper, (tree = mergeTranslationLayers(lower, upper) as Translations))
    return tree
  }

  /** Everything `t()` can resolve right now for the active locale and route: its layers as one tree (read-only). */
  public resolveTranslations(routeContext?: unknown): Translations {
    this.touch()
    const locale = this.getLocale()
    const route = this.resolveRouteName(routeContext)
    const fallback = this.getFallbackLocale()
    const locales = fallback === locale ? [locale] : [fallback, locale]
    const layers = locales
      .flatMap((code) =>
        isRootRoute(route) ? [this.helper.getCache(code, 'index')] : [this.helper.getCache(code, 'index'), this.helper.getCache(code, route)],
      )
      .filter((tree): tree is Translations => tree !== undefined)
    if (layers.length === 0) return {} as Translations
    return layers.reduce((lower, upper) => this.resolveTranslationTree(lower as Tree, upper as Tree))
  }

  /** Called after every write (load, merge, set, clear): the one place adapters bump their reactivity. */
  protected onTranslationsChanged(): void {}

  protected getMissingContext(routeContext?: unknown): { locale: string; routeName: string } {
    return { locale: this.getLocale(), routeName: this.resolveRouteName(routeContext) }
  }

  /** Dev-only browser `console.warn`, gated by `missingWarn`. */
  protected warnDev(message: string): void {
    if (this.missingWarn && typeof window !== 'undefined' && !isProduction()) console.warn(message)
  }

  protected warnMissing(key: TranslationKey, routeContext?: unknown): void {
    const { locale, routeName } = this.getMissingContext(routeContext)
    const handler = this.getCustomMissingHandler?.() ?? this.missingHandler
    if (handler) handler(locale, String(key), routeName)
    else this.warnDev(`Not found '${key}' key in '${locale}' locale messages for route '${routeName}'.`)
  }

  protected warnMissingFormat(kind: 'number' | 'datetime', key: string, locale: string): void {
    this.warnDev(`Not found '${key}' ${kind} format in '${locale}' locale. Falling back to default Intl options.`)
  }

  public t(key: TranslationKey, params?: Params, defaultValue?: string | null, routeContext?: unknown): CleanTranslation {
    if (!key) return ''
    this.touch()
    const value = this.resolveLookup(key, routeContext)
    if (value === null || value === undefined) {
      this.warnMissing(key, routeContext)
      return (defaultValue || key) as CleanTranslation
    }
    return (params && typeof value === 'string' ? interpolate(value, params) : value) as CleanTranslation
  }

  public ts(key: TranslationKey, params?: Params, defaultValue?: string, routeContext?: unknown): string {
    return this.t(key, params, defaultValue, routeContext)?.toString() ?? defaultValue ?? key
  }

  public tc(key: TranslationKey, count: number | Params, defaultValue?: string): string {
    this.touch()
    const { count: countValue, ...params } = typeof count === 'number' ? { count } : count
    if (countValue === undefined || countValue === null) return defaultValue ?? key
    // Missing key: `undefined` unless a default is passed, so `defaultPlural` (which calls
    // `getter(key)`) sees the miss. With params the value is interpolated for custom rules.
    const getter: Getter = (k, p, dv) => {
      const raw = this.resolveLookup(k)
      if (raw === null || raw === undefined) return dv === undefined ? undefined : dv || k
      return p && typeof raw === 'string' ? interpolate(raw, p) : raw
    }
    const result = this.pluralFunc(key, Number(countValue), params, this.getLocale(), getter)
    if (result !== null && result !== undefined) return result
    if (this.resolveLookup(key) === null) this.warnMissing(key)
    return defaultValue ?? key
  }

  /** Format a number; Vue I18n-style named formats: `tn(1000, 'currency')`. */
  public tn(value: number, options?: Intl.NumberFormatOptions): string
  public tn(value: number, key: string, overrides?: Intl.NumberFormatOptions): string
  public tn(value: number, key: string, locale: string, overrides?: Intl.NumberFormatOptions): string
  public tn(value: number, ...args: FormatArgs<Intl.NumberFormatOptions>): string {
    this.touch()
    const [locale, options] = this.formatArgs('number', args)
    return this.formatter.formatNumber(value, locale, options)
  }

  /** Format a date; Vue I18n-style named formats: `td(date, 'short')`. */
  public td(value: Date | number | string, options?: Intl.DateTimeFormatOptions): string
  public td(value: Date | number | string, key: string, overrides?: Intl.DateTimeFormatOptions): string
  public td(value: Date | number | string, key: string, locale: string, overrides?: Intl.DateTimeFormatOptions): string
  public td(value: Date | number | string, ...args: FormatArgs<Intl.DateTimeFormatOptions>): string {
    this.touch()
    const [locale, options] = this.formatArgs('datetime', args)
    return this.formatter.formatDate(value, locale, options)
  }

  public tdr(value: Date | number | string, options?: Intl.RelativeTimeFormatOptions): string {
    this.touch()
    return this.formatter.formatRelativeTime(value, this.getLocale(), options)
  }

  public has(key: TranslationKey, routeContext?: unknown): boolean {
    this.touch()
    return this.resolveHas(key, routeContext)
  }

  /**
   * Replace the value at `key` in the active locale and route (a subtree, a string, anything):
   * `set`, not `merge`, so siblings under `key` are dropped. Visible to `t()` at once.
   */
  public setTranslation(key: TranslationKey, value: unknown): void {
    const locale = this.getLocale()
    const route = this.getRoute()
    const current = (this.helper.getCache(locale, route) ?? {}) as Tree
    this.helper.setTranslations(locale, setTranslationAtKey(current, String(key), value) as Translations, route)
    this.onTranslationsChanged()
  }

  /** Clear translation and formatter caches. */
  public clearCache(): void {
    this.helper.clearCache()
    this.formatter.clearCache()
    clearTemplateCache()
    this.onTranslationsChanged()
  }

  /** Load root translations: deep-merge, or replace the chunk when `merge` is false. */
  public loadTranslationsCore(locale: string, translations: Translations, merge: boolean, routeName = 'index'): void {
    this.write(locale, routeName, translations, merge)
  }

  /** Load a route's own translations (root keys come from the root chunk): deep-merge, or replace when `merge` is false. */
  public loadRouteTranslationsCore(locale: string, routeName: string, translations: Translations, merge: boolean): void {
    this.write(locale, routeName, translations, merge)
  }

  private write(locale: string, routeName: string, translations: Translations, merge: boolean): void {
    if (merge) this.helper.mergeTranslation(locale, routeName, translations)
    else this.helper.setTranslations(locale, translations, routeName)
    this.onTranslationsChanged()
  }

  /** Attach framework-specific helpers onto this instance (`localizePath`, …). */
  public extend<M extends Record<string, unknown>>(methods: M & ThisType<this & M>): this & M {
    return Object.assign(this, methods) as this & M
  }

  /** `(key | options, locale | overrides, overrides)` → locale and the options to format with. */
  private formatArgs<O extends object>(
    kind: 'number' | 'datetime',
    [keyOrOptions, localeOrOverrides, overrides]: FormatArgs<O>,
  ): [string, O | undefined] {
    const current = this.getLocale()
    if (typeof keyOrOptions !== 'string') return [current, keyOrOptions]
    const locale = typeof localeOrOverrides === 'string' ? localeOrOverrides : current
    const extra = typeof localeOrOverrides === 'string' ? overrides : localeOrOverrides
    const named = (
      kind === 'number' ? this.formatter.resolveNumberFormat(locale, keyOrOptions) : this.formatter.resolveDateTimeFormat(locale, keyOrOptions)
    ) as O | undefined
    if (!named) this.warnMissingFormat(kind, keyOrOptions, locale)
    return [locale, named && extra ? { ...named, ...extra } : (named ?? extra)]
  }
}
