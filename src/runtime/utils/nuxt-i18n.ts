import {
  BaseI18n,
  isNoPrefixStrategy,
  mergeTranslationChunk,
  resolveCachedTranslation,
  setTranslationAtKey,
  translationCacheKey,
  type BaseI18nOptions,
  type TranslationStorage,
} from '@i18n-micro/core'
import type { PathStrategy, ResolvedRouteLike, RouteLike } from '@i18n-micro/path-strategy'
import type { CleanTranslation, I18nRouteParams, MissingHandler, ModuleOptionsExtend, Params, TranslationKey, Translations } from '@i18n-micro/types'
/**
 * Merging is for *patches* only — `$mergeTranslations`, `$loadPageTranslations` — where the
 * input is a fragment of a tree and everything it does not mention has to survive. Patches
 * are small, so a full recursive walk costs nothing.
 *
 * Navigation does not merge at all: installing a chunk replaces the active dictionary and
 * keeps the outgoing one as a fallback layer (see `applySwitchContext`). A merge there
 * would have to walk the whole incoming chunk to be correct — ~3.8 ms on the playground's
 * 103k-key dictionary, on every navigation.
 */
import { deepMergeTranslationsRecursive } from '@i18n-micro/utils/deep-merge'
import { type ShallowRef, shallowRef, triggerRef, unref } from 'vue'
import type {
  RouteLocationNamedRaw,
  RouteLocationNormalizedLoaded,
  RouteLocationRaw,
  RouteLocationResolved,
  RouteLocationResolvedGeneric,
  Router,
} from 'vue-router'
import type { GetLocaleFromRoute } from '../composables/useI18nLocale'
import { type LoadOptions, translationStorage } from './storage'
import { applyTrailingSlash } from './trailing-slash'

export type TranslationFn<T extends CleanTranslation> = (key: TranslationKey, params?: Params, defaultValue?: string | null) => T

interface LocaleRouteResult {
  name?: string | symbol | null
  params?: Record<string, unknown>
  path?: string
  fullPath?: string
  query?: Record<string, unknown>
  hash?: string
}

/**
 * The strategy's result as a resolved location. `name` and `params` are kept: NuxtLink and
 * router.push resolve a named location with a Map lookup instead of matching the path.
 */
