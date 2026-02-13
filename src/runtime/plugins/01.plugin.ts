import { FormatService, isNoPrefixStrategy } from '@i18n-micro/core'
import type { PathStrategy, ResolvedRouteLike, RouteLike } from '@i18n-micro/path-strategy'
import type { CleanTranslation, I18nRouteParams, Locale, MissingHandler, ModuleOptionsExtend, Params, Translations } from '@i18n-micro/types'
import { shallowRef, triggerRef, unref } from 'vue'
import type {
  RouteLocationNamedRaw,
  RouteLocationNormalizedLoaded,
  RouteLocationRaw,
  RouteLocationResolved,
  RouteLocationResolvedGeneric,
} from 'vue-router'
import { useState } from '#app'
import { plural } from '#build/i18n.plural.mjs'
import { createI18nStrategy, getI18nConfig } from '#build/i18n.strategy.mjs'
import { createError, defineNuxtPlugin, navigateTo, useHead, useRouter, useRuntimeConfig } from '#imports'
import { useI18nLocale } from '../composables/useI18nLocale'
import { translationStorage } from '../utils/storage'

const isDev = process.env.NODE_ENV !== 'production'
const RE_TOKEN = /\{(\w+)\}/g

// === HELPER: getByPath ===
function getByPath(obj: Record<string, unknown>, path: string): unknown {
  if (obj[path] !== undefined) return obj[path]
  const parts = path.split('.')
  let v: unknown = obj
  for (const p of parts) {
    if (v == null || typeof v !== 'object') return undefined
    v = (v as Record<string, unknown>)[p]
  }
  return v
}

