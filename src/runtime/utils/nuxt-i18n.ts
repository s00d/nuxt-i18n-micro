import {
  BaseI18n,
  isNoPrefixStrategy,
  mergeTranslationChunk,
  resolveTranslation,
  translationCacheKey,
  type BaseI18nOptions,
  type TranslationStorage,
} from '@i18n-micro/core'
import type { PathStrategy, ResolvedRouteLike, RouteLike } from '@i18n-micro/path-strategy'
import type { CleanTranslation, I18nRouteParams, MissingHandler, ModuleOptionsExtend, Params, TranslationKey, Translations } from '@i18n-micro/types'
import { deepMergeTranslations } from '@i18n-micro/utils/deep-merge'
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

interface LocaleRouteResult {
  name?: string | null
  path?: string
  fullPath?: string
  query?: Record<string, unknown>
  hash?: string
}

function toRouteLocationResolved(result: LocaleRouteResult): RouteLocationResolved {
  const fullPath = result.fullPath ?? result.path ?? ''
  const path = result.path ?? fullPath.split('?')[0]?.split('#')[0] ?? fullPath
  const out: { path: string; fullPath: string; href: string; query?: Record<string, string>; hash?: string } = {
    path,
    fullPath,
    href: fullPath,
  }
  if (result.query && Object.keys(result.query).length) out.query = result.query as Record<string, string>
  if (result.hash) out.hash = result.hash
  return out as RouteLocationResolved
}

function extractSwitchLocalePath(
  localeRoute: RouteLocationRaw | string | null | undefined,
  resolveRouter: Pick<Router, 'hasRoute' | 'resolve'>,
): string {
  if (!localeRoute || typeof localeRoute !== 'object') return String(localeRoute ?? '')
  if ('fullPath' in localeRoute && localeRoute.fullPath) return localeRoute.fullPath as string
  if ('path' in localeRoute && localeRoute.path) return localeRoute.path as string
  if ('name' in localeRoute && localeRoute.name && resolveRouter.hasRoute(String(localeRoute.name))) {
    return resolveRouter.resolve(localeRoute as RouteLocationRaw).fullPath
  }
  return ''
}

export interface RouteTranslationContext {
  locale: string
  routeName: string
}

export type GetRouteTranslationContext = (route?: unknown) => RouteTranslationContext

export type LoadTranslationsChunk = (locale: string, routeName?: string) => Promise<Record<string, unknown>>

export interface NuxtI18nOptions extends BaseI18nOptions {}

export class NuxtI18n extends BaseI18n {
  readonly storage: TranslationStorage
  private readonly contextSignal: ShallowRef<number>
  private cachedTranslations: Record<string, unknown> = {}
  private pendingCleanState: Record<string, unknown> | null = null
  private currentLocale = ''
  private currentRouteName = ''
  private resolveRouteContext?: GetRouteTranslationContext

  constructor(options: NuxtI18nOptions = {}) {
    const storage: TranslationStorage = {
      translations: new Map<string, Translations>(),
    }

    super({ ...options, storage })
    this.storage = storage
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
    this.storage.translations.set(this.getCacheKey(locale, routeName), data as Translations)
  }

  hasChunk(locale: string, routeName?: string): boolean {
    return this.storage.translations.has(this.getCacheKey(locale, routeName))
  }

