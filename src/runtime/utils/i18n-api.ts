import { isNoPrefixStrategy, textOf, urlPath } from '@i18n-micro/core'
import type { PathStrategy, ResolvedRouteLike, RouteLike } from '@i18n-micro/path-strategy'
import type {
  DefineI18nRouteConfig,
  I18nRouteParams,
  MissingHandler,
  ModuleOptionsExtend,
  Params,
  TranslationKey,
  Translations,
} from '@i18n-micro/types'
import { trimTrailingSlashes } from '@i18n-micro/utils/app-path'
import { hasProtocol } from 'ufo'
import { getCurrentInstance, onActivated, watch } from 'vue'
import type {
  RouteLocationNamedRaw,
  RouteLocationNormalizedLoaded,
  RouteLocationRaw,
  RouteLocationResolved,
  RouteLocationResolvedGeneric,
  Router,
} from 'vue-router'
import { domains, defineRoute } from '#build/i18n.strategy.mjs'
import type { useI18nLocale } from '../composables/useI18nLocale'
import type { NuxtI18n, NuxtTranslationLoader } from './nuxt-i18n'
import { usePageRoute } from './page-head'
import { applyTrailingSlash } from './trailing-slash'

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
 * A route the strategy left without them goes by its path.
 */
function toRouteLocationResolved(result: LocaleRouteResult): RouteLocationResolved {
  const fullPath = result.fullPath ?? result.path ?? ''
  const path = result.path ?? urlPath(fullPath)
  const out: LocaleRouteResult & { path: string; fullPath: string; href: string } = { path, fullPath, href: fullPath }
  if (result.name) out.name = result.name
  if (result.params && Object.keys(result.params).length) out.params = result.params
  if (result.query && Object.keys(result.query).length) out.query = result.query
  if (result.hash) out.hash = result.hash
  return out as unknown as RouteLocationResolved
}

/** A URL by its explicit scheme. Not `//host` or a bare `x.yy`: such strings can come from a request, and stay paths. */
const URL_SCHEME = /^(?:https?:|mailto:|tel:)/i

/** `NavigationFailureType.duplicated`. */
const DUPLICATED = 16

/** Never a page, and no request can send a visitor elsewhere with one. */
const APP_SCHEME = /^(?:mailto:|tel:)/i

/** URL of a switch result: the strategy hands out a URL string or a resolved route (fullPath set). */
export function switchedPath(switched: RouteLike | string): string {
  return typeof switched === 'string' ? switched : (switched.fullPath ?? switched.path ?? '')
}

