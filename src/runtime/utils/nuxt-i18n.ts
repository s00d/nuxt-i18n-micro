import {
  BaseI18n,
  FormatService,
  mergeTranslationChunk,
  resolveCachedTranslation,
  setTranslationAtKey,
  translationCacheKey,
  type BaseI18nOptions,
  type TranslationStorage,
} from '@i18n-micro/core'
import type { CleanTranslation, ModuleOptionsExtend, Params, TranslationKey, Translations } from '@i18n-micro/types'
import { PREMERGED_ROOT_PAGE } from '@i18n-micro/utils/merge-source'
import { type ShallowRef, shallowRef, triggerRef } from 'vue'
import { type LoadOptions, translationStorage } from './storage'

export type TranslationFn<T extends CleanTranslation> = (key: TranslationKey, params?: Params, defaultValue?: string | null) => T

export interface RouteTranslationContext {
  locale: string
  routeName: string
}

export type GetRouteTranslationContext = (route?: unknown) => RouteTranslationContext

export type LoadTranslationsChunk = (locale: string, routeName?: string) => Promise<Record<string, unknown>>

/** Why the active translation context changed — used by Vue DevTools timeline. */
export type I18nContextChangeReason = 'load' | 'refresh'

export interface NuxtI18nOptions extends BaseI18nOptions {
  /**
   * Cap for `storage.translations` chunk entries (`locale:route`).
   * `0` means no limit. Same module option as the fetch/server `CacheControl` layers.
   * @default 0
   */
  cacheMaxSize?: number
}

const formatters = new WeakMap<ModuleOptionsExtend, FormatService>()

/**
 * The server's formatters. `Intl` objects are costly and depend only on what the service is built
 * from, so requests share them: its input is this read-only config, and no request reaches it
 * (`$tn` and `$td` pass the locale per call). One per resolved config: runtime overrides and hosts.
 */
export function formatterFor(config: ModuleOptionsExtend): FormatService {
  let formatter = formatters.get(config)
  if (!formatter) formatters.set(config, (formatter = new FormatService(config)))
  return formatter
}

export class NuxtI18n extends BaseI18n {
  readonly storage: TranslationStorage
  private readonly cacheMaxSize: number
  protected readonly contextSignal: ShallowRef<number>
  protected cachedTranslations: Record<string, unknown> = {}
  /**
   * Hot-reload buffer for page transitions: the leaving page's chunk, kept until it unmounts.
   *
   * `$t` falls through here on a miss so the old page keeps rendering while the new chunk is
   * already installed. Cleared in `finishTransition`.
   */
  private outgoingTranslations: Record<string, unknown> | null = null
  /** A lookup was answered from `outgoingTranslations`: only then does dropping it change a render. */
  private outgoingServed = false
  /** Chunks that hold only what was patched in: no page's file has reached them, so to a loader they are not loaded. */
  private readonly fragments = new Set<string>()
  private currentLocale = ''
  private currentRouteName = ''
  private resolveRouteContext?: GetRouteTranslationContext
  private readonly contextListeners = new Set<(reason: I18nContextChangeReason) => void>()
  private missingKeyListener?: (locale: string, key: string, routeName: string) => void

  constructor(options: NuxtI18nOptions = {}) {
    const { cacheMaxSize = 0, ...baseOptions } = options
    const storage: TranslationStorage = {
      translations: new Map<string, Translations>(),
    }

    super({ ...baseOptions, storage })
    this.storage = storage
    this.cacheMaxSize = cacheMaxSize
    this.contextSignal = shallowRef(0)
  }

  setRouteContextResolver(resolver: GetRouteTranslationContext): void {
    this.resolveRouteContext = resolver
  }

  getCacheKey(locale: string, routeName?: string): string {
    return translationCacheKey(locale, routeName)
  }

  getChunk(locale: string, routeName?: string): Record<string, unknown> {
    return (this.storage.translations.get(this.getCacheKey(locale, routeName)) ?? {}) as Record<string, unknown>
  }

  /** The chunk is loaded. What a patch alone stored is a fragment, see `installChunk`. */
  hasChunk(locale: string, routeName?: string): boolean {
    const key = this.getCacheKey(locale, routeName)
    return this.storage.translations.has(key) && !this.fragments.has(key)
  }

