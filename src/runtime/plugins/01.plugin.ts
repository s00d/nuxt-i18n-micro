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
  TranslationKey,
} from '@i18n-micro/types'

import { detectLocaleFromAcceptLanguage } from '@i18n-micro/utils/accept-language'
import type {
  RouteLocationNamedRaw,
  RouteLocationNormalizedLoaded,
  RouteLocationRaw,
  RouteLocationResolved,
  RouteLocationResolvedGeneric,
} from 'vue-router'
import { shallowRef } from 'vue'
import { useState } from '#app'
import { plural } from '#build/i18n.plural.mjs'
import { createI18nStrategy, domains } from '#build/i18n.strategy.mjs'
import { createError, defineNuxtPlugin, navigateTo, useHead, useRouter, useRuntimeConfig } from '#imports'
import { useI18nHead } from '../composables/useI18nHead'
import { useI18nLocale } from '../composables/useI18nLocale'
import { useResolvedI18nConfig } from '../utils/i18n-config'
import { createNuxtI18nPluginApi, NuxtI18n, NuxtTranslationLoader, type TranslationFn } from '../utils/nuxt-i18n'

export type { TranslationFn }
import { setI18nDevtoolsBridge } from '../devtools/bridge'
import { translationStorage } from '../utils/storage'

const isDev = process.env.NODE_ENV !== 'production'