function toRouteLocationResolved(result: LocaleRouteResult): RouteLocationResolved {
  const fullPath = result.fullPath ?? result.path ?? ''
  const path = result.path ?? fullPath.split(/[?#]/)[0] ?? fullPath
  const out: LocaleRouteResult & { path: string; fullPath: string; href: string } = { path, fullPath, href: fullPath }
  if (result.name) out.name = result.name
  if (result.params && Object.keys(result.params).length) out.params = result.params
  if (result.query && Object.keys(result.query).length) out.query = result.query
  if (result.hash) out.hash = result.hash
  return out as unknown as RouteLocationResolved
}

/** A URL by its explicit scheme. Not `//host` or a bare `x.yy`: such strings can come from a request, and stay paths. */
const URL_SCHEME = /^(?:https?:|mailto:|tel:)/i
/** Never a page, and no request can send a visitor elsewhere with one. */
const APP_SCHEME = /^(?:mailto:|tel:)/i

/** URL of a switch result: the strategy hands out a URL string or a resolved route (fullPath set). */
function switchedPath(switched: RouteLike | string): string {
  return typeof switched === 'string' ? switched : (switched.fullPath ?? switched.path ?? '')
}

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

export class NuxtI18n extends BaseI18n {
  readonly storage: TranslationStorage
  private readonly cacheMaxSize: number
  private readonly contextSignal: ShallowRef<number>
  private cachedTranslations: Record<string, unknown> = {}
  /**
   * Hot-reload buffer for page transitions: the leaving page's chunk, kept until it unmounts.
   *
   * `$t` falls through here on a miss so the old page keeps rendering while the new chunk is
   * already installed. Cleared in `finishTransition`.
   */
  private outgoingTranslations: Record<string, unknown> | null = null
  /** A lookup was answered from `outgoingTranslations`: only then does dropping it change a render. */
  private outgoingServed = false
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

  setChunk(locale: string, routeName: string | undefined, data: Record<string, unknown>): void {
    const key = this.getCacheKey(locale, routeName)
    this.storage.translations.set(key, data as Translations)
    this.evictChunks(key)
  }

  /**
   * Install SSR chunks from the payload into the view layer.
   *
   * The loader only installs the chunk for the page being rendered, but SSR may
   * load buckets for other `(locale, route)` pairs — `$tForRoute()` resolves against
   * `getChunk()` directly. Without this they hydrate as missing until navigation.
   *
   * Existing entries win: anything already loaded is kept as-is.
   */
  seedChunks(chunks: Record<string, Record<string, unknown>>): void {
    let lastKey = ''
    for (const [cacheKey, data] of Object.entries(chunks)) {
      if (!this.storage.translations.has(cacheKey)) {
        this.storage.translations.set(cacheKey, data as Translations)
        lastKey = cacheKey
      }
    }
    if (lastKey) this.evictChunks(lastKey)
  }

  hasChunk(locale: string, routeName?: string): boolean {
    return this.storage.translations.has(this.getCacheKey(locale, routeName))
  }

  mergeChunk(locale: string, routeName: string | undefined, data: Record<string, unknown>): Record<string, unknown> {
    const cacheKey = this.getCacheKey(locale, routeName)
    const existing = (this.storage.translations.get(cacheKey) ?? {}) as Record<string, unknown>
    const merged = mergeTranslationChunk(existing, data)
    this.storage.translations.set(cacheKey, merged as Translations)
    this.evictChunks(cacheKey)
    return merged
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

    const current = this.getCacheKey(this.currentLocale, this.currentRouteName)
    for (const key of this.storage.translations.keys()) {
      if (this.storage.translations.size <= max) break
      if (key === keep || key === current) continue
      this.storage.translations.delete(key)
    }

    // Protected set can exceed max when keep !== current (prefetch / seed while another
    // page is active). Drop everything except `keep` until the bound holds.
    if (this.storage.translations.size <= max) return
    for (const key of this.storage.translations.keys()) {
      if (this.storage.translations.size <= max) break
      if (key === keep) continue
      this.storage.translations.delete(key)
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

  getCurrentLocale(): string {
    return this.currentLocale
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
    // Stash / swap the view layer before setChunk so eviction sees keep === current
    // (otherwise cacheMaxSize: 1 would protect both the old and new route keys).
    this.outgoingTranslations = this.currentLocale === locale ? this.cachedTranslations : null
    this.outgoingServed = false
    this.cachedTranslations = data ?? {}

    this.currentLocale = locale
    this.currentRouteName = routeName || ''
    // a failed first load renders with nothing, but stores nothing: the next navigation loads it
    if (data) this.setChunk(locale, routeName, data)
    triggerRef(this.contextSignal)
    this.notifyContextChange('load')
  }

  /**
   * Swap the active dictionary for a fresh copy of the same page. Not a page change: a live
   * transition keeps its outgoing layer, the leaving page is still on screen.
   */
  replaceDictionary(data: Record<string, unknown>): void {
    this.cachedTranslations = data
    this.setChunk(this.currentLocale, this.currentRouteName || undefined, data)
    triggerRef(this.contextSignal)
    this.notifyContextChange('load')
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

  mergeTranslations(newTranslations: Translations): void {
    this.mergeChunk(this.currentLocale, this.currentRouteName, newTranslations as Record<string, unknown>)
    // The patch, not the merged chunk: the active dictionary already holds this chunk, so
    // walking the whole thing again costs its size for the sake of a few new keys.
    this.cachedTranslations = deepMergeTranslationsRecursive(this.cachedTranslations, newTranslations as Record<string, unknown>)
    triggerRef(this.contextSignal)
    this.notifyContextChange('load')
  }

  async loadPageTranslations(locale: string, routeName: string, translations: Translations): Promise<void> {
    this.mergeChunk(locale, routeName, translations as Record<string, unknown>)
    if (locale === this.currentLocale && routeName === this.currentRouteName) {
      this.cachedTranslations = deepMergeTranslationsRecursive(this.cachedTranslations, translations as Record<string, unknown>)
      triggerRef(this.contextSignal)
      this.notifyContextChange('load')
    }
  }

  async mergeTranslationAsync(locale: string, routeName: string, newTranslations: Translations, loadIfMissing: LoadTranslationsChunk): Promise<void> {
    if (!this.hasChunk(locale, routeName)) {
      const loaded = await loadIfMissing(locale, routeName || undefined)
      this.setChunk(locale, routeName, loaded)
    }

    this.mergeChunk(locale, routeName, newTranslations as Record<string, unknown>)
    if (locale === this.currentLocale && routeName === this.currentRouteName) {
      this.cachedTranslations = deepMergeTranslationsRecursive(this.cachedTranslations, newTranslations as Record<string, unknown>)
      triggerRef(this.contextSignal)
      this.notifyContextChange('load')
    }
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

  protected override resolveLookup(key: TranslationKey, routeContext?: unknown): unknown | null {
    const translations =
      routeContext && this.resolveRouteContext
        ? (() => {
            const { locale, routeName } = this.resolveRouteContext!(routeContext)
            return this.getChunk(locale, routeName)
          })()
        : this.cachedTranslations

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
    this.setChunk(
      this.currentLocale,
      this.currentRouteName,
      setTranslationAtKey(this.getChunk(this.currentLocale, this.currentRouteName), String(key), value),
    )
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
    super.clearCache()
  }

  public override clearCache(): void {
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
  isDev?: boolean
}

export class NuxtTranslationLoader {
  private readonly pendingLoads = new Map<string, Promise<Record<string, unknown> | null>>()
  /**
   * Monotonic token so a slower in-flight `switchContext` cannot overwrite a newer one.
   * Vue Router aborts a superseded navigation but does not cancel the guard's await.
   */
  private switchGeneration = 0

  constructor(private readonly options: NuxtTranslationLoaderOptions) {}

  /**
   * Bump the switch generation so any in-flight `switchContext` becomes a no-op.
   * Call on every navigation that may supersede a pending load — including when the
   * target `(locale, routeName)` already matches the applied context (caller skips switch).
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
    if (cached) {
      i18n.setChunk(locale, routeName, cached.data)
      return cached.data
    }

    return null
  }

  /** The chunk, or `{}` when the load fails (a page without translations still renders). */
  async loadAsync(locale: string, routeName?: string): Promise<Record<string, unknown>> {
    return (await this.loadChunk(locale, routeName)) ?? {}
  }

  /** The loaded chunk, or null when the load failed (reported here): a reload must tell that from an empty chunk. */
  private loadChunk(locale: string, routeName?: string): Promise<Record<string, unknown> | null> {
    const { i18n, loadOptions, isDev } = this.options
    const cacheKey = i18n.getCacheKey(locale, routeName)
    const pending = this.pendingLoads.get(cacheKey)
    if (pending) return pending

    const promise = (async () => {
      try {
        const result = await translationStorage.load(locale, routeName, loadOptions)
        const existing = i18n.getChunk(locale, routeName)
        const mergedChunk = mergeTranslationChunk(existing, result.data, { preserveExisting: true })
        i18n.setChunk(locale, routeName, mergedChunk)
        return mergedChunk
      } catch (e) {
        if (isDev) console.error('[i18n] Load error:', e)
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
    const locale = i18n.getCurrentLocale()
    const routeName = i18n.getCurrentRouteName() || undefined
    const data = await this.loadChunk(locale, routeName)
    // a failed load keeps what is on screen; an empty dictionary would show raw keys
    if (data === null) return
    if (i18n.getCurrentLocale() !== locale || (i18n.getCurrentRouteName() || undefined) !== routeName) return
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

  /**
   * Load and apply translations for a locale/route. Returns `false` when the switch did not
   * apply — a newer navigation superseded it, or its chunk failed to load — and callers must
   * skip post-await side effects (e.g. `setLocale`). The next navigation loads it again.
   */
  async switchContext(locale: string, routeName?: string): Promise<boolean> {
    const { i18n } = this.options
    const generation = ++this.switchGeneration
    const data = this.loadFromCacheSync(locale, routeName) ?? (await this.loadChunk(locale, routeName))

    if (generation !== this.switchGeneration) return false
    // keeps what is on screen, as refresh() does: an empty dictionary would turn the strings that
    // still work (a layout's) into raw keys. Only a first render has nothing to keep.
    if (data === null && i18n.getCurrentLocale()) return false

    i18n.applySwitchContext(locale, routeName, data)
    return true
  }
}

export interface NuxtI18nPluginApiDeps {
  i18n: NuxtI18n
  loader: NuxtTranslationLoader
  i18nStrategy: PathStrategy
  i18nConfig: ModuleOptionsExtend
  router: Router
  getCurrentLocale: (route?: ResolvedRouteLike) => string
  getEffectiveLocale: (route: unknown, getLocaleFromRoute: GetLocaleFromRoute) => string
  getPluginRouteName: (route: ResolvedRouteLike, locale: string) => string
  getRouteName: (route?: RouteLocationNormalizedLoaded | RouteLocationResolvedGeneric, locale?: string) => string
  i18nRouteParams: { value: I18nRouteParams }
  setLocale: (locale: string) => void
  isValidLocale: (locale: string) => boolean
  navigateTo: (to: string, options?: { redirectCode?: number; external?: boolean }) => unknown
  setMissingHandler: (handler: MissingHandler | null) => void
  isHydrating: () => boolean
}

export function createNuxtI18nPluginApi(deps: NuxtI18nPluginApiDeps) {
  const {
    i18n,
    loader,
    i18nStrategy,
    i18nConfig,
    router,
    getCurrentLocale,
    getEffectiveLocale,
    getPluginRouteName,
    getRouteName,
    i18nRouteParams,
    setLocale,
    isValidLocale,
    navigateTo,
    setMissingHandler,
    isHydrating,
  } = deps

  const isDev = process.env.NODE_ENV !== 'production'
  const isNoPrefix = isNoPrefixStrategy(i18nConfig.strategy!)

  /** A route object loses a trailing slash in `router.resolve`, so under a slash rule `push` takes the URL. */
  const withSlashRule = (switched: RouteLike | string): RouteLike | string =>
    i18nConfig.trailingSlash ? applyTrailingSlash(switchedPath(switched), i18nConfig.trailingSlash) : switched

  /** The current route for a link. The server never sees the hash, so the hydrating render leaves it out too. */
  const linkRoute = (): ResolvedRouteLike => {
    const route = router.currentRoute.value as unknown as ResolvedRouteLike
    if (!route.hash || !isHydrating()) return route
    return { ...route, hash: '', fullPath: route.fullPath.slice(0, route.fullPath.indexOf('#')) }
  }

  const switchLocaleLogic = (toLocale: string, i18nParams: I18nRouteParams, to?: RouteLocationNamedRaw | RouteLocationResolvedGeneric | string) => {
    if (typeof to === 'string' && APP_SCHEME.test(to)) return navigateTo(to, { redirectCode: 200, external: true })

    const fromLocale = getCurrentLocale()
    const currentRoute = router.currentRoute.value

    // a path is read as the page it shows (any locale's form of it), then switched like a route,
    // so per-locale params (`i18nRouteParams`) apply to it too
    const from = typeof to === 'string' ? i18nStrategy.localeRoute(fromLocale, to) : (to ?? currentRoute)
    const switchedRoute = i18nStrategy.switchLocaleRoute(fromLocale, toLocale, from as unknown as ResolvedRouteLike, { i18nRouteParams: i18nParams })

    // only a locale's own domain leaves the app: a string handed to `$switchRoute` may come from a request
    const url = switchedPath(switchedRoute)
    const domain = i18nConfig.locales?.find((locale) => locale.code === toLocale)?.baseUrl?.replace(/\/+$/, '')
    if (domain && url.startsWith(`${domain}/`)) return navigateTo(url, { redirectCode: 200, external: true })

    if (isNoPrefix) {
      // URL stays the same under no_prefix — push would append a duplicate history entry (#238).
      // A copy: the strategy may hand back the current route object itself.
      return router.replace({ ...(switchedRoute as RouteLocationRaw & object), force: true } as RouteLocationRaw)
    }

    return router.push(withSlashRule(switchedRoute) as RouteLocationRaw)
  }

  const helper = {
    async mergeTranslation(locale: string, routeName: string, newTranslations: Translations, _force = false): Promise<void> {
      await i18n.mergeTranslationAsync(locale, routeName, newTranslations, (l, r) => loader.loadAsync(l, r))
    },
  }

  const switchContext = (locale: string, routeName?: string) => loader.switchContext(locale, routeName)

  const provide = {
    i18nStrategy,
    getLocale: (route?: RouteLocationNormalizedLoaded | RouteLocationResolvedGeneric) =>
      getEffectiveLocale(route, (r) => getCurrentLocale(r as unknown as ResolvedRouteLike)),
    getLocaleName: () => i18nStrategy.getCurrentLocaleName(router.currentRoute.value as unknown as ResolvedRouteLike, getCurrentLocale() ?? null),
    defaultLocale: () => i18nConfig.defaultLocale,
    getLocales: () => i18nConfig.locales || [],
    getRouteName,
    t: i18n.t.bind(i18n),
    ts: (key: TranslationKey, params?: Params, defaultValue?: string, route?: RouteLocationNormalizedLoaded): string => {
      const value = route ? i18n.t(key, params, defaultValue, route) : i18n.ts(key, params, defaultValue)
      return value?.toString() ?? defaultValue ?? key
    },
    _t: (route: RouteLocationNormalizedLoaded) => i18n.tForRoute(route),
    _ts: (route: RouteLocationNormalizedLoaded) => i18n.tsForRoute(route),
    tc: i18n.tc.bind(i18n),
    pluralFunc: i18n.pluralFunc,
    pluralLocale: i18n.pluralLocale.bind(i18n),
    tn: i18n.tn.bind(i18n),
    td: i18n.td.bind(i18n),
    tdr: i18n.tdr.bind(i18n),
    has: i18n.has.bind(i18n),
    resolveTranslations: i18n.resolveTranslations.bind(i18n),
    setTranslation: i18n.setTranslation.bind(i18n),
    mergeTranslations: i18n.mergeTranslations.bind(i18n),
    switchLocaleRoute: (toLocale: string) => {
      const route = linkRoute()
      const switched = i18nStrategy.switchLocaleRoute(getCurrentLocale(route), toLocale, route, { i18nRouteParams: unref(i18nRouteParams.value) })
      if (typeof switched === 'string' || !i18nConfig.trailingSlash) return switched as RouteLocationRaw
      const fullPath = applyTrailingSlash(switchedPath(switched), i18nConfig.trailingSlash)
      // `name` is readable but not enumerable: `router.resolve` copies the rest and goes by `path`, the form that keeps the slash
      const { name, ...rest } = switched
      return Object.defineProperty({ ...rest, fullPath, path: fullPath.split(/[?#]/)[0] }, 'name', { value: name }) as RouteLocationRaw
    },
    clearCache: () => {
      void loader.reload()
    },
    switchLocalePath: (toLocale: string) => {
      const route = linkRoute()
      const switched = i18nStrategy.switchLocaleRoute(getCurrentLocale(route), toLocale, route, { i18nRouteParams: unref(i18nRouteParams.value) })
      return applyTrailingSlash(switchedPath(switched), i18nConfig.trailingSlash)
    },
    switchLocale: async (toLocale: string) => {
      if (!isValidLocale(toLocale)) {
        if (isDev) console.warn(`[i18n] Invalid locale '${toLocale}'`)
        return false
      }

      // no URL to move: the dictionary is the switch. After a failed switch the URL already says
      // `toLocale`, the navigation would be a no-op, and only the dictionary is left to retry.
      const urlless = isNoPrefix || i18nConfig.hashMode
      const retry = getCurrentLocale() === toLocale && i18n.getCurrentLocale() !== toLocale
      const route = router.currentRoute.value as unknown as ResolvedRouteLike
      const loaded = urlless || retry ? await loader.switchContext(toLocale, getPluginRouteName(route, toLocale)) : null
      // its chunk failed, or a newer switchLocale / navigation won: no setLocale, no navigation
      if (loaded === false) return false

      setLocale(toLocale)
      await switchLocaleLogic(toLocale, unref(i18nRouteParams.value))
      return loaded ?? i18n.getCurrentLocale() === toLocale
    },
    switchRoute: async (route: RouteLocationNamedRaw | RouteLocationResolvedGeneric | string, toLocale?: string) => {
      return switchLocaleLogic(toLocale ?? getCurrentLocale(), unref(i18nRouteParams.value), route)
    },
    localeRoute(to: RouteLocationNamedRaw | RouteLocationResolvedGeneric | string, locale?: string): RouteLocationResolved {
      if (typeof to === 'string' && URL_SCHEME.test(to)) return toRouteLocationResolved({ path: to, fullPath: to })
      const targetLocale = locale !== undefined && locale !== '' ? String(locale) : getCurrentLocale()
      const result = i18nStrategy.localeRoute(targetLocale, to as string | RouteLike, router.currentRoute.value as unknown as ResolvedRouteLike)
      return toRouteLocationResolved(result)
    },
    localePath(to: RouteLocationNamedRaw | RouteLocationResolvedGeneric | string, locale?: string): string {
      if (typeof to === 'string' && URL_SCHEME.test(to)) return to
      const targetLocale = locale !== undefined && locale !== '' ? String(locale) : getCurrentLocale()
      const result = i18nStrategy.localeRoute(targetLocale, to as string | RouteLike, router.currentRoute.value as unknown as ResolvedRouteLike)
      return applyTrailingSlash((result.fullPath ?? result.path ?? '') as string, i18nConfig.trailingSlash)
    },
    setI18nRouteParams: (value: I18nRouteParams) => {
      i18nRouteParams.value = value
      return i18nRouteParams.value
    },
    loadPageTranslations: i18n.loadPageTranslations.bind(i18n),
    setMissingHandler,
  }

  return { helper, switchContext, provide }
}

export type NuxtI18nPluginProvide = ReturnType<typeof createNuxtI18nPluginApi>['provide']