  mergeChunk(locale: string, routeName: string | undefined, data: Record<string, unknown>): Record<string, unknown> {
    const cacheKey = this.getCacheKey(locale, routeName)
    const existing = (this.storage.translations.get(cacheKey) ?? {}) as Record<string, unknown>
    const merged = mergeTranslationChunk(existing, data)
    this.storage.translations.set(cacheKey, merged as Translations)
    return merged
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

  applySwitchContext(locale: string, routeName: string | undefined, data: Record<string, unknown>): void {
    this.setChunk(locale, routeName, data)
    const sameLocale = this.currentLocale === locale

    if (sameLocale) {
      this.cachedTranslations = deepMergeTranslations(this.cachedTranslations, data)
      this.pendingCleanState = data
    } else {
      this.cachedTranslations = deepMergeTranslations(this.cachedTranslations, data)
      this.pendingCleanState = null
    }

    this.currentLocale = locale
    this.currentRouteName = routeName || ''
    triggerRef(this.contextSignal)
  }

  finishTransition(): void {
    if (this.pendingCleanState) {
      this.cachedTranslations = this.pendingCleanState
      this.pendingCleanState = null
    }
  }

  mergeTranslations(newTranslations: Translations): void {
    const merged = this.mergeChunk(this.currentLocale, this.currentRouteName, newTranslations as Record<string, unknown>)
    this.cachedTranslations = deepMergeTranslations(this.cachedTranslations, merged)
    if (this.pendingCleanState) this.pendingCleanState = merged
    triggerRef(this.contextSignal)
  }

  async loadPageTranslations(locale: string, routeName: string, translations: Translations): Promise<void> {
    const mergedChunk = this.mergeChunk(locale, routeName, translations as Record<string, unknown>)
    if (locale === this.currentLocale && routeName === this.currentRouteName) {
      this.cachedTranslations = deepMergeTranslations(this.cachedTranslations, mergedChunk)
      if (this.pendingCleanState) this.pendingCleanState = mergedChunk
      triggerRef(this.contextSignal)
    }
  }

  async mergeTranslationAsync(locale: string, routeName: string, newTranslations: Translations, loadIfMissing: LoadTranslationsChunk): Promise<void> {
    if (!this.hasChunk(locale, routeName)) {
      const loaded = await loadIfMissing(locale, routeName || undefined)
      this.setChunk(locale, routeName, loaded)
    }

    const mergedChunk = this.mergeChunk(locale, routeName, newTranslations as Record<string, unknown>)
    if (locale === this.currentLocale && routeName === this.currentRouteName) {
      this.cachedTranslations = deepMergeTranslations(this.cachedTranslations, mergedChunk)
      if (this.pendingCleanState) this.pendingCleanState = mergedChunk
      triggerRef(this.contextSignal)
    }
  }

  tForRoute(route: unknown): (key: string, params?: Params, defaultValue?: string | null) => CleanTranslation {
    return (key, params, defaultValue) => this.t(key, params, defaultValue, route)
  }

  tsForRoute(route: unknown): (key: string, params?: Params, defaultValue?: string) => string {
    return (key, params, defaultValue) => this.ts(key, params, defaultValue, route)
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

    return resolveTranslation(translations, String(key))
  }

  protected override resolveHas(key: TranslationKey): boolean {
    return resolveTranslation(this.cachedTranslations, String(key)) !== null
  }

  protected override getMissingContext(_routeContext?: unknown): { locale: string; routeName: string } {
    return { locale: this.currentLocale, routeName: this.currentRouteName }
  }

  protected override warnMissing(key: TranslationKey): void {
    const customHandler = this.getCustomMissingHandler?.()
    if (customHandler) {
      customHandler(this.currentLocale, String(key), this.currentRouteName)
      return
    }
    if (this.missingWarn && process.env.NODE_ENV !== 'production' && import.meta.client) {
      console.warn(`[i18n] Missing key '${key}' in '${this.currentLocale}' for route '${this.currentRouteName}'`)
    }
  }

  public override clearCache(): void {
    super.clearCache()
    this.cachedTranslations = {}
    this.pendingCleanState = null
    triggerRef(this.contextSignal)
  }
}

export interface NuxtTranslationLoaderOptions {
  i18n: NuxtI18n
  loadOptions: LoadOptions
  getSsrChunks: () => Record<string, Record<string, unknown>>
  setSsrChunk: (cacheKey: string, data: Record<string, unknown>) => void
  isDev?: boolean
}

export class NuxtTranslationLoader {
  private readonly pendingLoads = new Map<string, Promise<Record<string, unknown>>>()

  constructor(private readonly options: NuxtTranslationLoaderOptions) {}

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

  loadAsync(locale: string, routeName?: string): Promise<Record<string, unknown>> {
    const { i18n, loadOptions, setSsrChunk, isDev } = this.options
    const cacheKey = i18n.getCacheKey(locale, routeName)
    const pending = this.pendingLoads.get(cacheKey)
    if (pending) return pending

    const promise = (async () => {
      try {
        const result = await translationStorage.load(locale, routeName, loadOptions)
        const existing = i18n.getChunk(locale, routeName)
        const mergedChunk = mergeTranslationChunk(existing, result.data, { preserveExisting: true })
        i18n.setChunk(locale, routeName, mergedChunk)

        if (import.meta.server) {
          setSsrChunk(cacheKey, mergedChunk)
        }

        return mergedChunk
      } catch (e) {
        if (isDev) console.error('[i18n] Load error:', e)
        return {}
      } finally {
        this.pendingLoads.delete(cacheKey)
      }
    })()

    this.pendingLoads.set(cacheKey, promise)
    return promise
  }

  async switchContext(locale: string, routeName?: string): Promise<void> {
    let data = this.loadFromCacheSync(locale, routeName)

    if (data === null) {
      data = await this.loadAsync(locale, routeName)
    }

    this.options.i18n.applySwitchContext(locale, routeName, data)
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
  } = deps

  const isDev = process.env.NODE_ENV !== 'production'
  const isNoPrefix = isNoPrefixStrategy(i18nConfig.strategy!)