// Object form: `name` is what `dependsOn: ['i18n-plugin-loader']` (05, 06, 04 and apps) waits for at
// runtime — the function form has no runtime name, so every dependsOn on it was inert.
export default defineNuxtPlugin({
  name: 'i18n-plugin-loader',
  async setup(nuxtApp) {
    const router = useRouter()
    const runtimeConfig = useRuntimeConfig()
    const i18nConfig: ModuleOptionsExtend = useResolvedI18nConfig(nuxtApp)
    // routing follows the runtime overrides too (defaultLocale, disabledLocales)
    const i18nStrategy = createI18nStrategy(router, i18nConfig)

    translationStorage.configure({
      // the SSR copy is process-wide, so it is bounded like the payload cache (DEFAULT_SERVER_CACHE_SIZE)
      maxSize: i18nConfig.cacheMaxSize || (import.meta.server ? 1000 : 0),
      ttl: i18nConfig.cacheTtl ?? 0,
    })

    const {
      locale: localeState,
      setLocale,
      getPreferredLocale,
      getEffectiveLocale,
      resolveInitialLocale,
      isValidLocale,
      validLocales,
    } = useI18nLocale()

    const i18nRouteParams = useState<I18nRouteParams>('i18n-route-params', () => ({}))
    const { resetPageHead } = useI18nHead()
    // Not useState: a function in the SSR payload makes devalue throw. Still a ref: `t` reads it
    // while rendering, so setting a handler re-renders the missing keys through it.
    const customMissingHandler = shallowRef<MissingHandler | null>(null)

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
      // a stored preference only when it is an enabled locale (a stale or malformed cookie is none)
      return i18nStrategy.getCurrentLocale(r, getPreferredLocale())
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

    // The leaving page's keys stay resolvable until it is gone. NuxtPage sets this promise when a
    // page transition (prop, page meta or app config) runs and resolves it when the old page has
    // left — the same signal Nuxt's head waits on. No transition: the new page has rendered.
    nuxtApp.hook('page:finish', () => {
      const leaving = (nuxtApp as { '~transitionPromise'?: Promise<void> })['~transitionPromise']
      const outgoing = i18n.outgoing
      if (leaving) void leaving.finally(() => i18n.finishTransition(outgoing))
      else i18n.finishTransition()
    })

    const loadOptions = {
      apiBaseUrl: i18nConfig.apiBaseUrl ?? '_locales',
      baseURL: runtimeConfig.app.baseURL,
      apiBaseClientHost: i18nConfig.apiBaseClientHost,
      dateBuild: i18nConfig.dateBuild,
      routesLocaleLinks: i18nConfig.routesLocaleLinks,
      serverLoad: import.meta.server ? nuxtApp.ssrContext?.event?.context?.i18n?.load : undefined,
    }

    // Same as @nuxtjs/i18n with preload:false — dictionaries stay off the HTML payload.
    // Server loads into memory for SSR; client loads via /_locales in switchContext below.
    const loader = new NuxtTranslationLoader({
      i18n,
      loadOptions,
      isDev,
    })

    // hash + prefix renders `/` in the browser, so no server read Accept-Language: the browser's list stands in
    const shellLocale = () => {
      const shell = i18nConfig.hashMode && i18nConfig.strategy === 'prefix' && !nuxtApp.payload.serverRendered
      if (!shell || !i18nConfig.autoDetectLanguage || getPreferredLocale()) return undefined
      return detectLocaleFromAcceptLanguage(navigator.languages.join(','), validLocales)
    }

    // a locale in the URL wins over a server-detected one (e.g. `?locale=`); a URL without one (no_prefix,
    // hashMode, an unprefixed or unlocalized page, a runtime defaultLocale on `/`) takes the server's.
    // Under no_prefix the URL's record has the last word: a custom path is its locale's page.
    const requestLocale = import.meta.server ? nuxtApp.ssrContext?.event?.context?.i18n?.locale : shellLocale()
    const preferredLocale = isValidLocale(localeState.value) ? localeState.value : (requestLocale ?? getPreferredLocale())
    const initialRoute = router.currentRoute.value as unknown as ResolvedRouteLike
    const urlLocale = i18nConfig.hashMode
      ? null
      : isNoPrefixStrategy(i18nConfig.strategy!)
        ? i18nStrategy.getCurrentLocale(initialRoute, preferredLocale)
        : i18nStrategy.getLocaleFromPath(initialRoute.path)
    const serverLocale = urlLocale ? undefined : requestLocale
    const initialLocale = resolveInitialLocale({
      route: router.currentRoute.value,
      urlLocale,
      serverLocale,
      preference: isNoPrefixStrategy(i18nConfig.strategy!) ? (preferredLocale ?? i18nConfig.defaultLocale) : undefined,
      getLocaleFromRoute: (r) => getCurrentLocale(r as unknown as ResolvedRouteLike),
    })
    const initialRouteName = getPluginRouteName(router.currentRoute.value as unknown as ResolvedRouteLike, initialLocale)

    // `serverTranslationPreload` loads index in Nitro middleware — reuse it when the
    // first page is index so we do not load the same chunk twice on SSR.
    // Only for the locale it was detected for: under no_prefix a custom path renders another one.
    if (import.meta.server && initialRouteName === 'index' && initialLocale === requestLocale) {
      const preloaded = nuxtApp.ssrContext?.event?.context?.i18n?.translations
      if (preloaded && typeof preloaded === 'object' && Object.keys(preloaded).length > 0) {
        translationStorage.seed(initialLocale, 'index', preloaded as Record<string, unknown>)
      }
    }

    try {
      await loader.switchContext(initialLocale, initialRouteName)
    } catch (e) {
      if (isDev) console.error('[i18n] Initial load error:', e)
      throw createError({ statusCode: 404, statusMessage: 'Page Not Found' })
    }

    // The client fetches this chunk while hydrating (dictionaries stay off the payload): let the
    // browser start it with the HTML instead of after the scripts. `crossorigin`: fetch()'s mode.
    if (import.meta.server) {
      const href = translationStorage.clientUrl(initialLocale, initialRouteName, loadOptions)
      useHead({ link: [{ key: 'i18n-preload', rel: 'preload', as: 'fetch', crossorigin: 'anonymous', href }] })
    }

    const getRouteName = (route?: RouteLocationNormalizedLoaded | RouteLocationResolvedGeneric, locale?: string) => {
      const selectedRoute = route ?? router.currentRoute.value
      const selectedLocale = locale ?? getCurrentLocale(selectedRoute as unknown as ResolvedRouteLike)
      return i18nStrategy.getRouteBaseName(selectedRoute as unknown as ResolvedRouteLike, selectedLocale) ?? ''
    }

    const hydrated = shallowRef(false)
    nuxtApp.hooks.hookOnce('app:suspense:resolve', () => {
      hydrated.value = true
    })

    const {
      helper,
      switchContext,
      provide: provideApi,
    } = createNuxtI18nPluginApi({
      i18n,
      loader,
      i18nStrategy,
      // $getLocales lists the locales of other domains too: link targets
      i18nConfig: domains ? { ...i18nConfig, locales: i18nConfig.linkLocales ?? i18nConfig.locales } : i18nConfig,
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
      // a ref: a link rendered without the hash gets it back when hydration ends
      isHydrating: () => !hydrated.value && nuxtApp.isHydrating === true,
    })

    if (domains) {
      const { switchLocale } = provideApi
      // nothing to load or store here: the locale lives on another origin
      provideApi.switchLocale = async (code) => {
        if (isValidLocale(code) || !i18nConfig.linkLocales?.some((locale) => locale.code === code && !locale.disabled)) return switchLocale(code)
        await navigateTo(provideApi.switchLocalePath(code), { external: true })
        return true
      }
    }

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
        const hashLocale = i18nConfig.hashMode ? i18nStrategy.getLocaleFromPath(to.path) : null
        const targetLocale = hashLocale || getEffectiveLocale(to, (r) => getCurrentLocale(r as unknown as ResolvedRouteLike))
        const targetRouteName = getPluginRouteName(to as unknown as ResolvedRouteLike, targetLocale)

        let applied = true
        if (targetLocale !== i18n.getCurrentLocale() || targetRouteName !== i18n.getCurrentRouteName()) {
          applied = await switchContext(targetLocale, targetRouteName)
        } else {
          // Same applied context — still cancel any in-flight load from a prior navigation
          // that had not yet called applySwitchContext (generation would otherwise stay valid).
          loader.invalidatePendingSwitches()
        }

        // under no_prefix a page can be bound to its locale: it shows it, and the preference stays for the next page
        const bound = isNoPrefixStrategy(i18nConfig.strategy!) && targetLocale !== (getPreferredLocale() ?? i18nConfig.defaultLocale)
        if (applied && !bound && targetLocale && isValidLocale(targetLocale) && localeState.value !== targetLocale) {
          setLocale(targetLocale)
        }
      } catch (e) {
        if (isDev) console.error('[i18n] Navigation error:', e)
      }
      return
    })

    // The server never sees the hash, so a locale in it (`/#/de`, what `$switchLocale` writes) applies
    // once hydrated: earlier, the client would render another locale than the server's HTML.
    if (import.meta.client && i18nConfig.hashMode) {
      nuxtApp.hooks.hookOnce('app:suspense:resolve', async () => {
        const hashLocale = i18nStrategy.getLocaleFromPath(router.currentRoute.value.path)
        if (hashLocale && hashLocale !== localeState.value) await provideApi.switchLocale(hashLocale)
      })
    }

    const provideData = {
      ...provideApi,
      helper,
      getI18nConfig: () => i18nConfig,
      i18n: undefined as unknown,
      __micro: true,
    }

    const $provideData = Object.fromEntries(Object.entries(provideData).map(([key, value]) => [`$${key}`, value]))

    ;(provideData as { i18n: typeof provideData & Record<string, unknown> }).i18n = { ...provideData, ...$provideData }

    return { provide: provideData }
  },
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
  $getRouteName: (route?: RouteLocationNormalizedLoaded | RouteLocationResolvedGeneric, locale?: string) => string
  /**
   * Translate a key, interpolating `params` into it. Returns `defaultValue` when the key is
   * missing, or the key itself when no default is given.
   */
  $t: TranslationFn<CleanTranslation>
  /**
   * Bind `$t` to a specific route, for translating outside the current page — a layout rendering
   * a link to another route, for example.
   */
  $_t: (route: RouteLocationNormalizedLoaded) => TranslationFn<CleanTranslation>
  /**
   * Like `$t`, but always returns a string: the value goes through `toString()`, so a nested
   * object becomes `'[object Object]'`. Point the key at a leaf.
   */
  $ts: TranslationFn<string>
  /** Bind `$ts` to a specific route. See `$_t`. */
  $_ts: (route: RouteLocationNormalizedLoaded) => TranslationFn<string>
  /**
   * Translate with pluralization. `params` may be the count itself, or an object containing
   * `count`.
   */
  $tc: (key: TranslationKey, params: number | Params, defaultValue?: string) => string
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
   * rendering a raw key. Like `$t`, it also sees the leaving page's keys during a same-locale
   * page transition.
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
  /**
   * The route object for the current page in another locale, without navigating, or a URL string
   * for a locale on its own `baseUrl`. Under `trailingSlash` the object's `path` and `fullPath`
   * follow the rule, and `router.push` or a link keep them.
   */
  $switchLocaleRoute: (locale: string) => RouteLocationRaw
  /** The path of the current page in another locale, without navigating. */
  $switchLocalePath: (locale: string) => string
  /**
   * Navigate to the current page in another locale. Under `no_prefix` and hash mode it loads the
   * locale's translations before navigating; under `no_prefix` the route is replaced in place (no
   * new history entry). An unknown locale is ignored.
   * The call is async: `await` it to run code after the navigation. It resolves `true` when the
   * locale's dictionary is active, `false` when it is not: the chunk failed to load (the current
   * dictionary stays; call it again to retry) or a newer switch won.
   */
  $switchLocale: (locale: string) => Promise<boolean>
  /**
   * Navigate to another route, keeping the active locale or switching to `toLocale`. Async like
   * `$switchLocale`.
   */
  $switchRoute: (route: RouteLocationNamedRaw | RouteLocationResolvedGeneric | string, toLocale?: string) => Promise<void>
  /** Resolve a route in the given locale, or the active one. */
  $localeRoute: (to: RouteLocationNamedRaw | RouteLocationResolvedGeneric | string, locale?: string) => RouteLocationResolved
  /**
   * Resolve a path in the given locale, or the active one. A string with an `http(s):`, `mailto:`
   * or `tel:` scheme comes back as is: do not pass user input as a link target unchecked.
   */
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
  /**
   * Drop every cached translation chunk and reload the current page's dictionary. The page
   * keeps showing its current translations until the fresh ones arrive. Dev HMR calls it on
   * every translation file change.
   */
  $clearCache: () => void
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
}