export default defineNuxtPlugin(async (nuxtApp) => {
  const router = useRouter()
  const i18nStrategy = createI18nStrategy(router)
  const i18nConfig: ModuleOptionsExtend = getI18nConfig() as ModuleOptionsExtend
  const runtimeConfig = useRuntimeConfig()

  // === 0. CONFIGURE STORAGE CACHE ===
  translationStorage.configure({
    maxSize: i18nConfig.cacheMaxSize ?? 0,
    ttl: i18nConfig.cacheTtl ?? 0,
  })

  // === 1. LOCAL CACHE ===
  // Key: `${locale}:${routeName}`
  // Value: merged translations (global + page-specific)
  const loadedChunks = new Map<string, Record<string, unknown>>()

  // Current values
  let currentLocale = ''
  let currentRouteName = ''

  // Cached reference to current translations (updated in switchContext).
  // During transitions this contains merged keys (old + new page) to prevent flickering.
  let cachedTranslations: Record<string, unknown> = {}

  // Buffer: clean translations for the new page only.
  // Applied in page:transition:finish (after the leave animation is fully complete)
  // to free memory from old-page keys.
  let pendingCleanState: Record<string, unknown> | null = null

  // Reactivity signal (triggers Vue re-renders on locale/route change)
  const contextSignal = shallowRef(0)

  // === LOCALE SERVICE ===
  const { locale: localeState, setLocale, getLocale, getEffectiveLocale, resolveInitialLocale, isValidLocale } = useI18nLocale()

  // Getter for locale state (used by getCurrentLocale for hashMode/noPrefix)
  const getDefaultLocaleGetter = () => getLocale() ?? null

  const translationService = new FormatService()

  // Helper: get current locale from route using i18nStrategy
  const getCurrentLocale = (route?: ResolvedRouteLike): string => {
    const r = route ?? (router.currentRoute.value as unknown as ResolvedRouteLike)
    return i18nStrategy.getCurrentLocale(r, getDefaultLocaleGetter)
  }

  // Helper: get plugin route name for translation loading
  const getPluginRouteName = (route: ResolvedRouteLike, locale: string): string => {
    return i18nStrategy.getPluginRouteName(route, locale)
  }

  // Helper: switch locale logic (navigation)
  const switchLocaleLogic = (toLocale: string, i18nParams: I18nRouteParams, to?: RouteLocationNamedRaw | RouteLocationResolvedGeneric | string) => {
    const fromLocale = getCurrentLocale()
    const currentRoute = router.currentRoute.value

    // Resolve target route if string path provided
    let resolvedTarget: RouteLocationResolvedGeneric
    if (typeof to === 'string') {
      // Strategy decides how to format path for resolve
      const formattedPath = i18nStrategy.formatPathForResolve(to, fromLocale, toLocale)
      resolvedTarget = router.resolve(formattedPath)
    } else {
      resolvedTarget = (to ?? currentRoute) as RouteLocationResolvedGeneric
    }

    // Get switched route from strategy
    const switchedRoute = i18nStrategy.switchLocaleRoute(fromLocale, toLocale, resolvedTarget as unknown as ResolvedRouteLike, {
      i18nRouteParams: i18nParams,
    })

    // Handle external navigation (baseUrl with protocol)
    if (typeof switchedRoute === 'string' && (switchedRoute.startsWith('http://') || switchedRoute.startsWith('https://'))) {
      return navigateTo(switchedRoute, { redirectCode: 200, external: true })
    }

    // Handle forced navigation (no_prefix strategy)
    if (isNoPrefixStrategy(i18nConfig.strategy!)) {
      ;(switchedRoute as RouteLocationRaw & { force?: boolean }).force = true
    }

    return router.push(switchedRoute as RouteLocationRaw)
  }

  // Garbage collection: fires strictly AFTER the transition animation is complete.
  // At this point the old page is unmounted, so it's safe to drop its keys.
  nuxtApp.hook('page:transition:finish', () => {
    if (pendingCleanState) {
      cachedTranslations = pendingCleanState
      pendingCleanState = null
    }
  })

  // useState only for what is actually shared between components
  const i18nRouteParams = useState<I18nRouteParams>('i18n-route-params', () => ({}))
  const customMissingHandler = useState<MissingHandler | null>('i18n-missing-handler', () => null)

  const missingWarn = i18nConfig.missingWarn ?? true

  const loadOptions = {
    apiBaseUrl: i18nConfig.apiBaseUrl ?? '_locales',
    baseURL: runtimeConfig.app.baseURL,
    dateBuild: i18nConfig.dateBuild,
  }

  // === 2. TRANSLATION LOADER ===
  // API returns already merged data (global + page-specific)
  // One request per page, no duplication

  const getCacheKey = (locale: string, routeName?: string): string => {
    return `${locale}:${routeName || 'index'}`
  }

  // Synchronous cache check
  const loadFromCacheSync = (locale: string, routeName?: string): Record<string, unknown> | null => {
    const cacheKey = getCacheKey(locale, routeName)

    // Already in local cache
    if (loadedChunks.has(cacheKey)) {
      return loadedChunks.get(cacheKey)!
    }

    // Check storage (SSR injection)
    const cached = translationStorage.getFromCache(locale, routeName)
    if (cached) {
      loadedChunks.set(cacheKey, cached.data)
      return cached.data
    }

    return null
  }

  // Async loading with request deduplication
  const pendingLoads = new Map<string, Promise<Record<string, unknown>>>()

  const loadAsync = (locale: string, routeName?: string): Promise<Record<string, unknown>> => {
    const cacheKey = getCacheKey(locale, routeName)

    // Return existing in-flight promise to avoid duplicate requests
    const pending = pendingLoads.get(cacheKey)
    if (pending) return pending

    const promise = (async () => {
      try {
        const result = await translationStorage.load(locale, routeName, loadOptions)
        loadedChunks.set(cacheKey, result.data)

        // SERVER: Injection for client hydration
        if (import.meta.server && result.json) {
          const ctx = nuxtApp.ssrContext!.event.context
          if (!ctx._i18n) ctx._i18n = {}
          ctx._i18n[cacheKey] = result.json
        }

        return result.data
      } catch (e) {
        if (isDev) console.error('[i18n] Load error:', e)
        return {}
      } finally {
        pendingLoads.delete(cacheKey)
      }
    })()

    pendingLoads.set(cacheKey, promise)
    return promise
  }

  // === 3. CONTEXT SWITCHER ===
  // Single request - API already returns global + page-specific
  const switchContext = async (locale: string, routeName?: string) => {
    // Fast path: synchronous from cache
    let data = loadFromCacheSync(locale, routeName)

    if (data === null) {
      // Slow path: load via fetch
      data = await loadAsync(locale, routeName)
    }

    if (currentLocale === locale) {
      // Same language, page navigation:
      // 1. Merge old + new so the leaving page keeps its keys during transition animation.
      cachedTranslations = { ...cachedTranslations, ...data }
      // 2. Schedule cleanup: page:transition:finish will replace merged dict with clean data.
      pendingCleanState = data
    } else {
      // Language switch: hard replace (no cross-language mixing).
      cachedTranslations = data
      pendingCleanState = null
    }

    // Update current values
    currentLocale = locale
    currentRouteName = routeName || ''

    // Signal Vue to re-render templates
    triggerRef(contextSignal)
  }

  // === 4. INITIALIZATION ===
  const serverLocale = import.meta.server ? nuxtApp.ssrContext?.event?.context?.i18n?.locale : undefined
  const initialLocale = resolveInitialLocale({
    route: router.currentRoute.value,
    serverLocale,
    getLocaleFromRoute: (r) => getCurrentLocale(r as unknown as ResolvedRouteLike),
  })
  const initialRouteName = getPluginRouteName(router.currentRoute.value as unknown as ResolvedRouteLike, initialLocale)

  try {
    await switchContext(initialLocale, initialRouteName)
  } catch (e) {
    if (isDev) console.error('[i18n] Initial load error:', e)
    throw createError({ statusCode: 404, statusMessage: 'Page Not Found' })
  }

  // Script injection (Server Only)
  if (import.meta.server) {
    const ctx = nuxtApp.ssrContext?.event.context
    if (ctx?._i18n && Object.keys(ctx._i18n).length > 0) {
      let script = 'window.__I18N__={};'
      for (const [k, v] of Object.entries(ctx._i18n)) {
        script += `window.__I18N__["${k}"]=${v};`
      }
      useHead({
        script: [{ innerHTML: script, type: 'text/javascript', tagPosition: 'bodyClose' }],
      })
    }
  }

  // === 5. HOOKS (Client Navigation) ===
  router.beforeEach(async (to, from, next) => {
    if (to.name !== from.name) {
      i18nRouteParams.value = {}
    }
    if (to.path === from.path && !isNoPrefixStrategy(i18nConfig.strategy!)) {
      if (next) next()
      return
    }

    try {
      const targetLocale = getEffectiveLocale(to, (r) => getCurrentLocale(r as unknown as ResolvedRouteLike))
      const targetRouteName = getPluginRouteName(to as unknown as ResolvedRouteLike, targetLocale)

      // If locale or page changed — switch context
      if (targetLocale !== currentLocale || targetRouteName !== currentRouteName) {
        await switchContext(targetLocale, targetRouteName)
      }

      if (targetLocale && isValidLocale(targetLocale) && localeState.value !== targetLocale) {
        setLocale(targetLocale)
      }
    } catch (e) {
      if (isDev) console.error('[i18n] Navigation error:', e)
    }

    if (next) next()
  })

  // === 6. T-FUNCTION ===
  const tFast = (
    key: string,
    params?: Params,
    defaultValue?: string | null,
    route?: RouteLocationNormalizedLoaded | RouteLocationResolvedGeneric,
  ): CleanTranslation => {
    if (!key) return '' as CleanTranslation

    // Read contextSignal for Vue reactivity tracking.
    // This allows computed/watch to track changes on locale/route switch.
    contextSignal.value

    const translations = route
      ? loadedChunks.get(
          getCacheKey(
            getCurrentLocale(route as unknown as ResolvedRouteLike),
            getPluginRouteName(route as unknown as ResolvedRouteLike, getCurrentLocale(route as unknown as ResolvedRouteLike)),
          ),
        ) || {}
      : cachedTranslations

    // 1. Direct key access
    let val = translations[key]

    // 2. Nested keys
    if (val === undefined && key.includes('.')) {
      val = getByPath(translations, key)
    }

    // 3. Not found
    if (val === undefined) {
      if (customMissingHandler.value) {
        customMissingHandler.value(currentLocale, key, currentRouteName)
      } else if (missingWarn && isDev && import.meta.client) {
        console.warn(`[i18n] Missing key '${key}' in '${currentLocale}' for route '${currentRouteName}'`)
      }
      return (defaultValue === undefined ? key : defaultValue) as CleanTranslation
    }

    // 5. Not a string — return as is
    if (typeof val !== 'string') return val as CleanTranslation

    // 6. No params — fast return
    if (!params) return val as CleanTranslation

    // 7. Interpolation
    return val.replace(RE_TOKEN, (_: string, k: string) => {
      return params[k] !== undefined ? String(params[k]) : `{${k}}`
    }) as CleanTranslation
  }

  // === HELPER FUNCTIONS ===
  const getRouteName = (route?: RouteLocationNormalizedLoaded | RouteLocationResolvedGeneric, locale?: string) => {
    const selectedRoute = route ?? router.currentRoute.value
    const selectedLocale = locale ?? getCurrentLocale(selectedRoute as unknown as ResolvedRouteLike)
    return i18nStrategy.getRouteBaseName(selectedRoute as unknown as ResolvedRouteLike, selectedLocale) ?? ''
  }

  const hasTranslation = (key: string): boolean => {
    contextSignal.value

    if (cachedTranslations[key] !== undefined) return true
    if (key.includes('.') && getByPath(cachedTranslations, key) !== undefined) return true
    return false
  }

  const mergeTranslations = (newTranslations: Translations) => {
    const cacheKey = getCacheKey(currentLocale, currentRouteName)
    const current = loadedChunks.get(cacheKey) || {}
    const merged = { ...current, ...newTranslations }
    loadedChunks.set(cacheKey, merged)
    cachedTranslations = { ...cachedTranslations, ...merged }
    if (pendingCleanState) pendingCleanState = merged
    triggerRef(contextSignal)
  }

  // Helper for i18n:register hook
  const helper = {
    async mergeTranslation(locale: string, routeName: string, newTranslations: Translations, _force = false): Promise<void> {
      const cacheKey = getCacheKey(locale, routeName)
      if (!loadedChunks.has(cacheKey)) {
        await loadAsync(locale, routeName || undefined)
      }
      const existing = loadedChunks.get(cacheKey) || {}
      const mergedChunk = { ...existing, ...newTranslations }
      loadedChunks.set(cacheKey, mergedChunk)
      if (locale === currentLocale && routeName === currentRouteName) {
        cachedTranslations = { ...cachedTranslations, ...mergedChunk }
        if (pendingCleanState) pendingCleanState = mergedChunk
        triggerRef(contextSignal)
      }
    },
  }

  // === PROVIDE DATA ===
  const provideData = {
    i18n: undefined,
    __micro: true,
    helper,
    i18nStrategy,
    getLocale: (route?: RouteLocationNormalizedLoaded | RouteLocationResolvedGeneric) =>
      getEffectiveLocale(route, (r) => getCurrentLocale(r as unknown as ResolvedRouteLike)),
    getLocaleName: () => i18nStrategy.getCurrentLocaleName(router.currentRoute.value as unknown as ResolvedRouteLike),
    defaultLocale: () => i18nConfig.defaultLocale,
    getLocales: () => i18nConfig.locales || [],
    getRouteName,
    t: tFast,
    ts: (key: string, params?: Params, defaultValue?: string, route?: RouteLocationNormalizedLoaded): string => {
      const value = tFast(key, params, defaultValue, route)
      return value?.toString() ?? defaultValue ?? key
    },
    _t: (route: RouteLocationNormalizedLoaded) => {
      return (key: string, params?: Params, defaultValue?: string | null): CleanTranslation => {
        return tFast(key, params, defaultValue, route)
      }
    },
    _ts: (route: RouteLocationNormalizedLoaded) => {
      return (key: string, params?: Params, defaultValue?: string): string => {
        const value = tFast(key, params, defaultValue, route)
        return value?.toString() ?? defaultValue ?? key
      }
    },
    tc: (key: string, params: number | Params, defaultValue?: string): string => {
      contextSignal.value
      const { count, ..._params } = typeof params === 'number' ? { count: params } : params
      if (count === undefined) return defaultValue ?? key
      return (plural(key, Number.parseInt(count.toString(), 10), _params, currentLocale, tFast) as string) ?? defaultValue ?? key
    },
    tn: (value: number, options?: Intl.NumberFormatOptions) => {
      contextSignal.value
      return translationService.formatNumber(value, currentLocale, options)
    },
    td: (value: Date | number | string, options?: Intl.DateTimeFormatOptions) => {
      contextSignal.value
      return translationService.formatDate(value, currentLocale, options)
    },
    tdr: (value: Date | number | string, options?: Intl.RelativeTimeFormatOptions): string => {
      contextSignal.value
      return translationService.formatRelativeTime(value, currentLocale, options)
    },
    has: hasTranslation,
    mergeTranslations,
    switchLocaleRoute: (toLocale: string) => {
      const route = router.currentRoute.value as unknown as ResolvedRouteLike
      const fromLocale = getCurrentLocale(route)
      return i18nStrategy.switchLocaleRoute(fromLocale, toLocale, route, { i18nRouteParams: unref(i18nRouteParams.value) }) as RouteLocationRaw
    },
    clearCache: () => {
      translationStorage.clear()
      loadedChunks.clear()
      cachedTranslations = {}
      triggerRef(contextSignal)
    },
    switchLocalePath: (toLocale: string) => {
      const route = router.currentRoute.value as unknown as ResolvedRouteLike
      const fromLocale = getCurrentLocale(route)
      const localeRoute = i18nStrategy.switchLocaleRoute(fromLocale, toLocale, route, { i18nRouteParams: unref(i18nRouteParams.value) })
      if (!localeRoute || typeof localeRoute !== 'object') return String(localeRoute ?? '')
      if ('fullPath' in localeRoute && localeRoute.fullPath) return localeRoute.fullPath as string
      if ('path' in localeRoute && localeRoute.path) return localeRoute.path as string
      if ('name' in localeRoute && localeRoute.name && router.hasRoute(String(localeRoute.name))) {
        return router.resolve(localeRoute as RouteLocationRaw).fullPath
      }
      return ''
    },
    switchLocale: async (toLocale: string) => {
      if (isValidLocale(toLocale)) {
        setLocale(toLocale)
        if (isNoPrefixStrategy(i18nConfig.strategy!) || i18nConfig.hashMode) {
          const route = router.currentRoute.value as unknown as ResolvedRouteLike
          const routeName = getPluginRouteName(route, toLocale)
          await switchContext(toLocale, routeName)
        }
      }
      return switchLocaleLogic(toLocale, unref(i18nRouteParams.value))
    },
    switchRoute: (route: RouteLocationNamedRaw | RouteLocationResolvedGeneric | string, toLocale?: string) => {
      return switchLocaleLogic(
        toLocale ?? getCurrentLocale(),
        unref(i18nRouteParams.value),
        route as RouteLocationNamedRaw | RouteLocationResolvedGeneric | string,
      )
    },
    localeRoute(to: RouteLocationNamedRaw | RouteLocationResolvedGeneric | string, locale?: string): RouteLocationResolved {
      const targetLocale = locale !== undefined && locale !== '' ? String(locale) : getCurrentLocale()
      const currentRoute = router.currentRoute.value as unknown as ResolvedRouteLike
      const result = i18nStrategy.localeRoute(targetLocale, to as string | RouteLike, currentRoute)
      const fullPath = result.fullPath ?? result.path ?? ''
      const path = result.path ?? fullPath.split('?')[0]?.split('#')[0] ?? fullPath
      const out: { path: string; fullPath: string; href: string; query?: Record<string, string>; hash?: string } = { path, fullPath, href: fullPath }
      if (result.query && Object.keys(result.query).length) out.query = result.query as Record<string, string>
      if (result.hash) out.hash = result.hash
      return out as RouteLocationResolved
    },
    localePath(to: RouteLocationNamedRaw | RouteLocationResolvedGeneric | string, locale?: string): string {
      const targetLocale = locale !== undefined && locale !== '' ? String(locale) : getCurrentLocale()
      const currentRoute = router.currentRoute.value as unknown as ResolvedRouteLike
      const result = i18nStrategy.localeRoute(targetLocale, to as string | RouteLike, currentRoute)
      return (result.fullPath ?? result.path ?? '') as string
    },
    setI18nRouteParams: (value: I18nRouteParams) => {
      i18nRouteParams.value = value
      return i18nRouteParams.value
    },
    loadPageTranslations: async (locale: string, routeName: string, translations: Translations) => {
      const cacheKey = getCacheKey(locale, routeName)
      const current = loadedChunks.get(cacheKey) || {}
      const mergedChunk = { ...current, ...translations }
      loadedChunks.set(cacheKey, mergedChunk)
      if (locale === currentLocale && routeName === currentRouteName) {
        cachedTranslations = { ...cachedTranslations, ...mergedChunk }
        if (pendingCleanState) pendingCleanState = mergedChunk
        triggerRef(contextSignal)
      }
    },
    setMissingHandler: (handler: MissingHandler | null) => {
      customMissingHandler.value = handler
    },
  }

  const $provideData = Object.fromEntries(Object.entries(provideData).map(([key, value]) => [`$${key}`, value]))

  // @ts-expect-error
  provideData.i18n = { ...provideData, ...$provideData }

  return {
    provide: {
      ...provideData,
      getI18nConfig: () => getI18nConfig(),
    },
  }
})