  const switchLocaleLogic = (toLocale: string, i18nParams: I18nRouteParams, to?: RouteLocationNamedRaw | RouteLocationResolvedGeneric | string) => {
    const fromLocale = getCurrentLocale()
    const currentRoute = router.currentRoute.value

    let resolvedTarget: RouteLocationResolvedGeneric
    if (typeof to === 'string') {
      resolvedTarget = router.resolve(i18nStrategy.formatPathForResolve(to, fromLocale, toLocale))
    } else {
      resolvedTarget = (to ?? currentRoute) as RouteLocationResolvedGeneric
    }

    const switchedRoute = i18nStrategy.switchLocaleRoute(fromLocale, toLocale, resolvedTarget as unknown as ResolvedRouteLike, {
      i18nRouteParams: i18nParams,
    })

    if (typeof switchedRoute === 'string' && (switchedRoute.startsWith('http://') || switchedRoute.startsWith('https://'))) {
      return navigateTo(switchedRoute, { redirectCode: 200, external: true })
    }

    if (isNoPrefix) {
      ;(switchedRoute as RouteLocationRaw & { force?: boolean }).force = true
    }

    return router.push(switchedRoute as RouteLocationRaw)
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
    ts: (key: string, params?: Params, defaultValue?: string, route?: RouteLocationNormalizedLoaded): string => {
      const value = route ? i18n.t(key, params, defaultValue, route) : i18n.ts(key, params, defaultValue)
      return value?.toString() ?? defaultValue ?? key
    },
    _t: (route: RouteLocationNormalizedLoaded) => i18n.tForRoute(route),
    _ts: (route: RouteLocationNormalizedLoaded) => i18n.tsForRoute(route),
    tc: i18n.tc.bind(i18n),
    tn: i18n.tn.bind(i18n),
    td: i18n.td.bind(i18n),
    tdr: i18n.tdr.bind(i18n),
    has: i18n.has.bind(i18n),
    mergeTranslations: i18n.mergeTranslations.bind(i18n),
    switchLocaleRoute: (toLocale: string) => {
      const route = router.currentRoute.value as unknown as ResolvedRouteLike
      const fromLocale = getCurrentLocale(route)
      return i18nStrategy.switchLocaleRoute(fromLocale, toLocale, route, { i18nRouteParams: unref(i18nRouteParams.value) }) as RouteLocationRaw
    },
    clearCache: () => {
      translationStorage.clear()
      i18n.clearCache()
    },
    switchLocalePath: (toLocale: string) => {
      const route = router.currentRoute.value as unknown as ResolvedRouteLike
      const fromLocale = getCurrentLocale(route)
      const switched = i18nStrategy.switchLocaleRoute(fromLocale, toLocale, route, { i18nRouteParams: unref(i18nRouteParams.value) })
      return extractSwitchLocalePath(switched as RouteLocationRaw, router)
    },
    switchLocale: async (toLocale: string) => {
      if (!isValidLocale(toLocale)) {
        if (isDev) console.warn(`[i18n] Invalid locale '${toLocale}'`)
        return
      }

      setLocale(toLocale)
      if (isNoPrefixStrategy(i18nConfig.strategy!) || i18nConfig.hashMode) {
        const route = router.currentRoute.value as unknown as ResolvedRouteLike
        const routeName = getPluginRouteName(route, toLocale)
        await loader.switchContext(toLocale, routeName)
      }
      return switchLocaleLogic(toLocale, unref(i18nRouteParams.value))
    },
    switchRoute: (route: RouteLocationNamedRaw | RouteLocationResolvedGeneric | string, toLocale?: string) => {
      return switchLocaleLogic(toLocale ?? getCurrentLocale(), unref(i18nRouteParams.value), route)
    },
    localeRoute(to: RouteLocationNamedRaw | RouteLocationResolvedGeneric | string, locale?: string): RouteLocationResolved {
      const targetLocale = locale !== undefined && locale !== '' ? String(locale) : getCurrentLocale()
      const result = i18nStrategy.localeRoute(targetLocale, to as string | RouteLike, router.currentRoute.value as unknown as ResolvedRouteLike)
      return toRouteLocationResolved(result)
    },
    localePath(to: RouteLocationNamedRaw | RouteLocationResolvedGeneric | string, locale?: string): string {
      const targetLocale = locale !== undefined && locale !== '' ? String(locale) : getCurrentLocale()
      const result = i18nStrategy.localeRoute(targetLocale, to as string | RouteLike, router.currentRoute.value as unknown as ResolvedRouteLike)
      return (result.fullPath ?? result.path ?? '') as string
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
