import { isNoPrefixStrategy } from '@i18n-micro/core'
import type { PathStrategy, ResolvedRouteLike } from '@i18n-micro/path-strategy'
import type { CleanTranslation, I18nRouteParams, Locale, MissingHandler, ModuleOptionsExtend, Params, Translations } from '@i18n-micro/types'
import { resolveI18nConfigWithRuntimeOverrides } from '@i18n-micro/utils/runtime-config'
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
import { createError, defineNuxtPlugin, navigateTo, useRouter, useRuntimeConfig } from '#imports'
import { useI18nHead } from '../composables/useI18nHead'
import { useI18nLocale } from '../composables/useI18nLocale'
import { createNuxtI18nPluginApi, NuxtI18n, NuxtTranslationLoader } from '../utils/nuxt-i18n'
import { translationStorage } from '../utils/storage'

const isDev = process.env.NODE_ENV !== 'production'

export default defineNuxtPlugin(async (nuxtApp) => {
  const router = useRouter()
  const i18nStrategy = createI18nStrategy(router)
  const runtimeConfig = useRuntimeConfig()
  const i18nConfig: ModuleOptionsExtend = resolveI18nConfigWithRuntimeOverrides(
    getI18nConfig() as ModuleOptionsExtend,
    runtimeConfig.public as Record<string, unknown>,
  )

  translationStorage.configure({
    maxSize: i18nConfig.cacheMaxSize ?? 0,
    ttl: i18nConfig.cacheTtl ?? 0,
  })

  const { locale: localeState, setLocale, getLocale, getEffectiveLocale, resolveInitialLocale, isValidLocale } = useI18nLocale()

  const i18nRouteParams = useState<I18nRouteParams>('i18n-route-params', () => ({}))
  const { resetPageHead } = useI18nHead()
  const customMissingHandler = useState<MissingHandler | null>('i18n-missing-handler', () => null)
  const ssrChunks = useState<Record<string, Record<string, unknown>>>('i18n-ssr-chunks', () => ({}))

  const i18n = new NuxtI18n({
    plural,
    missingWarn: i18nConfig.missingWarn ?? true,
    getCustomMissingHandler: () => customMissingHandler.value,
  })

  const getCurrentLocale = (route?: ResolvedRouteLike): string => {
    const r = route ?? (router.currentRoute.value as unknown as ResolvedRouteLike)
    return i18nStrategy.getCurrentLocale(r, getLocale() ?? null)
  }

  const getPluginRouteName = (route: ResolvedRouteLike, locale: string): string => {
    return i18nStrategy.getPluginRouteName(route, locale)
  }

  i18n.setRouteContextResolver((route) => {
    const resolvedRoute = (route ?? router.currentRoute.value) as unknown as ResolvedRouteLike
    const locale = getCurrentLocale(resolvedRoute)
    return {
      locale,
      routeName: getPluginRouteName(resolvedRoute, locale),
    }
  })

  nuxtApp.hook('page:transition:finish', () => {
    i18n.finishTransition()
  })

  const loadOptions = {
    apiBaseUrl: i18nConfig.apiBaseUrl ?? '_locales',
    baseURL: runtimeConfig.app.baseURL,
    apiBaseClientHost: i18nConfig.apiBaseClientHost,
    dateBuild: i18nConfig.dateBuild,
    routesLocaleLinks: i18nConfig.routesLocaleLinks,
  }

  if (import.meta.client && Object.keys(ssrChunks.value).length > 0) {
    translationStorage.seedFromSsrChunks(ssrChunks.value)
  }

  const loader = new NuxtTranslationLoader({
    i18n,
    loadOptions,
    getSsrChunks: () => ssrChunks.value,
    setSsrChunk: (cacheKey, data) => {
      ssrChunks.value = { ...ssrChunks.value, [cacheKey]: data }
    },
    isDev,
  })

  const serverLocale = import.meta.server ? nuxtApp.ssrContext?.event?.context?.i18n?.locale : undefined
  const initialLocale = resolveInitialLocale({
    route: router.currentRoute.value,
    serverLocale,
    getLocaleFromRoute: (r) => getCurrentLocale(r as unknown as ResolvedRouteLike),
  })
  const initialRouteName = getPluginRouteName(router.currentRoute.value as unknown as ResolvedRouteLike, initialLocale)

  try {
    await loader.switchContext(initialLocale, initialRouteName)
  } catch (e) {
    if (isDev) console.error('[i18n] Initial load error:', e)
    throw createError({ statusCode: 404, statusMessage: 'Page Not Found' })
  }

  const getRouteName = (route?: RouteLocationNormalizedLoaded | RouteLocationResolvedGeneric, locale?: string) => {
    const selectedRoute = route ?? router.currentRoute.value
    const selectedLocale = locale ?? getCurrentLocale(selectedRoute as unknown as ResolvedRouteLike)
    return i18nStrategy.getRouteBaseName(selectedRoute as unknown as ResolvedRouteLike, selectedLocale) ?? ''
  }

  const {
    helper,
    switchContext,
    provide: provideApi,
  } = createNuxtI18nPluginApi({
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
    setMissingHandler: (handler) => {
      customMissingHandler.value = handler
    },
  })

  router.beforeEach(async (to, from) => {
    if (to.name !== from.name) {
      i18nRouteParams.value = {}
      resetPageHead()
    }

    const shouldSwitchContext = to.path !== from.path || isNoPrefixStrategy(i18nConfig.strategy!)

    if (!shouldSwitchContext) {
      return
    }

    try {
      const targetLocale = getEffectiveLocale(to, (r) => getCurrentLocale(r as unknown as ResolvedRouteLike))
      const targetRouteName = getPluginRouteName(to as unknown as ResolvedRouteLike, targetLocale)

      if (targetLocale !== i18n.getCurrentLocale() || targetRouteName !== i18n.getCurrentRouteName()) {
        await switchContext(targetLocale, targetRouteName)
      }

      if (targetLocale && isValidLocale(targetLocale) && localeState.value !== targetLocale) {
        setLocale(targetLocale)
      }
    } catch (e) {
      if (isDev) console.error('[i18n] Navigation error:', e)
    }
    return
  })

  const provideData = {
    ...provideApi,
    helper,
    i18n: undefined as unknown,
    __micro: true,
  }

  const $provideData = Object.fromEntries(Object.entries(provideData).map(([key, value]) => [`$${key}`, value]))

  ;(provideData as { i18n: typeof provideData & Record<string, unknown> }).i18n = { ...provideData, ...$provideData }

  return {
    provide: {
      ...provideData,
      getI18nConfig: () => i18nConfig,
    },
  }
})

export interface PluginsInjections {
  $i18nStrategy: PathStrategy
  $getI18nConfig: () => ModuleOptionsExtend
  $getLocale: (route?: RouteLocationNormalizedLoaded | RouteLocationResolvedGeneric) => string
  $getLocaleName: () => string | null
  $defaultLocale: () => string | undefined
  $getLocales: () => Locale[]
  $getRouteName: (route?: RouteLocationNamedRaw | RouteLocationResolvedGeneric, locale?: string) => string
  $t: (key: string, params?: Params, defaultValue?: string | null) => CleanTranslation
  $_t: (route: RouteLocationNormalizedLoaded) => (key: string, params?: Params, defaultValue?: string | null) => CleanTranslation
  $ts: (key: string, params?: Params, defaultValue?: string) => string
  $_ts: (route: RouteLocationNormalizedLoaded) => (key: string, params?: Params, defaultValue?: string | null) => string
  $tc: (key: string, params: number | Params, defaultValue?: string) => string
  $tn: (value: number, options?: Intl.NumberFormatOptions) => string
  $td: (value: Date | number | string, options?: Intl.DateTimeFormatOptions) => string
  $tdr: (value: Date | number | string, options?: Intl.RelativeTimeFormatOptions) => string
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
