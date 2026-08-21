import type { Locale, PluralFunc, Translations } from '@i18n-micro/types'
import { mergeRouteTranslationsWithRoot } from '@i18n-micro/utils/parse-path'
import { createI18n as createVueI18n, type I18nPlugin } from '@i18n-micro/vue'
import type { App, Ref } from 'vue'
import { createVitePressRouterAdapter, type PathMethods, type VitePressRouterAdapter, type VitePressRouterLike } from '../router/adapter'

export type { PathMethods }

export interface CreateI18nOptions {
  locale: string
  fallbackLocale?: string
  locales?: Locale[]
  defaultLocale?: string
  messages?: Record<string, Translations>
  /**
   * Page-scoped dictionaries keyed by route name (`guide-demo`), then locale.
   * Loaded from `locales/pages/**` when using `withI18n`.
   */
  routeMessages?: Record<string, Record<string, Translations>>
  plural?: PluralFunc
  missingWarn?: boolean
  missingHandler?: (locale: string, key: string, routeName: string) => void
  /**
   * Sync i18n locale from the VitePress URL path on every navigation.
   * @default true
   */
  syncWithVitePress?: boolean
  /**
   * Map VitePress locale keys to i18n codes (`root` → default locale code).
   */
  localeKeyToCode?: Record<string, string>
  /**
   * VitePress `site.base`. Needed so SSG paths (`withBase`) and lang switcher
   * do not treat the base segment as content / double-prefix links.
   */
  base?: string
}

export interface VitePressSiteDataLike {
  locales?: Record<string, { lang?: string; link?: string; label?: string }>
}

export type CreateI18nResult = I18nPlugin &
  PathMethods & {
    /** Same as `.global` (VueI18n + path methods). */
    i18n: I18nPlugin['global'] & PathMethods
    enhanceApp: (ctx: { app: App; router: VitePressRouterLike; siteData?: Ref<VitePressSiteDataLike> | VitePressSiteDataLike }) => void
  }

function applyRouteMessages(
  plugin: I18nPlugin,
  root: Record<string, Translations> | undefined,
  routeMessages: Record<string, Record<string, Translations>> | undefined,
): void {
  if (!routeMessages) return
  for (const [routeName, byLocale] of Object.entries(routeMessages)) {
    for (const [locale, translations] of Object.entries(byLocale)) {
      plugin.global.addRouteTranslations(locale, routeName, mergeRouteTranslationsWithRoot(root?.[locale], translations), false)
    }
  }
}

/**
 * Universal VitePress i18n: Vue plugin + path helpers + `enhanceApp` sync.
 * Path methods are the router adapter’s own functions (no wrapper layer).
 */
export function createI18n(options: CreateI18nOptions): CreateI18nResult {
  const defaultLocale = options.defaultLocale || options.locale
  const locales = options.locales ?? []
  const syncWithVitePress = options.syncWithVitePress !== false

  const plugin = createVueI18n({
    locale: options.locale,
    fallbackLocale: options.fallbackLocale ?? defaultLocale,
    messages: options.messages,
    plural: options.plural,
    missingWarn: options.missingWarn,
    missingHandler: options.missingHandler,
    locales,
    defaultLocale,
  })

  applyRouteMessages(plugin, options.messages, options.routeMessages)

  const paths = createVitePressRouterAdapter({
    locales,
    defaultLocale,
    localeKeyToCode: options.localeKeyToCode,
    base: options.base,
  })
  const pathMethods: PathMethods = {
    localizePath: paths.localizePath,
    switchLocalePath: paths.switchLocalePath,
    getLocaleFromPath: paths.getLocaleFromPath,
    removeLocaleFromPath: paths.removeLocaleFromPath,
    routeNameFromPath: paths.routeNameFromPath,
  }
  plugin.global.extend(pathMethods)

  const pageRouteNames = new Set(Object.keys(options.routeMessages ?? {}))

  const byApp = new WeakMap<
    object,
    {
      adapter: VitePressRouterAdapter
      boundSyncHandler: ((to: string) => unknown) | null
      chainedPrevious: ((to: string) => unknown) | undefined
    }
  >()

  const enhanceApp = (ctx: { app: App; router: VitePressRouterLike; siteData?: Ref<VitePressSiteDataLike> | VitePressSiteDataLike }) => {
    const { app, router } = ctx

    let state = byApp.get(app)
    if (!state) {
      const adapter = createVitePressRouterAdapter({
        locales,
        defaultLocale,
        localeKeyToCode: options.localeKeyToCode,
        base: options.base,
        getPath: () => {
          const route = router.route
          return `${route.path}${route.query || ''}${route.hash || ''}`
        },
        go: (href, navOptions) => router.go(href, navOptions),
      })

      app.use(plugin)
      plugin.setRoutingStrategy(adapter)
      state = { adapter, boundSyncHandler: null, chainedPrevious: undefined }
      byApp.set(app, state)
    }

    if (!syncWithVitePress) return

    const { adapter } = state
    const sync = (path = router.route.path) => {
      const nextLocale = adapter.getLocaleFromPath(path)
      if (plugin.global.getLocale() !== nextLocale) {
        plugin.global.locale = nextLocale
      }
      const derived = adapter.routeNameFromPath(path)
      plugin.global.setRoute(pageRouteNames.has(derived) ? derived : 'index')
    }

    sync()

    const current = router.onAfterRouteChange
    if (current !== state.boundSyncHandler) {
      state.chainedPrevious = typeof current === 'function' ? current : undefined
    }
    state.boundSyncHandler = async (to: string) => {
      if (typeof state.chainedPrevious === 'function') {
        await state.chainedPrevious(to)
      }
      const path = to.startsWith('http')
        ? (() => {
            const url = new URL(to)
            return url.pathname + url.search + url.hash
          })()
        : to
      sync(path)
    }
    router.onAfterRouteChange = state.boundSyncHandler
  }

  return Object.assign(plugin, pathMethods, {
    get i18n() {
      return plugin.global as I18nPlugin['global'] & PathMethods
    },
    enhanceApp,
  }) as CreateI18nResult
}
