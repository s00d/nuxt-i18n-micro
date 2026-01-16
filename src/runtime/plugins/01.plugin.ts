import type {
  RouteLocationNormalizedLoaded,
  RouteLocationRaw,
  RouteLocationResolved,
  RouteLocationResolvedGeneric,
  RouteLocationNamedRaw,
} from 'vue-router'
import { useTranslationHelper, isNoPrefixStrategy, RouteService, FormatService, compileOrInterpolate, createCompiledCache, type TranslationCache } from '@i18n-micro/core'
import type { ModuleOptionsExtend, Locale, I18nRouteParams, Params, Translations, CleanTranslation, MissingHandler, MessageCompilerFunc } from '@i18n-micro/types'
import { useRouter, useCookie, navigateTo, defineNuxtPlugin, useRuntimeConfig, createError } from '#imports'
import { unref } from 'vue'
import { useState } from '#app'
import { plural } from '#build/i18n.plural.mjs'

const isDev = process.env.NODE_ENV !== 'production'

// Lazy load messageCompiler (with proper error handling)
let messageCompiler: MessageCompilerFunc | undefined
let messageCompilerLoaded = false

async function loadMessageCompiler(): Promise<MessageCompilerFunc | undefined> {
  if (messageCompilerLoaded) return messageCompiler
  messageCompilerLoaded = true
  try {
    // Bypass vite pre-import optimization
    const modName = '#build/i18n.message-compiler.mjs'
    const mod = await import(/* @vite-ignore */ modName)
    messageCompiler = mod.messageCompiler
  }
  catch (err: unknown) {
    // Определяем, является ли ошибка ошибкой "модуль не найден"
    // Это может быть MODULE_NOT_FOUND, ERR_PACKAGE_IMPORT_NOT_DEFINED (для package imports),
    // или сообщение об ошибке, содержащее информацию о том, что модуль не найден
    const isModuleMissing
      = err
        && typeof err === 'object'
        && (('code' in err && (
          (err as NodeJS.ErrnoException).code === 'MODULE_NOT_FOUND'
          || (err as NodeJS.ErrnoException).code === 'ERR_PACKAGE_IMPORT_NOT_DEFINED'
        ))
        || ('message' in err && (
          (err as Error).message?.includes('Cannot find module')
          || (err as Error).message?.includes('Package import specifier')
          || (err as Error).message?.includes('is not defined')
        )))

    // Игнорируем только если модуль действительно отсутствует (нормально, если messageCompiler не настроен).
    // Все остальные ошибки (например, синтаксические) выводим в консоль.
    if (!isModuleMissing) {
      console.error('[i18n] Failed to load message compiler. Check for errors in your messageCompiler function in nuxt.config:', err)
    }
  }
  return messageCompiler
}

// Cache OUTSIDE useState to avoid SSR serialization issues
// Functions cannot be serialized in SSR payload
const compiledMessageCache = createCompiledCache()

export default defineNuxtPlugin(async (nuxtApp) => {
  // Load messageCompiler at startup (async, but non-blocking)
  await loadMessageCompiler()

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

  // Читаем куку для обычной стратегии (не hashMode и не noPrefix)
  // Используем localeCookie из конфига или 'user-locale' по умолчанию
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
      const routeName = routeService.getPluginRouteName(route as RouteLocationResolvedGeneric, locale)
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

      // Compile/Interpolate (using centralized utility)
      if (typeof value === 'string') {
        return compileOrInterpolate(
          value,
          locale,
          routeName,
          key,
          params,
          messageCompiler,
          compiledMessageCache,
        ) as CleanTranslation
      }

      return value as CleanTranslation
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

      // Create a getter wrapper that matches the signature expected by plural function
      // The plural function expects: (key: string | string[], params?: Params, defaultValue?: string) => unknown
      const getter = (translationKey: string | string[], getterParams?: Params, getterDefaultValue?: string): unknown => {
        // Convert TranslationKey (string | string[]) to string for provideData.t
        const keyStr = Array.isArray(translationKey) ? translationKey.join('.') : translationKey
        return provideData.t(keyStr, getterParams, getterDefaultValue ?? undefined)
      }

      return plural(key, Number.parseInt(count.toString()), _params, currentLocale, getter) as string ?? defaultValue ?? key
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
      compiledMessageCache.clear()
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
      // Clear compiled message cache when locale changes
      compiledMessageCache.clear()
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
  $setMissingHandler: (handler: MissingHandler | null) => void
  helper: ReturnType<typeof useTranslationHelper>
}
