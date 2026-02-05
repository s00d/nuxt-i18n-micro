import type {
  RouteLocationNormalizedLoaded,
  RouteLocationRaw,
  RouteLocationResolved,
  RouteLocationResolvedGeneric,
  RouteLocationNamedRaw,
} from 'vue-router'
import { isNoPrefixStrategy, RouteService, FormatService } from '@i18n-micro/core'
import type { ModuleOptionsExtend, Locale, I18nRouteParams, Params, Translations, CleanTranslation, MissingHandler } from '@i18n-micro/types'
import type { PathStrategy, RouteLike, ResolvedRouteLike } from '@i18n-micro/path-strategy'
import { useRouter, navigateTo, defineNuxtPlugin, createError, useRuntimeConfig, useHead } from '#imports'
import { unref, shallowRef, triggerRef } from 'vue'
import { useState } from '#app'
import { plural } from '#build/i18n.plural.mjs'
import { getI18nConfig, createI18nStrategy } from '#build/i18n.strategy.mjs'
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

  // === 1. ЛОКАЛЬНЫЙ КЭШ ===
  const loadedChunks = new Map<string, Record<string, unknown>>()

  // Текущие значения
  let currentLocale = ''
  let currentRouteName = ''

  // Сигнал обновления (для реактивности при смене языка)
  const contextSignal = shallowRef(0)

  // === LOCALE SERVICE ===
  const {
    locale: localeState,
    setLocale,
    getLocale,
    getLocaleWithServerFallback,
    getEffectiveLocale,
    resolveInitialLocale,
    isValidLocale,
  } = useI18nLocale()

  let hashLocaleDefault: string | null | undefined = null
  let noPrefixDefault: string | null | undefined = null

  if (i18nConfig.hashMode) {
    const preferredLocale = await nuxtApp.runWithContext(() => getLocale())
    hashLocaleDefault = isValidLocale(preferredLocale) ? preferredLocale : null
  }
  else if (isNoPrefixStrategy(i18nConfig.strategy!)) {
    const serverLocale = import.meta.server ? nuxtApp.ssrContext?.event?.context?.i18n?.locale : undefined
    const preferredLocale = await nuxtApp.runWithContext(() => getLocaleWithServerFallback(serverLocale))
    noPrefixDefault = isValidLocale(preferredLocale) ? preferredLocale : i18nConfig.defaultLocale
  }

  const routeService = new RouteService(
    i18nConfig,
    router,
    hashLocaleDefault,
    noPrefixDefault,
    (to, options) => navigateTo(to, options),
    () => getLocale() ?? null,
  )
  const translationService = new FormatService()

  // useState только для того, что реально нужно между компонентами
  const i18nRouteParams = useState<I18nRouteParams>('i18n-route-params', () => ({}))
  const customMissingHandler = useState<MissingHandler | null>('i18n-missing-handler', () => null)

  // Previous page fallback
  const enablePreviousPageFallback = i18nConfig.previousPageFallback ?? false
  const previousPageInfo = useState<{ locale: string, routeName: string } | null>('i18n-previous-page', () => null)

  // Очищаем previousPageInfo после полной загрузки страницы
  // ВАЖНО: i18nRouteParams НЕ сбрасываем здесь - они нужны для locale switcher
  // i18nRouteParams сбрасываются в router.beforeEach когда меняется route name
  nuxtApp.hook('page:finish', () => {
    if (import.meta.client) {
      previousPageInfo.value = null
    }
  })

  const missingWarn = i18nConfig.missingWarn ?? true

  // === 2. ЗАГРУЗЧИК ЧАНКОВ ===
  const loadChunk = async (locale: string, routeName?: string): Promise<Record<string, unknown>> => {
    try {
      const result = await translationStorage.load(locale, routeName, {
        apiBaseUrl: i18nConfig.apiBaseUrl ?? '_locales',
        baseURL: runtimeConfig.app.baseURL,
        dateBuild: i18nConfig.dateBuild,
      })

      // Сохраняем в локальный кэш
      loadedChunks.set(result.cacheKey, result.data)

      // SERVER: Инъекция для клиента
      if (import.meta.server && result.json) {
        const ctx = nuxtApp.ssrContext!.event.context
        if (!ctx._i18n) ctx._i18n = {}
        ctx._i18n[result.cacheKey] = result.json
      }

      return result.data
    }
    catch (e) {
      if (isDev) console.error('[i18n] Load error:', e)
      return {}
    }
  }

  // === 3. ПЕРЕКЛЮЧАТЕЛЬ КОНТЕКСТА ===
  const switchContext = async (locale: string, routeName?: string) => {
    // 1. Параллельно загружаем general и page
    await Promise.all([
      loadChunk(locale),
      routeName ? loadChunk(locale, routeName) : Promise.resolve({}),
    ])

    // 2. Обновляем текущие значения
    currentLocale = locale
    currentRouteName = routeName || ''

    // 3. Сигнализируем Vue обновить шаблоны
    triggerRef(contextSignal)
  }

  // === 5. ИНИЦИАЛИЗАЦИЯ ===
  const serverLocale = import.meta.server ? nuxtApp.ssrContext?.event?.context?.i18n?.locale : undefined
  const initialLocale = resolveInitialLocale({
    route: router.currentRoute.value,
    serverLocale,
    getLocaleFromRoute: r => routeService.getCurrentLocale(r as RouteLocationResolvedGeneric),
  })
  const initialRouteName = routeService.getPluginRouteName(router.currentRoute.value as RouteLocationResolvedGeneric, initialLocale)

  try {
    await switchContext(initialLocale, initialRouteName)
  }
  catch (e) {
    if (isDev) console.error('[i18n] Initial load error:', e)
    throw createError({ statusCode: 404, statusMessage: 'Page Not Found' })
  }

  // Инъекция скрипта (Server Only)
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

  // === 6. HOOKS (Client Navigation) ===
  router.beforeEach(async (to, from, next) => {
    if (to.name !== from.name) {
      i18nRouteParams.value = {}
    }
    if (to.path === from.path && !isNoPrefixStrategy(i18nConfig.strategy!)) {
      if (next) next()
      return
    }

    try {
      const targetLocale = getEffectiveLocale(to, r => routeService.getCurrentLocale(r as RouteLocationResolvedGeneric))
      const targetRouteName = routeService.getPluginRouteName(to as RouteLocationResolvedGeneric, targetLocale)

      // Если изменился язык или страница — меняем контекст
      if (targetLocale !== currentLocale || targetRouteName !== currentRouteName) {
        // Сохраняем информацию о предыдущей странице для fallback (только на клиенте)
        if (import.meta.client && enablePreviousPageFallback && from.path !== to.path) {
          const fromLocale = routeService.getCurrentLocale(from as RouteLocationResolvedGeneric)
          const fromRouteName = routeService.getPluginRouteName(from as RouteLocationResolvedGeneric, fromLocale)
          previousPageInfo.value = { locale: fromLocale, routeName: fromRouteName }
        }

        await switchContext(targetLocale, targetRouteName)
      }

      if (targetLocale && isValidLocale(targetLocale) && localeState.value !== targetLocale) {
        setLocale(targetLocale)
      }
    }
    catch (e) {
      if (isDev) console.error('[i18n] Navigation error:', e)
    }

    if (next) next()
  })

  // === 7. T-FUNCTION: Максимальная скорость (Слоёный поиск) ===
  const tFast = (key: string, params?: Params, defaultValue?: string | null, route?: RouteLocationNormalizedLoaded | RouteLocationResolvedGeneric): CleanTranslation => {
    if (!key) return '' as CleanTranslation

    const locale = route ? routeService.getCurrentLocale(route as RouteLocationResolvedGeneric) : currentLocale
    const routeName = route ? routeService.getPluginRouteName(route as RouteLocationResolvedGeneric, locale) : currentRouteName
    const general = loadedChunks.get(`${locale}:general`) || {}
    const page = routeName ? (loadedChunks.get(`${locale}:${routeName}`) || {}) : {}

    // 1. Ищем в странице (приоритет)
    let val = page[key]

    // 2. Если нет — ищем в общем
    if (val === undefined) {
      val = general[key]
    }

    // 3. Вложенные ключи (key.subkey.subsubkey)
    if (val === undefined && key.includes('.')) {
      val = getByPath(page, key)
      if (val === undefined) {
        val = getByPath(general, key)
      }
    }

    // 4. Fallback на предыдущую страницу (experimental)
    if (val === undefined && enablePreviousPageFallback && previousPageInfo.value) {
      const prev = previousPageInfo.value
      const prevPage = prev.routeName ? (loadedChunks.get(`${prev.locale}:${prev.routeName}`) || {}) : {}
      const prevGeneral = loadedChunks.get(`${prev.locale}:general`) || {}

      val = prevPage[key]
      if (val === undefined) {
        val = prevGeneral[key]
      }
      if (val === undefined && key.includes('.')) {
        val = getByPath(prevPage, key)
        if (val === undefined) {
          val = getByPath(prevGeneral, key)
        }
      }
    }

    // 5. Не найдено
    if (val === undefined) {
      if (customMissingHandler.value) {
        customMissingHandler.value(locale, key, routeName)
      }
      else if (missingWarn && isDev && import.meta.client) {
        console.warn(`[i18n] Missing key '${key}' in '${locale}' for route '${routeName}'`)
      }
      return (defaultValue === undefined ? key : defaultValue) as CleanTranslation
    }

    // 6. Не строка — возвращаем как есть (объект, массив)
    if (typeof val !== 'string') return val as CleanTranslation

    // 7. Без параметров — быстрый возврат
    if (!params) return val as CleanTranslation

    // 8. Интерполяция
    return val.replace(RE_TOKEN, (_: string, k: string) => {
      return params[k] !== undefined ? String(params[k]) : `{${k}}`
    }) as CleanTranslation
  }

  // === HELPER FUNCTIONS ===
  const getRouteName = (route?: RouteLocationNormalizedLoaded | RouteLocationResolvedGeneric, locale?: string) => {
    const selectedLocale = locale ?? routeService.getCurrentLocale()
    const selectedRoute = route ?? routeService.getCurrentRoute()
    return routeService.getRouteName(selectedRoute as RouteLocationResolvedGeneric, selectedLocale)
  }

  const hasTranslation = (key: string): boolean => {
    const general = loadedChunks.get(`${currentLocale}:general`) || {}
    const page = currentRouteName ? (loadedChunks.get(`${currentLocale}:${currentRouteName}`) || {}) : {}
    if (page[key] !== undefined) return true
    if (general[key] !== undefined) return true
    if (key.includes('.')) {
      if (getByPath(page, key) !== undefined) return true
      if (getByPath(general, key) !== undefined) return true
    }
    // Fallback на предыдущую страницу (experimental)
    if (enablePreviousPageFallback && previousPageInfo.value) {
      const prev = previousPageInfo.value
      const prevPage = prev.routeName ? (loadedChunks.get(`${prev.locale}:${prev.routeName}`) || {}) : {}
      const prevGeneral = loadedChunks.get(`${prev.locale}:general`) || {}
      if (prevPage[key] !== undefined) return true
      if (prevGeneral[key] !== undefined) return true
      if (key.includes('.')) {
        if (getByPath(prevPage, key) !== undefined) return true
        if (getByPath(prevGeneral, key) !== undefined) return true
      }
    }
    return false
  }

  const mergeTranslations = (newTranslations: Translations) => {
    const pageKey = currentRouteName ? `${currentLocale}:${currentRouteName}` : `${currentLocale}:general`
    const current = loadedChunks.get(pageKey) || {}
    loadedChunks.set(pageKey, { ...current, ...newTranslations })
    triggerRef(contextSignal)
  }

  // Helper для i18n:register хука
  const helper = {
    async mergeTranslation(locale: string, routeName: string, newTranslations: Translations, _force = false): Promise<void> {
      const key = routeName ? `${locale}:${routeName}` : `${locale}:general`
      // Загружаем переводы если их нет
      if (!loadedChunks.has(key)) {
        await loadChunk(locale, routeName || undefined)
      }
      const existing = loadedChunks.get(key) || {}
      loadedChunks.set(key, { ...existing, ...newTranslations })
      if (locale === currentLocale) {
        triggerRef(contextSignal)
      }
    },
    async mergeGlobalTranslation(locale: string, newTranslations: Translations, _force = false): Promise<void> {
      const key = `${locale}:general`
      // Загружаем переводы если их нет
      if (!loadedChunks.has(key)) {
        await loadChunk(locale)
      }
      const existing = loadedChunks.get(key) || {}
      loadedChunks.set(key, { ...existing, ...newTranslations })
      if (locale === currentLocale) {
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
      getEffectiveLocale(route, r => routeService.getCurrentLocale(r as RouteLocationResolvedGeneric)),
    getLocaleName: () => routeService.getCurrentName(routeService.getCurrentRoute()),
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
      const { count, ..._params } = typeof params === 'number' ? { count: params } : params
      if (count === undefined) return defaultValue ?? key
      return plural(key, Number.parseInt(count.toString()), _params, currentLocale, tFast) as string ?? defaultValue ?? key
    },
    tn: (value: number, options?: Intl.NumberFormatOptions) => {
      return translationService.formatNumber(value, currentLocale, options)
    },
    td: (value: Date | number | string, options?: Intl.DateTimeFormatOptions) => {
      return translationService.formatDate(value, currentLocale, options)
    },
    tdr: (value: Date | number | string, options?: Intl.RelativeTimeFormatOptions): string => {
      return translationService.formatRelativeTime(value, currentLocale, options)
    },
    has: hasTranslation,
    mergeTranslations,
    mergeGlobalTranslations: mergeTranslations,
    switchLocaleRoute: (toLocale: string) => {
      const route = routeService.getCurrentRoute()
      const fromLocale = routeService.getCurrentLocale(route)
      return routeService.switchLocaleRoute(fromLocale, toLocale, route as RouteLocationResolvedGeneric, unref(i18nRouteParams.value))
    },
    clearCache: () => {
      translationStorage.clear()
      loadedChunks.clear()
      triggerRef(contextSignal)
    },
    switchLocalePath: (toLocale: string) => {
      const route = routeService.getCurrentRoute()
      const fromLocale = routeService.getCurrentLocale(route)
      const localeRoute = routeService.switchLocaleRoute(fromLocale, toLocale, route as RouteLocationResolvedGeneric, unref(i18nRouteParams.value))
      if (!localeRoute || typeof localeRoute !== 'object') return String(localeRoute ?? '')
      if ('fullPath' in localeRoute && localeRoute.fullPath) return localeRoute.fullPath as string
      if ('name' in localeRoute && localeRoute.name && router.hasRoute(localeRoute.name)) {
        return router.resolve(localeRoute).fullPath
      }
      return ''
    },
    switchLocale: async (toLocale: string) => {
      if (isValidLocale(toLocale)) {
        setLocale(toLocale)
        if (isNoPrefixStrategy(i18nConfig.strategy!) || i18nConfig.hashMode) {
          const route = routeService.getCurrentRoute()
          const routeName = routeService.getPluginRouteName(route as RouteLocationResolvedGeneric, toLocale)
          await switchContext(toLocale, routeName)
        }
      }
      return routeService.switchLocaleLogic(toLocale, unref(i18nRouteParams.value))
    },
    switchRoute: (route: RouteLocationNamedRaw | RouteLocationResolvedGeneric | string, toLocale?: string) => {
      return routeService.switchLocaleLogic(toLocale ?? routeService.getCurrentLocale(), unref(i18nRouteParams.value), route as RouteLocationResolvedGeneric)
    },
    localeRoute(to: RouteLocationNamedRaw | RouteLocationResolvedGeneric | string, locale?: string): RouteLocationResolved {
      try {
        const targetLocale = (locale !== undefined && locale !== '') ? String(locale) : routeService.getCurrentLocale()
        const currentRoute = routeService.getCurrentRoute()
        const result = i18nStrategy.localeRoute(targetLocale, to as string | RouteLike, currentRoute as unknown as ResolvedRouteLike)
        const fullPath = result.fullPath ?? result.path ?? ''
        const path = result.path ?? fullPath.split('?')[0]?.split('#')[0] ?? fullPath
        const out: { path: string, fullPath: string, href: string, query?: Record<string, string>, hash?: string } = { path, fullPath, href: fullPath }
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
        const targetLocale = (locale !== undefined && locale !== '') ? String(locale) : routeService.getCurrentLocale()
        const currentRoute = routeService.getCurrentRoute()
        const result = i18nStrategy.localeRoute(targetLocale, to as string | RouteLike, currentRoute as unknown as ResolvedRouteLike)
        return (result.fullPath ?? result.path ?? '') as string
      }
      catch {
        const localeRoute = routeService.resolveLocalizedRoute(to, locale)
        if (!localeRoute || typeof localeRoute !== 'object') return String(localeRoute ?? '')
        return 'fullPath' in localeRoute ? localeRoute.fullPath as string : ''
      }
    },
    setI18nRouteParams: (value: I18nRouteParams) => {
      i18nRouteParams.value = value
      return i18nRouteParams.value
    },
    loadPageTranslations: async (locale: string, routeName: string, translations: Translations) => {
      const pageKey = `${locale}:${routeName}`
      const current = loadedChunks.get(pageKey) || {}
      loadedChunks.set(pageKey, { ...current, ...translations })
      if (locale === currentLocale && routeName === currentRouteName) {
        triggerRef(contextSignal)
      }
    },
    setMissingHandler: (handler: MissingHandler | null) => {
      customMissingHandler.value = handler
    },
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
}