export interface NuxtI18nPluginApiDeps {
  i18n: NuxtI18n
  loader: NuxtTranslationLoader
  i18nStrategy: PathStrategy
  i18nConfig: ModuleOptionsExtend
  router: Router
  locale: ReturnType<typeof useI18nLocale>
  getCurrentLocale: (route?: ResolvedRouteLike) => string
  i18nRouteParams: { value: I18nRouteParams }
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
    locale: localeState,
    getCurrentLocale,
    i18nRouteParams,
    navigateTo,
    setMissingHandler,
    isHydrating,
  } = deps
  const { getEffectiveLocale, setLocale, isValidLocale } = localeState
  /** The locale state alone, with no cookie: what the page shows, not yet what the visitor chose. */
  const setLocaleState = (code: string) => {
    localeState.locale.value = code
  }

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

  const switchedLink = (toLocale: string) => i18nStrategy.switchLocaleRoute(toLocale, linkRoute(), { i18nRouteParams: i18nRouteParams.value })

  const isUrl = (to: unknown): to is string => typeof to === 'string' && URL_SCHEME.test(to)

  /** `to` in the given locale, or the current one. */
  const localized = (to: RouteLocationNamedRaw | RouteLocationResolvedGeneric | string, locale?: string) =>
    i18nStrategy.localeRoute(locale !== undefined && locale !== '' ? String(locale) : getCurrentLocale(), to as string | RouteLike)

  const switchLocaleLogic = (toLocale: string, i18nParams: I18nRouteParams, to?: RouteLocationNamedRaw | RouteLocationResolvedGeneric | string) => {
    if (typeof to === 'string' && APP_SCHEME.test(to)) return navigateTo(to, { redirectCode: 200, external: true })

    // a path is read as the page it shows (any locale's form of it), then switched like a route,
    // so per-locale params (`i18nRouteParams`) apply to it too
    const from = typeof to === 'string' ? i18nStrategy.localeRoute(getCurrentLocale(), to) : (to ?? router.currentRoute.value)
    const switchedRoute = i18nStrategy.switchLocaleRoute(toLocale, from as unknown as ResolvedRouteLike, {
      i18nRouteParams: i18nParams,
      named: isNoPrefix,
    })

    // only a locale's own domain leaves the app: a string handed to `$switchRoute` may come from a request
    const url = switchedPath(switchedRoute)
    const domainUrl = i18nConfig.locales?.find((locale) => locale.code === toLocale)?.baseUrl
    const domain = domainUrl && trimTrailingSlashes(domainUrl)
    if (domain && (url === domain || url.startsWith(`${domain}/`))) return navigateTo(url, { redirectCode: 200, external: true })

    if (isNoPrefix) {
      // URL stays the same under no_prefix — push would append a duplicate history entry (#238).
      // By name with no path: pages can share a path here, and the router encodes params it is handed that way.
      // A copy: the strategy may hand back the current route object itself.
      const { path, fullPath, ...named } = switchedRoute as RouteLike
      return router.replace({ ...(named.name ? named : { path, fullPath, ...named }), force: true } as RouteLocationRaw)
    }

    return router.push(withSlashRule(switchedRoute) as RouteLocationRaw)
  }

  /**
   * Did `$switchLocale` take effect? A duplicate commits nothing, on a page with one URL for every locale
   * (`excludePatterns`): the choice stands for the next one. Any other failure left the page as it was, and the state
   * follows the page. An arrival in the locale is an explicit choice, on a 404 too, where a plain navigation stores nothing.
   */
  const settleSwitch = (toLocale: string, failure: unknown) => {
    const type = failure instanceof Error ? (failure as Error & { type?: number }).type : undefined
    if (failure instanceof Error && type !== DUPLICATED) setLocaleState(i18n.getLocale())
    else if (type === DUPLICATED || i18n.getLocale() === toLocale) setLocale(toLocale)
  }

  const helper = {
    async mergeTranslation(locale: string, routeName: string, newTranslations: Translations): Promise<void> {
      await i18n.mergeTranslationAsync(locale, routeName, newTranslations, (l, r) => loader.loadAsync(l, r))
    },
  }

  const provide = {
    i18nStrategy,
    getLocale: (route?: RouteLocationNormalizedLoaded | RouteLocationResolvedGeneric) =>
      getEffectiveLocale(route, (r) => getCurrentLocale(r as unknown as ResolvedRouteLike)),
    getLocaleName: () => i18nStrategy.getCurrentLocaleName(router.currentRoute.value as unknown as ResolvedRouteLike, getCurrentLocale() ?? null),
    defaultLocale: () => i18nConfig.defaultLocale,
    getLocales: () => i18nConfig.locales || [],
    getRouteName: (route?: RouteLocationNormalizedLoaded | RouteLocationResolvedGeneric, _locale?: string) =>
      i18nStrategy.getRouteBaseName((route ?? router.currentRoute.value) as unknown as ResolvedRouteLike) ?? '',
    t: i18n.t.bind(i18n),
    ts: (key: TranslationKey, params?: Params, defaultValue?: string, route?: RouteLocationNormalizedLoaded): string => {
      const value = route ? i18n.t(key, params, defaultValue, route) : i18n.ts(key, params, defaultValue)
      return textOf(value) ?? defaultValue ?? key
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
      const switched = switchedLink(toLocale)
      if (typeof switched === 'string' || !i18nConfig.trailingSlash) return switched as RouteLocationRaw
      // the path alone: by name the router rebuilds the URL without the slash
      const fullPath = applyTrailingSlash(switchedPath(switched), i18nConfig.trailingSlash)
      return { path: urlPath(fullPath), fullPath, query: switched.query, hash: switched.hash } as RouteLocationRaw
    },
    clearCache: () => {
      void loader.reload()
    },
    switchLocalePath: (toLocale: string) => applyTrailingSlash(switchedPath(switchedLink(toLocale)), i18nConfig.trailingSlash),
    switchLocale: async (toLocale: string) => {
      if (!isValidLocale(toLocale)) {
        if (isDev) console.warn(`[i18n] Invalid locale '${toLocale}'`)
        return false
      }

      // no URL to move: the dictionary is the switch. After a failed switch the URL already says
      // `toLocale`, the navigation would be a no-op, and only the dictionary is left to retry.
      const urlless = isNoPrefix || i18nConfig.hashMode
      const retry = getCurrentLocale() === toLocale && i18n.getLocale() !== toLocale
      const route = router.currentRoute.value as unknown as ResolvedRouteLike
      const loaded = urlless || retry ? await loader.switchContext(toLocale, i18nStrategy.getPluginRouteName(route, toLocale)) : null
      // its chunk failed, or a newer switchLocale / navigation won: no setLocale, no navigation
      if (loaded === false) return false

      // Under no_prefix and hash mode the dictionary has already moved: the switch stands, whatever the navigation does.
      // A move to another host cannot be stopped, and no commit follows here. Otherwise only the state goes ahead, as
      // the client redirect reads it, and `settleSwitch` decides once the navigation has answered.
      if (urlless || hasProtocol(provide.switchLocalePath(toLocale))) setLocale(toLocale)
      else setLocaleState(toLocale)
      try {
        const failure = await switchLocaleLogic(toLocale, i18nRouteParams.value)
        if (!urlless) settleSwitch(toLocale, failure)
      } catch (error) {
        if (!urlless) setLocaleState(i18n.getLocale())
        throw error
      }
      return loaded ?? i18n.getLocale() === toLocale
    },
    switchRoute: async (route: RouteLocationNamedRaw | RouteLocationResolvedGeneric | string, toLocale?: string) => {
      return switchLocaleLogic(toLocale ?? getCurrentLocale(), i18nRouteParams.value, route)
    },
    localeRoute(to: RouteLocationNamedRaw | RouteLocationResolvedGeneric | string, locale?: string): RouteLocationResolved {
      return toRouteLocationResolved(isUrl(to) ? { path: to, fullPath: to } : localized(to, locale))
    },
    localePath(to: RouteLocationNamedRaw | RouteLocationResolvedGeneric | string, locale?: string): string {
      return isUrl(to) ? to : applyTrailingSlash(switchedPath(localized(to, locale)), i18nConfig.trailingSlash)
    },
    setI18nRouteParams: (value: I18nRouteParams) => {
      i18nRouteParams.value = value
      return i18nRouteParams.value
    },
    loadPageTranslations: i18n.loadPageTranslations.bind(i18n),
    setMissingHandler,
  }

  if (domains) {
    const { switchLocale } = provide
    // nothing to load or store here: the locale lives on another origin
    provide.switchLocale = async (code) => {
      if (isValidLocale(code) || !i18nConfig.linkLocales?.some((locale) => locale.code === code && !locale.disabled)) return switchLocale(code)
      await navigateTo(provide.switchLocalePath(code), { external: true })
      return true
    }
  }

  return { helper, provide }
}

