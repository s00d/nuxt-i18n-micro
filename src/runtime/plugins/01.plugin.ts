import type {
  RouteLocationNormalizedLoaded,
  RouteLocationRaw,
  RouteLocationResolved,
  RouteLocationResolvedGeneric,
  RouteLocationNamedRaw,
} from 'vue-router'
import { useTranslationHelper, isNoPrefixStrategy, RouteService, type TranslationCache, createCompiledCache } from '@i18n-micro/core'
import type { ModuleOptionsExtend, Locale, I18nRouteParams, Params, Translations, CleanTranslation, MissingHandler } from '@i18n-micro/types'
import { useRouter, useCookie, navigateTo, defineNuxtPlugin, useRuntimeConfig, createError } from '#imports'
import { unref, computed } from 'vue'
import { useState } from '#app'
import { plural } from '#build/i18n.plural.mjs'
import { NuxtI18n } from '../i18n'

const isDev = process.env.NODE_ENV !== 'production'

// Global compiler cache (outside plugin to avoid SSR serialization issues)
const compiledMessageCache = createCompiledCache()

export default defineNuxtPlugin(async (nuxtApp) => {
  const config = useRuntimeConfig()
  const i18nConfig: ModuleOptionsExtend = config.public.i18nConfig as unknown as ModuleOptionsExtend
  const apiBaseUrl = i18nConfig.apiBaseUrl ?? '_locales'
  const apiBaseHost = import.meta.client ? i18nConfig.apiBaseClientHost : i18nConfig.apiBaseServerHost
  const router = useRouter()
  const runtimeConfig = useRuntimeConfig()

  // 1. Create request-scoped caches via useState
  const generalLocaleCache = useState<Record<string, Translations>>('i18n-general-cache', () => ({}))
  const routeLocaleCache = useState<Record<string, Translations>>('i18n-route-cache', () => ({}))
  const dynamicTranslationsCaches = useState<Record<string, Translations>[]>('i18n-dynamic-caches', () => [])
  const serverTranslationCache = useState<Record<string, Map<string, Translations | unknown>>>('i18n-server-cache', () => ({}))

  const translationCaches: TranslationCache = {
    generalLocaleCache,
    routeLocaleCache,
    dynamicTranslationsCaches,
    serverTranslationCache,
  }

  // 2. Create helper instance with request-scoped caches
  const i18nHelper = useTranslationHelper(translationCaches)

  let hashLocaleDefault: null | string | undefined = null
  let noPrefixDefault: null | string | undefined = null
  let cookieLocaleDefault: null | string | undefined = null

  let cookieLocaleName: string | null = null
  if (!i18nConfig.hashMode) {
    cookieLocaleName = i18nConfig.localeCookie || 'user-locale'
  }

  if (i18nConfig.hashMode) {
    hashLocaleDefault = await nuxtApp.runWithContext(() => useCookie('hash-locale').value)
  }
  if (isNoPrefixStrategy(i18nConfig.strategy!)) {
    if (cookieLocaleName) {
      noPrefixDefault = await nuxtApp.runWithContext(() => useCookie(cookieLocaleName).value)
    }
  }

  // Read cookie for regular strategy (not hashMode and not noPrefix)
  // Use localeCookie from config or 'user-locale' as default
  if (!i18nConfig.hashMode && !isNoPrefixStrategy(i18nConfig.strategy!)) {
    cookieLocaleDefault = await nuxtApp.runWithContext(() => useCookie(cookieLocaleName!).value)
  }

  const routeService = new RouteService(
    i18nConfig,
    router,
    hashLocaleDefault,
    noPrefixDefault,
    (to, options) => navigateTo(to, options),
    (name, value) => {
      nuxtApp.runWithContext(() => {
        return useCookie(name).value = value
      })
    },
    cookieLocaleDefault,
    cookieLocaleName,
  )

  const i18nRouteParams = useState<I18nRouteParams>('i18n-route-params', () => ({}))

  const previousPageInfo = useState<{ locale: string, routeName: string } | null>('i18n-previous-page', () => null)
  const enablePreviousPageFallback = i18nConfig.experimental?.i18nPreviousPageFallback ?? false

  // Missing locale handler configuration
  const missingWarn = i18nConfig.missingWarn ?? true
  const customMissingHandler = useState<MissingHandler | null>('i18n-missing-handler', () => null)

  // 3. Create NuxtI18n instance
  const i18n = new NuxtI18n({
    // BaseI18n options
    plural: plural, // From #build/i18n.plural.mjs
    missingWarn: missingWarn,
    enablePreviousPageFallback: enablePreviousPageFallback,
    cache: translationCaches, // Pass caches from useState
    compiledCache: compiledMessageCache, // Pass global cache!

    // NuxtI18n options
    routeService: routeService,
    locales: computed(() => i18nConfig.locales || []),
    defaultLocale: computed(() => i18nConfig.defaultLocale || 'en'),
    i18nRouteParams: i18nRouteParams,
    customMissingHandler: customMissingHandler,
    previousPageInfo: previousPageInfo,
  })

  nuxtApp.hook('page:finish', () => {
    if (import.meta.client) {
      // Don't reset i18nRouteParams immediately - let it persist until new values are set
      // This ensures that locale switcher links remain correct during navigation
      // The params will be set by $setI18nRouteParams on the new page
      // Only reset if we're actually navigating away (not just client-side hydration)
      previousPageInfo.value = null
    }
  })

  // unified loader: page + global merged on server
  async function loadPageAndGlobalTranslations(to: RouteLocationResolvedGeneric) {
    let locale = routeService.getCurrentLocale(to)
    if (i18nConfig.hashMode) {
      locale = await nuxtApp.runWithContext(() => useCookie('hash-locale', { default: () => locale }).value)
    }
    if (isNoPrefixStrategy(i18nConfig.strategy!) && cookieLocaleName) {
      locale = await nuxtApp.runWithContext(() => useCookie(cookieLocaleName, { default: () => locale }).value)
    }

    const routeName = routeService.getPluginRouteName(to, locale)

    // Guard: skip loading for routes without a valid name (e.g., 404/unmatched)
    // Also skip if there are no matched records to avoid unnecessary fetches on error pages
    // This prevents infinite waiting on pages like /de/unlocalized where route is intentionally absent
    // and should return 404 without triggering translation loading.
    if (!routeName) {
      return
    }

    if (i18nHelper.hasPageTranslation(locale, routeName)) {
      if (isDev) {
        console.log(`[DEBUG] Cache HIT for '${locale}:${routeName}'. Skipping fetch.`)
      }
      return
    }

    let url = `/${apiBaseUrl}/${routeName}/${locale}/data.json`.replace(/\/{2,}/g, '/')
    if (apiBaseHost) {
      url = `${apiBaseHost}${url}`
    }
    try {
      const data: Translations = await $fetch(url, {
        baseURL: runtimeConfig.app.baseURL,
        params: { v: i18nConfig.dateBuild },
      })
      await i18nHelper.loadPageTranslations(locale, routeName, data ?? {})
    }
    catch (e) {
      if (isDev) {
        console.error(`[i18n] Failed to load translations for ${routeName}/${locale}`, e)
      }
      throw createError({ statusCode: 404, statusMessage: 'Page Not Found' })
    }
  }

  // remove old global loader (merged on server)

  // --- 3. Blocking navigation hook ---
  router.beforeEach(async (to, from, next) => {
    if (to.name !== from.name) {
      i18nRouteParams.value = {}
    }
    if (to.path === from.path && !isNoPrefixStrategy(i18nConfig.strategy!)) {
      if (next) next()
      return
    }

    if (import.meta.client && enablePreviousPageFallback) {
      const fromLocale = routeService.getCurrentLocale(from as RouteLocationResolvedGeneric)
      const fromRouteName = routeService.getPluginRouteName(from as RouteLocationResolvedGeneric, fromLocale)
      previousPageInfo.value = { locale: fromLocale, routeName: fromRouteName }
    }

    try {
      await loadPageAndGlobalTranslations(to as RouteLocationResolvedGeneric)
    }
    catch (e) {
      console.error('[i18n] Error loading translations:', e)
    }

    if (next) next()
  })

  // 4. Load translations for the very first (initial) page
  await loadPageAndGlobalTranslations(router.currentRoute.value as RouteLocationResolvedGeneric)

  // 4. Build provideData
  const provideData = {
    i18n: undefined, // will be filled later
    __micro: true,

    // --- Translation methods (delegate to i18n) ---
    // t can accept routeObject thanks to overload in NuxtI18n
    t: i18n.t.bind(i18n),

    // tc uses this.pluralFunc inside BaseI18n, which we passed in constructor
    tc: i18n.tc.bind(i18n),

    // Helper methods
    ts: i18n.ts.bind(i18n),
    tn: i18n.tn.bind(i18n),
    td: i18n.td.bind(i18n),
    tdr: i18n.tdr.bind(i18n),
    has: i18n.has.bind(i18n),

    // Special methods with closure (keep in plugin or implement as helper)
    _t: (route: RouteLocationNormalizedLoaded) => {
      return (key: string, params?: Params, defaultValue?: string | null) => {
        // Call i18n.t, explicitly passing route
        return i18n.t(key, params, defaultValue, route)
      }
    },
    _ts: (route: RouteLocationNormalizedLoaded) => {
      return (key: string, params?: Params, defaultValue?: string) => {
        const val = i18n.t(key, params, defaultValue, route)
        return String(val ?? defaultValue ?? key)
      }
    },

    // --- State/routing methods (use RouteService or i18nHelper directly) ---
    getLocale: (route?: RouteLocationNormalizedLoaded | RouteLocationResolvedGeneric) => routeService.getCurrentLocale(route),
    getLocaleName: () => routeService.getCurrentName(routeService.getCurrentRoute()),
    defaultLocale: () => i18nConfig.defaultLocale,
    getLocales: () => i18nConfig.locales || [],
    getRouteName: (route?: RouteLocationNormalizedLoaded | RouteLocationResolvedGeneric, locale?: string) => {
      const selectedLocale = locale ?? routeService.getCurrentLocale()
      const selectedRoute = route ?? routeService.getCurrentRoute()
      return routeService.getRouteName(selectedRoute as RouteLocationResolvedGeneric, selectedLocale)
    },
    mergeTranslations: (newTranslations: Translations) => {
      const route = routeService.getCurrentRoute()
      const locale = routeService.getCurrentLocale(route)
      const routeName = routeService.getPluginRouteName(route as RouteLocationResolvedGeneric, locale)
      i18nHelper.mergeTranslation(locale, routeName, newTranslations)
    },
    mergeGlobalTranslations: (newTranslations: Translations) => {
      const locale = routeService.getCurrentLocale()
      i18nHelper.mergeGlobalTranslation(locale, newTranslations, true)
    },
    switchLocaleRoute: (toLocale: string) => {
      const route = routeService.getCurrentRoute()
      const fromLocale = routeService.getCurrentLocale(route)
      return routeService.switchLocaleRoute(fromLocale, toLocale, route as RouteLocationResolvedGeneric, unref(i18nRouteParams.value))
    },
    clearCache: i18n.clearCache.bind(i18n),
    switchLocalePath: (toLocale: string) => {
      const route = routeService.getCurrentRoute()
      const fromLocale = routeService.getCurrentLocale(route)
      const localeRoute = routeService.switchLocaleRoute(fromLocale, toLocale, route as RouteLocationResolvedGeneric, unref(i18nRouteParams.value))
      if (typeof localeRoute === 'string') {
        return localeRoute
      }
      if ('fullPath' in localeRoute && localeRoute.fullPath) {
        return localeRoute.fullPath as string
      }
      if ('name' in localeRoute && localeRoute.name) {
        if (router.hasRoute(localeRoute.name)) {
          return router.resolve(localeRoute).fullPath
        }
      }
      return ''
    },
    // Important: switchLocale now calls through i18n to clear compiledCache
    switchLocale: i18n.switchLocale.bind(i18n),
    switchRoute: (route: RouteLocationNamedRaw | RouteLocationResolvedGeneric | string, toLocale?: string) => {
      return routeService.switchLocaleLogic(toLocale ?? routeService.getCurrentLocale(), unref(i18nRouteParams.value), route as RouteLocationResolvedGeneric)
    },
    localeRoute: (to: RouteLocationNamedRaw | RouteLocationResolvedGeneric | string, locale?: string): RouteLocationResolved => {
      return routeService.resolveLocalizedRoute(to, locale)
    },
    localePath: (to: RouteLocationNamedRaw | RouteLocationResolvedGeneric | string, locale?: string): string => {
      const localeRoute = routeService.resolveLocalizedRoute(to, locale)
      if (typeof localeRoute === 'string') {
        return localeRoute
      }
      if ('fullPath' in localeRoute) {
        return localeRoute.fullPath as string
      }
      return ''
    },
    setI18nRouteParams: (value: I18nRouteParams) => {
      i18nRouteParams.value = value
      return i18nRouteParams.value
    },
    loadPageTranslations: async (locale: string, routeName: string, translations: Translations) => {
      await i18nHelper.loadPageTranslations(locale, routeName, translations)
    },
    setMissingHandler: (handler: MissingHandler | null) => {
      customMissingHandler.value = handler
    },
    helper: i18n.helper, // Access to helper through i18n
  }

  const $provideData = Object.fromEntries(
    Object.entries(provideData).map(([key, value]) => [`$${key}`, value]),
  )

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  provideData.i18n = { ...provideData, ...$provideData }

  return {
    provide: provideData,
  }
})

export interface PluginsInjections {
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
  $has: (key: string, routeOrName?: string | RouteLocationNormalizedLoaded | RouteLocationResolvedGeneric) => boolean
  $mergeTranslations: (newTranslations: Translations) => void
  $mergeGlobalTranslations: (newTranslations: Translations) => void
  $switchLocaleRoute: (locale: string) => RouteLocationRaw
  $switchLocalePath: (locale: string) => string
  $switchLocale: (locale: string) => void
  $switchRoute: (route: RouteLocationNamedRaw | RouteLocationResolvedGeneric | string, toLocale?: string) => void
  $localeRoute: (to: RouteLocationNamedRaw | RouteLocationResolvedGeneric | string, locale?: string) => RouteLocationResolved
  $localePath: (to: RouteLocationNamedRaw | RouteLocationResolvedGeneric | string, locale?: string) => string
  $setI18nRouteParams: (value: I18nRouteParams) => I18nRouteParams
  $loadPageTranslations: (locale: string, routeName: string, translations: Translations) => Promise<void>
  $setMissingHandler: (handler: MissingHandler | null) => void
  helper: ReturnType<typeof useTranslationHelper>
}
