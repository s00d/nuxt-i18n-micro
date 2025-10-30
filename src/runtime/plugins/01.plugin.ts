import type {
  RouteLocationNormalizedLoaded,
  RouteLocationRaw,
  RouteLocationResolved,
  RouteLocationResolvedGeneric,
  RouteLocationNamedRaw,
} from 'vue-router'
import { useTranslationHelper, interpolate, isNoPrefixStrategy, RouteService, FormatService, type TranslationCache } from 'nuxt-i18n-micro-core'
import type { ModuleOptionsExtend, Locale, I18nRouteParams, Params, Translations, CleanTranslation } from 'nuxt-i18n-micro-types'
import { useRouter, useCookie, unref, navigateTo, defineNuxtPlugin, useRuntimeConfig } from '#imports'
import { useState } from '#app'
import { plural } from '#build/i18n.plural.mjs'

const isDev = process.env.NODE_ENV !== 'production'

export default defineNuxtPlugin(async (nuxtApp) => {
  const config = useRuntimeConfig()
  const i18nConfig: ModuleOptionsExtend = config.public.i18nConfig as unknown as ModuleOptionsExtend
  const apiBaseUrl = i18nConfig.apiBaseUrl ?? '_locales'
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

  if (i18nConfig.hashMode) {
    hashLocaleDefault = await nuxtApp.runWithContext(() => useCookie('hash-locale').value)
  }
  if (isNoPrefixStrategy(i18nConfig.strategy!)) {
    noPrefixDefault = await nuxtApp.runWithContext(() => useCookie('no-prefix-locale').value)
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
  )
  const translationService = new FormatService()

  const i18nRouteParams = useState<I18nRouteParams>('i18n-route-params', () => ({}))

  const previousPageInfo = useState<{ locale: string, routeName: string } | null>('i18n-previous-page', () => null)
  const enablePreviousPageFallback = i18nConfig.experimental?.i18nPreviousPageFallback ?? false

  nuxtApp.hook('page:finish', () => {
    if (import.meta.client) {
      i18nRouteParams.value = null
      previousPageInfo.value = null
    }
  })

  const loadTranslationsIfNeeded = async (locale: string, routeName: string, path: string) => {
    try {
      if (!i18nHelper.hasPageTranslation(locale, routeName)) {
        let fRouteName = routeName
        if (i18nConfig.routesLocaleLinks?.[fRouteName]) {
          fRouteName = i18nConfig.routesLocaleLinks[fRouteName]
        }

        if (!fRouteName) {
          console.warn(`[nuxt-i18n-micro] Page name is missing in path: ${path}. Ensure definePageMeta({ name: '...' }) is set.`)
          return
        }

        const url = `/${apiBaseUrl}/${fRouteName}/${locale}/data.json`.replace(/\/{2,}/g, '/')
        const data: Translations = await $fetch(url, {
          baseURL: runtimeConfig.app.baseURL,
          params: { v: i18nConfig.dateBuild },
        })
        await i18nHelper.loadPageTranslations(locale, routeName, data ?? {})
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    catch (_error) { /* empty */ }
  }

  async function loadGlobalTranslations(to: RouteLocationResolvedGeneric) {
    let locale = routeService.getCurrentLocale(to)
    if (i18nConfig.hashMode) {
      locale = await nuxtApp.runWithContext(() => useCookie('hash-locale', { default: () => locale }).value)
    }
    if (isNoPrefixStrategy(i18nConfig.strategy!)) {
      locale = await nuxtApp.runWithContext(() => useCookie('no-prefix-locale', { default: () => locale }).value)
    }

    if (!i18nHelper.hasGeneralTranslation(locale)) {
      const url = `/${apiBaseUrl}/general/${locale}/data.json`.replace(/\/{2,}/g, '/')
      const data: Translations = await $fetch(url, {
        baseURL: runtimeConfig.app.baseURL,
        params: { v: i18nConfig.dateBuild },
      })
      await i18nHelper.loadTranslations(locale, data ?? {})
    }

    if (!i18nConfig.disablePageLocales) {
      const routeName = routeService.getRouteName(to, locale)
      await loadTranslationsIfNeeded(locale, routeName, to.fullPath)
    }
  }

  // --- 3. Unified navigation hook with condition ---
  router.beforeEach(async (to, from, next) => {
    if (to.path !== from.path || isNoPrefixStrategy(i18nConfig.strategy!)) {
      // 3.1. If hooks are enabled, call the user hook
      if (i18nConfig.hooks) {
        const locale = routeService.getCurrentLocale(to as RouteLocationResolvedGeneric)
        const routeName = routeService.getRouteName(to as RouteLocationResolvedGeneric, locale)
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        await nuxtApp.callHook('i18n:register', (translations: Translations, selectedLocale?: string) => {
          i18nHelper.mergeTranslation(selectedLocale ?? locale, routeName, translations, true)
        })
      }

      // 3.2. Logic for fallback to the previous page
      if (import.meta.client && from.path !== to.path && enablePreviousPageFallback) {
        const fromLocale = routeService.getCurrentLocale(from as RouteLocationResolvedGeneric)
        const fromRouteName = routeService.getRouteName(from as RouteLocationResolvedGeneric, fromLocale)
        previousPageInfo.value = { locale: fromLocale, routeName: fromRouteName }
      }

      // 3.3. Load core (global + page) translations
      await loadGlobalTranslations(to as RouteLocationResolvedGeneric)
    }

    // Call next() once at the end
    if (next) {
      next()
    }
  })

  // --- 4. Conditional initial hook call ---
  if (i18nConfig.hooks) {
    const initialLocale = routeService.getCurrentLocale()
    const initialRouteName = routeService.getRouteName(router.currentRoute.value as RouteLocationResolvedGeneric, initialLocale)
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    await nuxtApp.callHook('i18n:register', (translations: Translations, selectedLocale?: string) => {
      i18nHelper.mergeTranslation(selectedLocale ?? initialLocale, initialRouteName, translations, true)
    }, initialLocale)
  }

  // 5. Load translations for the very first (initial) page
  await loadGlobalTranslations(router.currentRoute.value as RouteLocationResolvedGeneric)

  // 6. Build `provideData` (code unchanged)
  const provideData = {
    i18n: undefined,
    __micro: true,
    getLocale: (route?: RouteLocationNormalizedLoaded | RouteLocationResolvedGeneric) => routeService.getCurrentLocale(route),
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
      const routeName = routeService.getRouteName(route as RouteLocationResolvedGeneric, locale)
      let value = i18nHelper.getTranslation(locale, routeName, key)

      // If translation not found and there are saved previous translations, use them (only if enabled)
      if (!value && previousPageInfo.value && enablePreviousPageFallback) {
        const prev = previousPageInfo.value
        const prevValue = i18nHelper.getTranslation(prev.locale, prev.routeName, key)
        if (prevValue) {
          value = prevValue
          console.log(`Using fallback translation from previous route: ${prev.routeName} -> ${key}`)
        }
      }

      // If still not found, try general translations
      if (!value) {
        value = i18nHelper.getTranslation(locale, '', key)
      }

      if (!value) {
        if (isDev && import.meta.client) {
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
      const routeName = routeService.getRouteName(route as RouteLocationResolvedGeneric, locale)
      return !!i18nHelper.getTranslation(locale, routeName, key)
    },
    mergeTranslations: (newTranslations: Translations) => {
      const route = routeService.getCurrentRoute()
      const locale = routeService.getCurrentLocale(route)
      const routeName = routeService.getRouteName(route as RouteLocationResolvedGeneric, locale)
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
      return routeService.switchLocaleLogic(toLocale, unref(i18nRouteParams.value))
    },
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
}