  /**
   * A chunk fresh from a load or the cache, under what was patched in before it came: patches win. Without any, it
   * is stored as it is: a stored tree is never written to, so it needs no copy.
   */
  installChunk(locale: string, routeName: string | undefined, data: Record<string, unknown>): Record<string, unknown> {
    const existing = this.getChunk(locale, routeName)
    const chunk = Object.keys(existing).length ? mergeTranslationChunk(existing, data, { preserveExisting: true }) : data
    const key = this.getCacheKey(locale, routeName)
    this.storage.translations.set(key, chunk as Translations)
    this.fragments.delete(key)
    this.evictChunks(key)
    return chunk
  }

  mergeChunk(locale: string, routeName: string | undefined, data: Record<string, unknown>): Record<string, unknown> {
    const merged = mergeTranslationChunk(this.getChunk(locale, routeName), data)
    this.storePatched(this.getCacheKey(locale, routeName), merged)
    return merged
  }

  /** A tree a patch made: over no loaded chunk (a stand-in, an evicted one) it is a fragment, and the next visit still loads. */
  protected storePatched(key: string, tree: Record<string, unknown>): void {
    if (!this.storage.translations.has(key)) this.fragments.add(key)
    this.storage.translations.set(key, tree as Translations)
    this.evictChunks(key)
  }

  /**
   * FIFO eviction for `storage.translations` when `cacheMaxSize` is set.
   * Prefers keeping the just-written key and the active page chunk. When those
   * two differ and `max` cannot hold both (e.g. `cacheMaxSize: 1`), the just-written
   * key wins so the configured bound is always enforced. Active `$t` still resolves
   * via `cachedTranslations` / `outgoingTranslations` even if the Map drops the old key.
   */
  private evictChunks(keep: string): void {
    const max = this.cacheMaxSize
    if (max <= 0 || this.storage.translations.size <= max) return

    const { translations } = this.storage
    const current = this.getCacheKey(this.currentLocale, this.currentRouteName)
    // oldest first, the active chunk last: it goes only when `keep` and it cannot both fit
    const victims = [...translations.keys()].filter((key) => key !== keep && key !== current)
    if (current !== keep) victims.push(current)
    for (const key of victims) {
      if (translations.size <= max) return
      translations.delete(key)
    }
  }

  getLocale(): string {
    return this.currentLocale
  }

  getFallbackLocale(): string {
    return this.currentLocale
  }

  getRoute(): string {
    return this.currentRouteName || 'index'
  }

  getCurrentRouteName(): string {
    return this.currentRouteName
  }

  onContextChange(listener: (reason: I18nContextChangeReason) => void): () => void {
    this.contextListeners.add(listener)
    return () => {
      this.contextListeners.delete(listener)
    }
  }

  onMissingKey(listener: (locale: string, key: string, routeName: string) => void): () => void {
    this.missingKeyListener = listener
    return () => {
      if (this.missingKeyListener === listener) {
        this.missingKeyListener = undefined
      }
    }
  }

  private notifyContextChange(reason: I18nContextChangeReason): void {
    // over a copy, each guarded: a throwing listener (devtools) must not abort a context switch
    for (const listener of [...this.contextListeners]) {
      if (!this.contextListeners.has(listener)) continue // unsubscribed by an earlier listener
      try {
        listener(reason)
      } catch (error) {
        console.error('[i18n] context listener failed:', error)
      }
    }
  }

  /**
   * Hot-reload the active dictionary for the next route — replace, don't merge.
   *
   * Same-locale nav: stash the old chunk in `outgoingTranslations` so the leaving page still
   * resolves `$t` until `finishTransition`. Cross-locale: drop it, old keys must not leak.
   *
   * Why not merge into one object: full deep merge is ~3.8 ms on a real dictionary per nav;
   * a shallow merge loses nested keys. Two plain objects + fallthrough on miss is cheaper
   * and correct for the short hot-reload window.
   */
  applySwitchContext(locale: string, routeName: string | undefined, data: Record<string, unknown> | null): void {
    this.outgoingTranslations = this.currentLocale === locale ? this.cachedTranslations : null
    this.outgoingServed = false
    this.cachedTranslations = data ?? {}

    this.currentLocale = locale
    this.currentRouteName = routeName || ''
    this.notifyLoaded()
  }