export interface PluginsInjections {
  $i18nStrategy: PathStrategy
  $getI18nConfig: () => ModuleOptionsExtend
  $getLocale: (route?: RouteLocationNormalizedLoaded | RouteLocationResolvedGeneric) => string
  $getLocaleName: () => string | null
  $getLocales: () => Locale[]
  $defaultLocale: () => string | undefined
  $getRouteName: (route?: RouteLocationNamedRaw | RouteLocationResolvedGeneric, locale?: string) => string
  $t: (key: string, params?: Params, defaultValue?: string | null) => CleanTranslation
  $_t: (route: RouteLocationNormalizedLoaded) => (key: string, params?: Params, defaultValue?: string | null) => CleanTranslation
  $ts: (key: string, params?: Params, defaultValue?: string) => string
  $_ts: (route: RouteLocationNormalizedLoaded) => (key: string, params?: Params, defaultValue?: string | null) => string
  $tc: (key: string, params: number | Params, defaultValue?: string) => string
  $tn: (value: number, options?: Intl.NumberFormatOptions) => string
  $td: (value: Date | number | string, options?: Intl.DateTimeFormatOptions) => string
  $tdr: (value: Date | number | string, options?: Intl.DateTimeFormatOptions) => string
  $has: (key: string) => boolean
  $mergeTranslations: (newTranslations: Translations) => void
  $switchLocaleRoute: (locale: string) => RouteLocationRaw
  $switchLocalePath: (locale: string) => string
  $switchLocale: (locale: string) => void
  $switchRoute: (route: RouteLocationNamedRaw | RouteLocationResolvedGeneric | string, toLocale?: string) => void
  $localeRoute: (to: RouteLocationNamedRaw | RouteLocationResolvedGeneric | string, locale?: string) => RouteLocationResolved
  $localePath: (to: RouteLocationNamedRaw | RouteLocationResolvedGeneric | string, locale?: string) => string
  $setI18nRouteParams: (value: I18nRouteParams) => I18nRouteParams
  $loadPageTranslations: (locale: string, routeName: string, translations: Translations) => Promise<void>
  $setMissingHandler: (handler: MissingHandler | null) => void
}
