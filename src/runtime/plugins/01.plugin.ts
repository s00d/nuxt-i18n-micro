import { escapeHtml, isNoPrefixStrategy, localeIsoMap } from '@i18n-micro/core'
import type { PathStrategy, ResolvedRouteLike } from '@i18n-micro/path-strategy'
import type {
  CleanTranslation,
  DefineI18nRouteConfig,
  I18nHeadInput,
  I18nRouteParams,
  Locale,
  MissingHandler,
  ModuleOptionsExtend,
  Params,
  PluralFunc,
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
import { hasProtocol } from 'ufo'
import { type Ref, type ShallowRef, shallowRef } from 'vue'
import { useState } from '#app/composables/state'
import type { NuxtApp } from '#app/nuxt'
import { plural } from '#build/i18n.plural.mjs'
import { createI18nStrategy, domains } from '#build/i18n.strategy.mjs'
// Every plugin and middleware default export is typed through `nuxt/dist/app`, which a declaration cannot name (TS2883,
// an empty `.d.ts`). `nuxt/app` is its public name: one import of it in the build is what tells the emit.
import type {} from 'nuxt/app'
import { createError, defineNuxtPlugin, injectHead, navigateTo, useHead, useRouter, useRuntimeConfig } from '#imports'
import { usePageHead } from '../utils/page-head'
import { useI18nLocale } from '../composables/useI18nLocale'
import { createI18nProvide, createNuxtI18nPluginApi, type NuxtI18nPluginProvide } from '../utils/i18n-api'
import { useResolvedI18nConfig } from '../utils/i18n-config'
import { setupI18nNavigation } from '../utils/i18n-navigation'
import { formatterFor, NuxtI18n, NuxtTranslationLoader, type TranslationFn } from '../utils/nuxt-i18n'
import { ServerNuxtI18n } from '../utils/nuxt-i18n-server'

export type { TranslationFn }
import { setI18nDevtoolsBridge } from '../devtools/bridge'
import { type LoadOptions, translationStorage } from '../utils/storage'

const isDev = process.env.NODE_ENV !== 'production'

/** The link of `<i18n-switcher>`, by its own class: no other link in the page is the switcher's to change. */
const SWITCHER_LINK = /class="switcher-locale-([^"]+)" href="[^"]*"/g

/** The server keeps one instance per request, whose patches stay off the process's shared chunks. */
function createI18n(i18nConfig: ModuleOptionsExtend, missingHandler: ShallowRef<MissingHandler | null>) {
  return new (import.meta.server ? ServerNuxtI18n : NuxtI18n)({
    plural,
    missingWarn: i18nConfig.missingWarn ?? true,
    cacheMaxSize: i18nConfig.cacheMaxSize ?? 0,
    getCustomMissingHandler: () => missingHandler.value,
    formatter: import.meta.server ? formatterFor(i18nConfig) : undefined,
    numberFormats: i18nConfig.numberFormats,
    datetimeFormats: i18nConfig.datetimeFormats,
    timeZone: i18nConfig.timeZone,
    localeIso: localeIsoMap(i18nConfig.linkLocales ?? i18nConfig.locales ?? []),
  })
}

function createLoadOptions(nuxtApp: NuxtApp, i18nConfig: ModuleOptionsExtend): LoadOptions {
  const options: LoadOptions = {
    apiBaseUrl: i18nConfig.apiBaseUrl ?? '_locales',
    baseURL: useRuntimeConfig().app.baseURL,
    apiBaseClientHost: i18nConfig.apiBaseClientHost,
    dateBuild: i18nConfig.dateBuild,
    routesLocaleLinks: i18nConfig.routesLocaleLinks,
  }
  if (import.meta.server) options.serverLoad = nuxtApp.ssrContext?.event?.context?.i18n?.load
  return options
}

interface StartLocaleDeps {
  nuxtApp: NuxtApp
  i18nConfig: ModuleOptionsExtend
  i18nStrategy: PathStrategy
  noPrefix: boolean
  renderLocale: string | undefined
  initialRoute: ResolvedRouteLike
  locale: ReturnType<typeof useI18nLocale>
  getCurrentLocale: (route?: ResolvedRouteLike) => string
}

/** The first page's locale, and what the request said it should be. */
function resolveStartLocale({ nuxtApp, i18nConfig, i18nStrategy, noPrefix, renderLocale, initialRoute, locale, getCurrentLocale }: StartLocaleDeps) {
  const { locale: localeState, getPreferredLocale, resolveInitialLocale, isValidLocale, validLocales } = locale

  // hash + prefix renders `/` in the browser, so no server read Accept-Language: the browser's list stands in
  const shellLocale = () => {
    const shell = i18nConfig.hashMode && i18nConfig.strategy === 'prefix' && !nuxtApp.payload.serverRendered
    if (!shell || !i18nConfig.autoDetectLanguage || getPreferredLocale()) return undefined
    return detectLocaleFromAcceptLanguage(navigator.languages.join(','), validLocales)
  }

  // a locale in the URL wins over a server-detected one (e.g. `?locale=`); a URL without one (no_prefix,
  // hashMode, an unprefixed or unlocalized page, a runtime defaultLocale on `/`) takes the server's.
  // Under no_prefix the URL's record has the last word: a custom path is its locale's page.
  const serverRequestLocale = () => renderLocale ?? nuxtApp.ssrContext?.event?.context?.i18n?.locale
  const requestLocale = import.meta.server ? serverRequestLocale() : shellLocale()
  const preferredLocale = isValidLocale(localeState.value) ? localeState.value : (requestLocale ?? getPreferredLocale())
  const pathLocale = () =>
    noPrefix ? i18nStrategy.getCurrentLocale(initialRoute, preferredLocale) : i18nStrategy.getLocaleFromPath(initialRoute.path)
  const initialLocale = resolveInitialLocale({
    route: initialRoute,
    urlLocale: i18nConfig.hashMode ? null : pathLocale(),
    serverLocale: requestLocale,
    preference: noPrefix ? (preferredLocale ?? i18nConfig.defaultLocale) : undefined,
    getLocaleFromRoute: (r) => getCurrentLocale(r as unknown as ResolvedRouteLike),
  })
  return { initialLocale, requestLocale }
}

/**
 * A layout's switcher renders before the page's async setup reaches `$setI18nRouteParams`, and Vue cannot wait for
 * it. By now every answer is known: its links get what the client's first render builds from the params in the
 * payload. Only those: a replacer, as a slug can come from the URL and `$&` means nothing here, and an escaped value,
 * as this is an attribute. Pages with params and a switcher only.
 */
function rewriteSwitcherLinks(nuxtApp: NuxtApp, api: NuxtI18nPluginProvide, params: Ref<I18nRouteParams>, resolveHref: (path: string) => string) {
  nuxtApp.hooks.hook('app:rendered', ({ renderResult }) => {
    if (!Object.keys(params.value ?? {}).length || !renderResult?.html?.includes('class="switcher-locale-')) return
    const codes = new Set(api.getLocales().map((locale) => locale.code))
    renderResult.html = renderResult.html.replace(SWITCHER_LINK, (link, code: string) => {
      if (!codes.has(code)) return link
      const path = api.switchLocalePath(code)
      return `class="switcher-locale-${code}" href="${escapeHtml(hasProtocol(path) ? path : resolveHref(path))}"`
    })
  })
}

/**
 * Drops the page head when the page goes. Unhead adopts the server's tags in its first render, from what it resolves
 * then: a page head dropped earlier would leave its tags in the DOM with no owner, so during hydration it goes right after.
 */
function createPageHeadDrop(pageHead: Ref<I18nHeadInput | null>) {
  let headAdopted = import.meta.server
  let headToDrop: I18nHeadInput | null = null
  if (import.meta.client) {
    const stop = injectHead().hooks?.hook('dom:rendered', () => {
      stop?.()
      headAdopted = true
      if (pageHead.value === headToDrop) pageHead.value = null
    })
  }
  return () => {
    if (headAdopted) pageHead.value = null
    else headToDrop = pageHead.value
  }
}

// Object form: `name` is what `dependsOn: ['i18n-plugin-loader']` (06, 04 and apps) waits for at
// runtime — the function form has no runtime name, so every dependsOn on it was inert.
export default defineNuxtPlugin({
  name: 'i18n-plugin-loader',
  async setup(nuxtApp) {
    const router = useRouter()
    const i18nConfig: ModuleOptionsExtend = useResolvedI18nConfig(nuxtApp)
    // routing follows the runtime overrides too (defaultLocale, disabledLocales)
    const i18nStrategy = createI18nStrategy(router, i18nConfig)
    const noPrefix = isNoPrefixStrategy(i18nConfig.strategy!)

    translationStorage.configure({
      // the SSR copy is process-wide, so it is bounded like the payload cache (DEFAULT_SERVER_CACHE_SIZE)
      maxSize: i18nConfig.cacheMaxSize || (import.meta.server ? 1000 : 0),
      ttl: i18nConfig.cacheTtl ?? 0,
    })

    const locale = useI18nLocale()
    const { locale: localeState, setLocale, getPreferredLocale, getEffectiveLocale, isValidLocale } = locale
    const i18nRouteParams = useState<I18nRouteParams>('i18n-route-params', () => ({}))
    const pageHead = usePageHead()
    // Not useState: a function in the SSR payload makes devalue throw. Still a ref: `t` reads it
    // while rendering, so setting a handler re-renders the missing keys through it.
    const customMissingHandler = shallowRef<MissingHandler | null>(null)
    const i18n = createI18n(i18nConfig, customMissingHandler)

    // An island is rendered from its own URL, with no page behind it: Nuxt passes it props and nothing else, so its
    // `locale` prop is the page's. Without one it falls back to the cookie and the default (docs: server components).
    const islandLocale = nuxtApp.ssrContext?.islandContext?.props?.locale as string | undefined
    const renderLocale = isValidLocale(islandLocale) ? islandLocale : undefined

    const getCurrentLocale = (route?: ResolvedRouteLike): string => {
      if (!route && renderLocale) return renderLocale
      const r = route ?? (router.currentRoute.value as unknown as ResolvedRouteLike)
      // a stored preference only when it is an enabled locale (a stale or malformed cookie is none)
      return i18nStrategy.getCurrentLocale(r, getPreferredLocale())
    }
    const getPluginRouteName = (route: ResolvedRouteLike, code: string) => i18nStrategy.getPluginRouteName(route, code)
    const getRouteName = (route?: RouteLocationNormalizedLoaded | RouteLocationResolvedGeneric) =>
      i18nStrategy.getRouteBaseName((route ?? router.currentRoute.value) as unknown as ResolvedRouteLike) ?? ''

    i18n.setRouteContextResolver((route) => {
      const resolvedRoute = (route ?? router.currentRoute.value) as unknown as ResolvedRouteLike
      const routeLocale = getCurrentLocale(resolvedRoute)
      return { locale: routeLocale, routeName: getPluginRouteName(resolvedRoute, routeLocale) }
    })

    // Same as @nuxtjs/i18n with preload:false — dictionaries stay off the HTML payload.
    // Server loads into memory for SSR; client loads via /_locales in switchContext below.
    const prerender = import.meta.server && import.meta.prerender
    const loadOptions = createLoadOptions(nuxtApp, i18nConfig)
    const loader = new NuxtTranslationLoader({ i18n, loadOptions, isDev, prerender })

    const initialRoute = router.currentRoute.value as unknown as ResolvedRouteLike
    const { initialLocale, requestLocale } = resolveStartLocale({
      nuxtApp,
      i18nConfig,
      i18nStrategy,
      noPrefix,
      renderLocale,
      initialRoute,
      locale,
      getCurrentLocale,
    })
    const initialRouteName = getPluginRouteName(initialRoute, initialLocale)

    // `serverTranslationPreload` loads index in Nitro middleware — reuse it when the
    // first page is index so we do not load the same chunk twice on SSR.
    // Only for the locale it was detected for: under no_prefix a custom path renders another one.
    if (import.meta.server && initialRouteName === 'index' && initialLocale === requestLocale) {
      const preloaded = nuxtApp.ssrContext?.event?.context?.i18n?.translations
      if (preloaded) translationStorage.seed(initialLocale, 'index', preloaded as Record<string, unknown>)
    }

    try {
      await loader.switchContext(initialLocale, initialRouteName)
    } catch (e) {
      if (isDev) console.error('[i18n] Initial load error:', e)
      if (prerender) throw e
      throw createError({ statusCode: 404, statusMessage: 'Page Not Found' })
    }

    // The client fetches this chunk while hydrating (dictionaries stay off the payload): let the
    // browser start it with the HTML instead of after the scripts. `crossorigin`: fetch()'s mode.
    if (import.meta.server) {
      const href = translationStorage.clientUrl(initialLocale, initialRouteName, loadOptions)
      useHead({ link: [{ key: 'i18n-preload', rel: 'preload', as: 'fetch', crossorigin: 'anonymous', href }] })
    }

    const hydrated = shallowRef(false)
    nuxtApp.hooks.hookOnce('app:suspense:resolve', async () => {
      hydrated.value = true
      if (!import.meta.client || !i18nConfig.hashMode) return
      // The server never sees the hash, so a locale in it (`/#/de`, what `$switchLocale` writes) applies
      // once hydrated: earlier, the client would render another locale than the server's HTML.
      const hashLocale = i18nStrategy.getLocaleFromPath(router.currentRoute.value.path)
      if (hashLocale && hashLocale !== localeState.value) await api.provide.switchLocale(hashLocale)
    })

    const api = createNuxtI18nPluginApi({
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
      setLocaleState: (code) => {
        localeState.value = code
      },
      isValidLocale,
      navigateTo,
      setMissingHandler: (handler) => {
        customMissingHandler.value = handler
      },
      // a ref: a link rendered without the hash gets it back when hydration ends
      isHydrating: () => !hydrated.value && nuxtApp.isHydrating === true,
    })

    if (import.meta.server) rewriteSwitcherLinks(nuxtApp, api.provide, i18nRouteParams, (path) => router.resolve(path).href)

    if (import.meta.dev && import.meta.client) {
      setI18nDevtoolsBridge({
        i18n,
        i18nConfig,
        localeState,
      })
    }

    const dropPageHead = createPageHeadDrop(pageHead)
    setupI18nNavigation({
      nuxtApp,
      router,
      i18n,
      loader,
      i18nConfig,
      i18nStrategy,
      noPrefix,
      locale,
      api,
      leavePage: () => {
        i18nRouteParams.value = {}
        dropPageHead()
      },
    })

    const { provide, install } = createI18nProvide({ api, i18nConfig, router, i18nRouteParams })
    install(nuxtApp)
    return { provide }
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
  /** The plural rule `$tc` uses: `<i18n-t>` asks for it to pick a form from the raw translation. */
  $pluralFunc: PluralFunc
  /** The tag `$tc` plurals by: the locale's `iso` when it has one, else its code. */
  $pluralLocale: () => string
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
   * for a locale on its own `baseUrl`. Under `trailingSlash` the object has `path` and `fullPath`,
   * following the rule, with the `query` and `hash` as they are, and `router.push` or a link keep them.
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
  /**
   * Resolve a route in the given locale, or the active one. A plain object, safe to keep in state. When a param needs
   * escaping it has `path`, `fullPath`, `query` and `hash` but no `name` or `params`: the path is what gives the router
   * the encoded URL. For a locale on another domain `path` and `fullPath` are absolute, which the router cannot take:
   * such a link goes through `<i18n-link>`, or `$localePath`.
   */
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
