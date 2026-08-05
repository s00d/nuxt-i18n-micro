import { isNoPrefixStrategy } from '@i18n-micro/core'
import type { PathStrategy, ResolvedRouteLike } from '@i18n-micro/path-strategy'
import type {
  CleanTranslation,
  DefineI18nRouteConfig,
  I18nRouteParams,
  Locale,
  MissingHandler,
  ModuleOptionsExtend,
  Params,
  Translations,
} from '@i18n-micro/types'
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
import { setI18nDevtoolsBridge } from '../devtools/bridge'
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

  const i18n = new NuxtI18n({
    plural,
    missingWarn: i18nConfig.missingWarn ?? true,
    cacheMaxSize: i18nConfig.cacheMaxSize ?? 0,
    getCustomMissingHandler: () => customMissingHandler.value,
    numberFormats: i18nConfig.numberFormats,
    datetimeFormats: i18nConfig.datetimeFormats,
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

  // Same as @nuxtjs/i18n with preload:false — dictionaries stay off the HTML payload.
  // Server loads into memory for SSR; client loads via /_locales in switchContext below.
  const loader = new NuxtTranslationLoader({
    i18n,
    loadOptions,
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

  if (import.meta.dev && import.meta.client) {
    setI18nDevtoolsBridge({
      i18n,
      i18nConfig,
      localeState,
    })
  }

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
  /** The active routing strategy, resolving locales to and from paths. */
  $i18nStrategy: PathStrategy
  /** The resolved module configuration, as the runtime sees it. */
  $getI18nConfig: () => ModuleOptionsExtend
  /** Code of the active locale. Pass a route to read the locale that route belongs to. */
  $getLocale: (route?: RouteLocationNormalizedLoaded | RouteLocationResolvedGeneric) => string
  /** The active locale's `displayName` from the config, or `null` when it has none. */
  $getLocaleName: () => string | null
  /** Code of the configured default locale. */
  $defaultLocale: () => string | undefined
  /** Every configured locale, with its metadata. */
  $getLocales: () => Locale[]
  /** Route name with the locale prefix stripped — the name translations are keyed by. */
  $getRouteName: (route?: RouteLocationNamedRaw | RouteLocationResolvedGeneric, locale?: string) => string
  /**
   * Translate a key, interpolating `params` into it. Returns `defaultValue` when the key is
   * missing, or the key itself when no default is given.
   */
  $t: (key: string, params?: Params, defaultValue?: string | null) => CleanTranslation
  /**
   * Bind `$t` to a specific route, for translating outside the current page — a layout rendering
   * a link to another route, for example.
   */
  $_t: (route: RouteLocationNormalizedLoaded) => (key: string, params?: Params, defaultValue?: string | null) => CleanTranslation
  /**
   * Like `$t`, but always returns a string: an object or array value is stringified rather than
   * returned as-is.
   */
  $ts: (key: string, params?: Params, defaultValue?: string) => string
  /** Bind `$ts` to a specific route. See `$_t`. */
  $_ts: (route: RouteLocationNormalizedLoaded) => (key: string, params?: Params, defaultValue?: string | null) => string
  /**
   * Translate with pluralization. `params` may be the count itself, or an object containing
   * `count`.
   */
  $tc: (key: string, params: number | Params, defaultValue?: string) => string
  /**
   * Format a number with `Intl.NumberFormat` in the active locale. A key selects a named format
   * from the config.
   */
  $tn: {
    (value: number, options?: Intl.NumberFormatOptions): string
    (value: number, key: string, overrides?: Intl.NumberFormatOptions): string
    (value: number, key: string, locale: string, overrides?: Intl.NumberFormatOptions): string
  }
  /**
   * Format a date with `Intl.DateTimeFormat` in the active locale. A key selects a named format
   * from the config.
   */
  $td: {
    (value: Date | number | string, options?: Intl.DateTimeFormatOptions): string
    (value: Date | number | string, key: string, overrides?: Intl.DateTimeFormatOptions): string
    (value: Date | number | string, key: string, locale: string, overrides?: Intl.DateTimeFormatOptions): string
  }
  /** Format a date as relative time ("3 days ago") with `Intl.RelativeTimeFormat`. */
  $tdr: (value: Date | number | string, options?: Intl.RelativeTimeFormatOptions) => string
  /**
   * Whether a key resolves in the active locale. Use it to branch on optional copy instead of
   * rendering a raw key.
   */
  $has: (key: string) => boolean
  /**
   * Every translation currently in memory for the active locale and route, as a tree.
   * Read-only view of what `$t()` can resolve right now.
   */
  $resolveTranslations: () => Translations
  /**
   * Replace the value at `key` in the active dictionary. This is a replace, not a merge —
   * use `$mergeTranslations` when existing siblings should survive.
   */
  $setTranslation: (key: string, value: unknown) => void
  /** Merge translations into the active locale at runtime, overriding what is loaded. */
  $mergeTranslations: (newTranslations: Translations) => void
  /** The route object for the current page in another locale, without navigating. */
  $switchLocaleRoute: (locale: string) => RouteLocationRaw
  /** The path of the current page in another locale, without navigating. */
  $switchLocalePath: (locale: string) => string
  /** Navigate to the current page in another locale. */
  $switchLocale: (locale: string) => void
  /** Navigate to another route, keeping the active locale or switching to `toLocale`. */
  $switchRoute: (route: RouteLocationNamedRaw | RouteLocationResolvedGeneric | string, toLocale?: string) => void
  /** Resolve a route in the given locale, or the active one. */
  $localeRoute: (to: RouteLocationNamedRaw | RouteLocationResolvedGeneric | string, locale?: string) => RouteLocationResolved
  /** Resolve a path in the given locale, or the active one. */
  $localePath: (to: RouteLocationNamedRaw | RouteLocationResolvedGeneric | string, locale?: string) => string
  /**
   * Set per-locale params for the current route, so a dynamic segment can differ per language.
   * Call it during SSR, before the head is rendered.
   */
  $setI18nRouteParams: (value: I18nRouteParams) => I18nRouteParams
  /** Load translations for a page at runtime, for content whose keys are not known at build time. */
  $loadPageTranslations: (locale: string, routeName: string, translations: Translations) => Promise<void>
  /** Install a callback invoked for every unresolved key. Pass `null` to remove it. */
  $setMissingHandler: (handler: MissingHandler | null) => void
}

/**
 * Helpers reachable through `useNuxtApp()` but deliberately absent from `useI18n()`.
 *
 * Declared so they are documented from the same source as everything else — the reference
 * page is generated from these interfaces, and a helper that lives only in an inline
 * `provide` gets described by hand and then drifts.
 */
export interface NuxtAppOnlyInjections {
  /**
   * Register per-page locale configuration and translations from inside a component.
   * Merges into the active locale and re-applies when the locale changes.
   */
  $defineI18nRoute: (routeDefinition: DefineI18nRouteConfig) => Promise<void>
  /** Drop every cached chunk, on the client and in the active dictionary. */
  $clearCache: () => void
}