  /**
   * Swap the active dictionary for a fresh copy of the same page. Not a page change: a live
   * transition keeps its outgoing layer, the leaving page is still on screen.
   */
  replaceDictionary(data: Record<string, unknown>): void {
    this.cachedTranslations = data
    this.notifyLoaded()
    this.notifyContextChange('refresh')
  }

  /** The leaving page's chunk while it may still render, or null. */
  get outgoing(): Record<string, unknown> | null {
    return this.outgoingTranslations
  }

  /**
   * The outgoing page has unmounted, so its keys must stop resolving. `outgoing` names which
   * page left: a transition that ends after the next navigation must not drop that one's chunk.
   */
  finishTransition(outgoing: Record<string, unknown> | null = this.outgoingTranslations): void {
    if (outgoing === null || outgoing !== this.outgoingTranslations) return
    this.outgoingTranslations = null
    if (this.outgoingServed) triggerRef(this.contextSignal)
    this.notifyContextChange('refresh')
  }

  /** Merge a fragment into a chunk and, when that chunk is on screen, into the active dictionary. */
  protected patch(locale: string, routeName: string, translations: Translations): void {
    const stored = this.storage.translations.get(this.getCacheKey(locale, routeName))
    const merged = this.mergeChunk(locale, routeName, translations as Record<string, unknown>)
    // a route with no name reads the index chunk: a 404 page is on screen for that patch too
    if (locale !== this.currentLocale || (routeName || 'index') !== this.getRoute()) return
    // One tree on screen and in store takes the one merge. Otherwise the patch, not the merged chunk: the active
    // dictionary already holds this chunk, so walking the whole thing again costs its size for a few new keys.
    const onScreen = this.cachedTranslations
    this.cachedTranslations = stored === onScreen ? merged : mergeTranslationChunk(onScreen, translations as Record<string, unknown>)
    this.notifyLoaded()
  }

  /** The active dictionary changed: what rendered from it renders again. */
  protected notifyLoaded(): void {
    triggerRef(this.contextSignal)
    this.notifyContextChange('load')
  }

  mergeTranslations(newTranslations: Translations): void {
    this.patch(this.currentLocale, this.currentRouteName, newTranslations)
  }

  async loadPageTranslations(locale: string, routeName: string, translations: Translations): Promise<void> {
    this.patch(locale, routeName, translations)
  }

  async mergeTranslationAsync(locale: string, routeName: string, newTranslations: Translations, loadIfMissing: LoadTranslationsChunk): Promise<void> {
    if (!this.hasChunk(locale, routeName)) {
      const loaded = await loadIfMissing(locale, routeName || undefined)
      // a failed load answers `{}`: what the patch stores stays a fragment, and the next navigation tries again
      if (!this.hasChunk(locale, routeName) && Object.keys(loaded).length) this.installChunk(locale, routeName, loaded)
    }

    this.patch(locale, routeName, newTranslations)
  }

  tForRoute(route: unknown): TranslationFn<CleanTranslation> {
    return (key, params, defaultValue) => this.t(key, params, defaultValue, route)
  }

  tsForRoute(route: unknown): TranslationFn<string> {
    return (key, params, defaultValue) => this.ts(key, params, defaultValue ?? undefined, route)
  }

  protected override touch(): void {
    this.contextSignal.value
  }

  /** The chunk a route reads from, when routes are known here. */
  protected chunkKeyOf(routeContext: unknown): string | undefined {
    if (!this.resolveRouteContext) return undefined
    const { locale, routeName } = this.resolveRouteContext(routeContext)
    return this.getCacheKey(locale, routeName)
  }

  protected override resolveLookup(key: TranslationKey, routeContext?: unknown): unknown | null {
    const chunkKey = routeContext ? this.chunkKeyOf(routeContext) : undefined
    const translations =
      chunkKey === undefined ? this.cachedTranslations : ((this.storage.translations.get(chunkKey) ?? {}) as Record<string, unknown>)

    // every dictionary here is replaced, never edited: the per-tree leaf cache stays valid
    const value = resolveCachedTranslation(translations, String(key))
    if (value !== null || translations !== this.cachedTranslations) return value

    if (this.outgoingTranslations === null) return null
    const leaving = resolveCachedTranslation(this.outgoingTranslations, String(key))
    if (leaving !== null) this.outgoingServed = true
    return leaving
  }

