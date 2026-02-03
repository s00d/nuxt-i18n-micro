import type {
  RouteLocationNormalizedLoaded,
  RouteLocationRaw,
  RouteLocationResolved,
  RouteLocationResolvedGeneric,
  RouteLocationNamedRaw,
} from 'vue-router'
import { useTranslationHelper, interpolate, isNoPrefixStrategy, RouteService, FormatService, type TranslationCache } from '@i18n-micro/core'
import type { ModuleOptionsExtend, Locale, I18nRouteParams, Params, Translations, CleanTranslation, MissingHandler } from '@i18n-micro/types'
import type { PathStrategy, RouteLike, ResolvedRouteLike } from '@i18n-micro/path-strategy'
import { useRouter, useCookie, navigateTo, defineNuxtPlugin, useRuntimeConfig, createError } from '#imports'
import { unref } from 'vue'
import { useState } from '#app'
import { plural } from '#build/i18n.plural.mjs'
import { getI18nConfig, createI18nStrategy } from '#build/i18n.strategy.mjs'

const isDev = process.env.NODE_ENV !== 'production'

export default defineNuxtPlugin(async (nuxtApp) => {
  const router = useRouter()
  const i18nStrategy = createI18nStrategy(router)
  const i18nConfig: ModuleOptionsExtend = getI18nConfig() as ModuleOptionsExtend
  const apiBaseUrl = i18nConfig.apiBaseUrl ?? '_locales'
  const apiBaseHost = import.meta.client ? i18nConfig.apiBaseClientHost : i18nConfig.apiBaseServerHost
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
  // Only use cookie if localeCookie is not disabled (null) and not in hashMode
  if (!i18nConfig.hashMode && i18nConfig.localeCookie !== null) {
    cookieLocaleName = i18nConfig.localeCookie || 'user-locale'
  }

  // Valid locale codes for validation
  const validLocales = i18nConfig.locales?.map(l => l.code) || []

  // Helper to validate locale value
  const isValidLocale = (locale: string | null | undefined): locale is string => {
    return !!locale && validLocales.includes(locale)
  }

  // State for programmatic locale setting (used by custom plugins that set locale before i18n init)
  // Works with all strategies: no_prefix, prefix, prefix_except_default, prefix_and_default, hashMode
  const localeState = useState<string | null>('i18n-locale', () => null)

  if (i18nConfig.hashMode) {
    const hashCookie = await nuxtApp.runWithContext(() => useCookie('hash-locale').value)
    const userCookieName = i18nConfig.localeCookie !== null ? (i18nConfig.localeCookie || 'user-locale') : null
    const userCookie = userCookieName
      ? await nuxtApp.runWithContext(() => useCookie(userCookieName).value)
      : undefined
    const preferredLocale = localeState.value || hashCookie || userCookie
    // Validate locale - fallback to null if invalid
    hashLocaleDefault = isValidLocale(preferredLocale) ? preferredLocale : null
  }
  else if (isNoPrefixStrategy(i18nConfig.strategy!)) {
    if (cookieLocaleName) {
      const cookieValue = await nuxtApp.runWithContext(() => useCookie(cookieLocaleName).value)
      const preferredLocale = localeState.value || cookieValue
      // Validate locale - fallback to defaultLocale if invalid
      noPrefixDefault = isValidLocale(preferredLocale) ? preferredLocale : i18nConfig.defaultLocale
    }
  }
  else {
    // For prefix strategies (prefix, prefix_except_default, prefix_and_default)
    // localeState can be used to override locale detection from URL
    if (cookieLocaleName) {
      const cookieValue = await nuxtApp.runWithContext(() => useCookie(cookieLocaleName).value)
      const preferredLocale = localeState.value || cookieValue
      // Validate locale - fallback to null if invalid (URL will be used)
      cookieLocaleDefault = isValidLocale(preferredLocale) ? preferredLocale : null
    }
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
  const translationService = new FormatService()

  const i18nRouteParams = useState<I18nRouteParams>('i18n-route-params', () => ({}))

  const previousPageInfo = useState<{ locale: string, routeName: string } | null>('i18n-previous-page', () => null)
  const enablePreviousPageFallback = i18nConfig.experimental?.i18nPreviousPageFallback ?? false

  // Missing locale handler configuration
  const missingWarn = i18nConfig.missingWarn ?? true
  const customMissingHandler = useState<MissingHandler | null>('i18n-missing-handler', () => null)

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
    // localeState has priority over all other locale detection methods
    // This allows custom plugins to set locale programmatically before i18n init
    const locale = localeState.value || routeService.getCurrentLocale(to)

    const routeName = routeService.getPluginRouteName(to, locale)

    // Guard: skip loading for routes without a valid name (e.g., 404/unmatched)
    // Also skip if there are no matched records to avoid unnecessary fetches on error pages
    // This prevents infinite waiting on pages like /de/unlocalized where route is intentionally absent
    // and should return 404 without triggering translation loading.
    // Also skip for custom-fallback-route (the redirect component for prefix strategy)
    if (!routeName || routeName === 'custom-fallback-route') {
      return
    }

    if (i18nHelper.hasPageTranslation(locale, routeName)) return

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

  // 6. Build `provideData` (code unchanged)
  const provideData = {
    i18n: undefined,
    __micro: true,
    i18nStrategy,
    getLocale: (route?: RouteLocationNormalizedLoaded | RouteLocationResolvedGeneric) => {
      if (i18nConfig.hashMode && localeState.value != null) return localeState.value
      return routeService.getCurrentLocale(route)
    },
    getLocaleName: () => routeService.getCurrentName(routeService.getCurrentRoute()),
    defaultLocale: () => i18nConfig.defaultLocale,
    getLocales: () => i18nConfig.locales || [],
    getRouteName: (route?: RouteLocationNormalizedLoaded | RouteLocationResolvedGeneric, locale?: string) => {
      const selectedLocale = locale ?? routeService.getCurrentLocale()
      const selectedRoute = route ?? routeService.getCurrentRoute()
      return routeService.getRouteName(selectedRoute as RouteLocationResolvedGeneric, selectedLocale)
    },
    t: (key: string, params?: Params, defaultValue?: string | null, route?: RouteLocationNormalizedLoaded): CleanTranslation => {
      if (!key) return ''
      route = route ?? routeService.getCurrentRoute()
      const locale = routeService.getCurrentLocale()
      const routeName = routeService.getPluginRouteName(route as RouteLocationResolvedGeneric, locale)
      let value = i18nHelper.getTranslation(locale, routeName, key)

      // If translation not found and there are saved previous translations, use them (only if enabled)
      if (!value && previousPageInfo.value && enablePreviousPageFallback) {
        const prev = previousPageInfo.value
        const prevValue = i18nHelper.getTranslation(prev.locale, prev.routeName, key)
        if (prevValue) value = prevValue
      }

      // General fallback больше не нужен: сервер уже подмешал глобальные переводы

      if (!value) {
        // Call custom handler if set, otherwise show default warn if enabled
        if (customMissingHandler.value) {
          customMissingHandler.value(locale, key, routeName)
        }
        else if (missingWarn && isDev && import.meta.client) {
          console.warn(`Not found '${key}' key in '${locale}' locale messages for route '${routeName}'.`)
        }
        value = defaultValue === undefined ? key : defaultValue
      }

      return typeof value === 'string' && params ? interpolate(value, params) : value as CleanTranslation
    },
    ts: (key: string, params?: Params, defaultValue?: string, route?: RouteLocationNormalizedLoaded): string => {
      const value = provideData.t(key, params, defaultValue, route)
      return value?.toString() ?? defaultValue ?? key
    },
    _t: (route: RouteLocationNormalizedLoaded) => {
      return (key: string, params?: Params, defaultValue?: string | null): CleanTranslation => {
        return provideData.t(key, params, defaultValue, route)
      }
    },
    _ts: (route: RouteLocationNormalizedLoaded) => {
      return (key: string, params?: Params, defaultValue?: string): string => {
        return provideData.ts(key, params, defaultValue, route)
      }
    },
    tc: (key: string, params: number | Params, defaultValue?: string): string => {
      const currentLocale = routeService.getCurrentLocale()
      const { count, ..._params } = typeof params === 'number' ? { count: params } : params

      if (count === undefined) return defaultValue ?? key
      return plural(key, Number.parseInt(count.toString()), _params, currentLocale, provideData.t) as string ?? defaultValue ?? key
    },
    tn: (value: number, options?: Intl.NumberFormatOptions) => {
      const currentLocale = routeService.getCurrentLocale()
      return translationService.formatNumber(value, currentLocale, options)
    },
    td: (value: Date | number | string, options?: Intl.DateTimeFormatOptions) => {
      const currentLocale = routeService.getCurrentLocale()
      return translationService.formatDate(value, currentLocale, options)
    },
    tdr: (value: Date | number | string, options?: Intl.RelativeTimeFormatOptions): string => {
      const currentLocale = routeService.getCurrentLocale()
      return translationService.formatRelativeTime(value, currentLocale, options)
    },
    has: (key: string, route?: RouteLocationNormalizedLoaded): boolean => {
      route = route ?? routeService.getCurrentRoute()
      const locale = routeService.getCurrentLocale()
      const routeName = routeService.getPluginRouteName(route as RouteLocationResolvedGeneric, locale)
      return !!i18nHelper.getTranslation(locale, routeName, key)
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
    clearCache: () => {
      i18nHelper.clearCache()
    },
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
    switchLocale: (toLocale: string) => {
      if (i18nConfig.hashMode) localeState.value = toLocale
      return routeService.switchLocaleLogic(toLocale, unref(i18nRouteParams.value))
    },
    switchRoute: (route: RouteLocationNamedRaw | RouteLocationResolvedGeneric | string, toLocale?: string) => {
      return routeService.switchLocaleLogic(toLocale ?? routeService.getCurrentLocale(), unref(i18nRouteParams.value), route as RouteLocationResolvedGeneric)
    },
    localeRoute(to: RouteLocationNamedRaw | RouteLocationResolvedGeneric | string, locale?: string): RouteLocationResolved {
      try {
        const targetLocale = (locale !== undefined && locale !== '')
          ? String(locale)
          : routeService.getCurrentLocale()
        const currentRoute = routeService.getCurrentRoute()
        const result = i18nStrategy.localeRoute(targetLocale, to as string | RouteLike, currentRoute as unknown as ResolvedRouteLike)
        const fullPath = result.fullPath ?? result.path ?? ''
        const path = result.path ?? fullPath.split('?')[0]?.split('#')[0] ?? fullPath
        const out: { path: string, fullPath: string, href: string, query?: Record<string, string>, hash?: string } = {
          path,
          fullPath,
          href: fullPath,
        }
        if (result.query && Object.keys(result.query).length) out.query = result.query as Record<string, string>
        if (result.hash) out.hash = result.hash
        return out as RouteLocationResolved
      }
      catch {
        return routeService.resolveLocalizedRoute(to, locale)
      }
    },
    localePath(to: RouteLocationNamedRaw | RouteLocationResolvedGeneric | string, locale?: string): string {
      try {
        const targetLocale = (locale !== undefined && locale !== '')
          ? String(locale)
          : routeService.getCurrentLocale()
        const currentRoute = routeService.getCurrentRoute()
        const result = i18nStrategy.localeRoute(targetLocale, to as string | RouteLike, currentRoute as unknown as ResolvedRouteLike)
        return (result.fullPath ?? result.path ?? '') as string
      }
      catch {
        const localeRoute = routeService.resolveLocalizedRoute(to, locale)
        return typeof localeRoute === 'string' ? localeRoute : ('fullPath' in localeRoute ? localeRoute.fullPath as string : '')
      }
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
    helper: i18nHelper, // Оставляем helper, он может быть полезен для продвинутых пользователей
  }

  const $provideData = Object.fromEntries(
    Object.entries(provideData).map(([key, value]) => [`$${key}`, value]),
  )

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
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