export type NuxtI18nPluginApi = ReturnType<typeof createNuxtI18nPluginApi>
export type NuxtI18nPluginProvide = NuxtI18nPluginApi['provide']

/** The page's own translations: on the active locale, and again on each switch while the page lives. */
function createDefineI18nRoute({ getLocale, mergeTranslations }: Pick<NuxtI18nPluginProvide, 'getLocale' | 'mergeTranslations'>) {
  return async ({ locales }: DefineI18nRouteConfig) => {
    if (!locales || Array.isArray(locales)) return
    const apply = () => {
      const translations = locales[getLocale()]
      if (translations) mergeTranslations(translations)
    }
    apply()
    if (import.meta.client) watch(() => getLocale(), apply)
  }
}

export interface I18nProvideDeps {
  api: NuxtI18nPluginApi
  i18nConfig: ModuleOptionsExtend
  router: Router
  i18nRouteParams: { value: I18nRouteParams }
}

/**
 * What the plugin provides: each helper as `$name` on the app, and under both spellings in `useI18n()`.
 * `install` is apart so that the plugin's return type, which `NuxtApp` is made of, does not depend on `NuxtApp`.
 */
export function createI18nProvide({ api: { helper, provide }, i18nConfig, router, i18nRouteParams }: I18nProvideDeps) {
  // Read in a page's setup, and often called later from a handler that has no instance left: the function itself has
  // to know its page, so an abandoned page's late answer stays off the shown one, and a kept-alive page can give it again
  const { setI18nRouteParams, ...provided } = provide
  const pageRouteParams: PropertyDescriptor = {
    enumerable: true,
    get: (): typeof setI18nRouteParams => {
      const page = getCurrentInstance() && usePageRoute()
      if (!page) return setI18nRouteParams
      let own: I18nRouteParams | undefined
      onActivated(() => own && setI18nRouteParams(own))
      return (value) => {
        if (page.path !== router.currentRoute.value.path) return i18nRouteParams.value
        own = value
        return setI18nRouteParams(value)
      }
    },
  }

  const bound = { ...provided, helper, getI18nConfig: () => i18nConfig, __micro: true }
  const dollar = Object.fromEntries(Object.entries(bound).map(([key, value]) => [`$${key}`, value]))
  const spellings = Object.defineProperties({ ...bound, ...dollar }, { setI18nRouteParams: pageRouteParams, $setI18nRouteParams: pageRouteParams })
  const install = (nuxtApp: { vueApp: { config: { globalProperties: Record<string, unknown> } } }) => {
    Object.defineProperty(nuxtApp, '$setI18nRouteParams', pageRouteParams)
    nuxtApp.vueApp.config.globalProperties.$setI18nRouteParams = setI18nRouteParams
  }

  // on the app only: `useI18n()` does not list it
  const define = (defineRoute ? { defineI18nRoute: createDefineI18nRoute(provide) } : {}) as {
    defineI18nRoute: ReturnType<typeof createDefineI18nRoute>
  }
  return { provide: { ...bound, ...define, i18n: spellings }, install }
}