  protected override resolveHas(key: TranslationKey, routeContext?: unknown): boolean {
    return this.resolveLookup(key, routeContext) !== null
  }

  /**
   * Dump what `$t` can resolve right now — including the hot-reload buffer while a transition
   * is in flight. Outside that window this is just `cachedTranslations`.
   */
  public override resolveTranslations(routeContext?: unknown): Translations {
    this.touch()
    if (routeContext && this.resolveRouteContext) {
      const { locale, routeName } = this.resolveRouteContext(routeContext)
      return this.getChunk(locale, routeName) as Translations
    }

    if (this.outgoingTranslations === null) return this.cachedTranslations as Translations
    this.outgoingServed = true
    return this.resolveTranslationTree(this.outgoingTranslations, this.cachedTranslations)
  }

  /**
   * Replace the value at `key`, in the active dictionary and in the chunk behind it.
   *
   * Both, because they answer different questions: the dictionary is what the current page
   * renders from, the chunk is what a return to this route re-installs. Writing only the
   * first makes the change vanish on the next navigation.
   */
  public override setTranslation(key: TranslationKey, value: unknown): void {
    this.cachedTranslations = setTranslationAtKey(this.cachedTranslations, String(key), value)
    const chunk = this.getChunk(this.currentLocale, this.currentRouteName)
    this.storePatched(this.getCacheKey(this.currentLocale, this.currentRouteName), setTranslationAtKey(chunk, String(key), value))
    triggerRef(this.contextSignal)
    this.notifyContextChange('refresh')
  }

  protected override getMissingContext(routeContext?: unknown): { locale: string; routeName: string } {
    if (routeContext && this.resolveRouteContext) {
      return this.resolveRouteContext(routeContext)
    }
    return { locale: this.currentLocale, routeName: this.currentRouteName }
  }

  protected override warnMissing(key: TranslationKey, routeContext?: unknown): void {
    const { locale, routeName } = this.getMissingContext(routeContext)
    this.missingKeyListener?.(locale, String(key), routeName)
    const customHandler = this.getCustomMissingHandler?.()
    if (customHandler) {
      customHandler(locale, String(key), routeName)
      return
    }
    if (this.missingWarn && process.env.NODE_ENV !== 'production' && import.meta.client) {
      console.warn(`[i18n] Missing key '${key}' in '${locale}' for route '${routeName}'`)
    }
  }

  /** Drop every stored chunk but keep the dictionary on screen until a reload replaces it. */
  dropChunks(): void {
    this.fragments.clear()
    super.clearCache()
  }

  public override clearCache(): void {
    this.fragments.clear()
    super.clearCache()
    this.cachedTranslations = {}
    this.outgoingTranslations = null
    triggerRef(this.contextSignal)
    this.notifyContextChange('refresh')
  }
}

export interface NuxtTranslationLoaderOptions {
  i18n: NuxtI18n
  loadOptions: LoadOptions
  /** The render is a file: a first page with no dictionary fails, as raw keys would stay in it. */
  prerender?: boolean
}

export class NuxtTranslationLoader {
  private readonly pendingLoads = new Map<string, Promise<Record<string, unknown> | null>>()
  /**
   * Monotonic token so a slower in-flight `switchContext` (`$switchLocale` without a URL to move)
   * cannot overwrite a newer one. Navigations do not need it: they apply when they commit.
   */
  private switchGeneration = 0

  constructor(private readonly options: NuxtTranslationLoaderOptions) {}

  /**
   * Bump the switch generation so any in-flight `switchContext` becomes a no-op.
   * Call on every navigation that may supersede a pending load.
   */
  invalidatePendingSwitches(): void {
    this.switchGeneration++
  }

  loadFromCacheSync(locale: string, routeName?: string): Record<string, unknown> | null {
    const { i18n } = this.options

    if (i18n.hasChunk(locale, routeName)) {
      return i18n.getChunk(locale, routeName)
    }

    const cached = translationStorage.getFromCache(locale, routeName)
    return cached && i18n.installChunk(locale, routeName, cached)
  }

  /** The chunk, or `{}` when the load fails (a page without translations still renders). */
  async loadAsync(locale: string, routeName?: string): Promise<Record<string, unknown>> {
    return (await this.loadChunk(locale, routeName)) ?? {}
  }

  /** The loaded chunk, or null when the load failed (reported here): a reload must tell that from an empty chunk. */
  private loadChunk(locale: string, routeName?: string): Promise<Record<string, unknown> | null> {
    const { i18n, loadOptions } = this.options
    const cacheKey = i18n.getCacheKey(locale, routeName)
    const pending = this.pendingLoads.get(cacheKey)
    if (pending) return pending

    const promise = (async () => {
      try {
        return i18n.installChunk(locale, routeName, await translationStorage.load(locale, routeName, loadOptions))
      } catch (e) {
        if (process.env.NODE_ENV !== 'production') console.error('[i18n] Load error:', e)
        else console.warn('[i18n] Translation load failed:', locale, routeName)
        return null
      } finally {
        this.pendingLoads.delete(cacheKey)
      }
    })()

    this.pendingLoads.set(cacheKey, promise)
    return promise
  }

  /**
   * Reload the current context's dictionary (after a cache clear, an HMR edit). Unlike
   * {@link switchContext} it does not supersede an in-flight navigation: the fresh chunk is
   * applied only if the context is still the one it was loaded for.
   */
  async refresh(): Promise<void> {
    const { i18n } = this.options
    const locale = i18n.getLocale()
    const routeName = i18n.getCurrentRouteName() || undefined
    const data = await this.loadChunk(locale, routeName)
    // a failed load keeps what is on screen; an empty dictionary would show raw keys
    if (data === null) return
    if (i18n.getLocale() !== locale || (i18n.getCurrentRouteName() || undefined) !== routeName) return
    i18n.replaceDictionary(data)
  }

  /**
   * Drop every cached chunk (storage and instance) and reload the current page's dictionary.
   * The page keeps its current dictionary until the fresh one is applied: no raw keys between.
   */
  async reload(): Promise<void> {
    translationStorage.clear()
    this.options.i18n.dropChunks()
    await this.refresh()
  }

  /** The chunk of a context, cached or loaded, or null when its load failed. */
  fetchContext(locale: string, routeName?: string): Record<string, unknown> | Promise<Record<string, unknown> | null> {
    return this.loadFromCacheSync(locale, routeName) ?? this.loadChunk(locale, routeName)
  }

  /**
   * Make a fetched chunk the active context. `false` when its load failed: that keeps what is on screen, as
   * refresh() does, since an empty dictionary would turn the strings that still work (a layout's) into raw keys.
   * Only a first render has nothing to keep. A prerender throws there instead: no next request would load it again.
   */
  applyContext(locale: string, routeName: string | undefined, data: Record<string, unknown> | null): boolean {
    const { i18n, prerender } = this.options
    if (data === null && i18n.getLocale()) return false
    if (data === null && prerender) throw new Error(`[i18n] Translation load failed: ${locale} ${routeName}`)
    i18n.applySwitchContext(locale, routeName, data)
    return true
  }

  /**
   * Load and apply translations for a locale/route. Returns `false` when the switch did not
   * apply — a newer navigation superseded it, or its chunk failed to load — and callers must
   * skip post-await side effects (e.g. `setLocale`). The next navigation loads it again.
   */
  async switchContext(locale: string, routeName?: string): Promise<boolean> {
    const generation = ++this.switchGeneration
    const data = await this.fetchContext(locale, routeName)
    const shown = data ?? (await this.firstRenderStandIn(locale, routeName))
    return generation === this.switchGeneration && this.applyContext(locale, routeName, shown)
  }

  /**
   * A first render whose chunk failed has nothing to keep, but its root dictionary can be at hand (the shared
   * cache in a host outage): the layout's strings stay text. A prerender must fail instead, it would keep the file.
   */
  private firstRenderStandIn(locale: string, routeName?: string): ReturnType<NuxtTranslationLoader['fetchContext']> | null {
    const { i18n, prerender } = this.options
    if (prerender || i18n.getLocale() || routeName === PREMERGED_ROOT_PAGE) return null
    return this.fetchContext(locale, PREMERGED_ROOT_PAGE)
  }
}
