import type { Locale, PluralFunc, Translations } from '@i18n-micro/types'
import { mergeRouteTranslationsWithRoot } from '@i18n-micro/utils/parse-path'
import { createI18n, type I18nPlugin } from '@i18n-micro/vue'
import type { App, Ref } from 'vue'
import {
  createVitePressRouterAdapter,
  routeNameFromPath,
  type VitePressRouterAdapter,
  type VitePressRouterLike,
} from './router/adapter'

export interface VitePressI18nOptions {
  locale: string
  fallbackLocale?: string
  locales?: Locale[]
  defaultLocale?: string
  messages?: Record<string, Translations>
  /**
   * Page-scoped dictionaries keyed by route name (`guide-demo`), then locale.
   * Loaded from `locales/pages/**` when using `withI18nMicro`.
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
}

export interface VitePressSiteDataLike {
  locales?: Record<string, { lang?: string, link?: string, label?: string }>
}

export interface CreateVitePressI18nResult {
  i18n: I18nPlugin['global']
  plugin: I18nPlugin
  adapter: VitePressRouterAdapter | null
  enhanceApp: (ctx: {
    app: App
    router: VitePressRouterLike
    siteData?: Ref<VitePressSiteDataLike> | VitePressSiteDataLike
  }) => void
}

function resolveDefaultLocale(options: VitePressI18nOptions): string {
  return options.defaultLocale || options.locale
}

function applyRouteMessages(
  plugin: I18nPlugin,
  root: Record<string, Translations> | undefined,
  routeMessages: Record<string, Record<string, Translations>> | undefined,
): void {
  if (!routeMessages) return
  for (const [routeName, byLocale] of Object.entries(routeMessages)) {
    for (const [locale, translations] of Object.entries(byLocale)) {
      plugin.global.addRouteTranslations(
        locale,
        routeName,
        mergeRouteTranslationsWithRoot(root?.[locale], translations),
        false,
      )
    }
  }
}

/**
 * Create VitePress i18n runtime: Vue plugin + path sync + optional router adapter.
 */
export function createVitePressI18n(options: VitePressI18nOptions): CreateVitePressI18nResult {
  const defaultLocale = resolveDefaultLocale(options)
  const locales = options.locales ?? []
  const syncWithVitePress = options.syncWithVitePress !== false

  const plugin = createI18n({
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

  let adapter: VitePressRouterAdapter | null = null
  let installed = false
  let boundSyncHandler: ((to: string) => unknown) | null = null
  let chainedPrevious: ((to: string) => unknown) | undefined

  const enhanceApp = (ctx: {
    app: App
    router: VitePressRouterLike
    siteData?: Ref<VitePressSiteDataLike> | VitePressSiteDataLike
  }) => {
    const { app, router } = ctx

    if (!installed) {
      adapter = createVitePressRouterAdapter({
        locales,
        defaultLocale,
        localeKeyToCode: options.localeKeyToCode,
        getPath: () => {
          const route = router.route
          return `${route.path}${route.query || ''}${route.hash || ''}`
        },
        go: (href, navOptions) => router.go(href, navOptions),
      })

      plugin.setRoutingStrategy(adapter)
      app.use(plugin)
      installed = true
    }

    if (!syncWithVitePress || !adapter) return

    const sync = (path = router.route.path) => {
      if (!adapter) return
      const nextLocale = adapter.getLocaleFromPath(path)
      if (plugin.global.getLocale() !== nextLocale) {
        plugin.global.locale = nextLocale
      }
      plugin.global.setRoute(
        routeNameFromPath(path, adapter.localeCodes, defaultLocale, options.localeKeyToCode),
      )
    }

    sync()

    // Stay outermost: if base/user enhanceApp overwrote the hook, re-wrap on a later call.
    const current = router.onAfterRouteChange
    if (current !== boundSyncHandler) {
      chainedPrevious = typeof current === 'function' ? current : undefined
    }
    boundSyncHandler = async (to: string) => {
      if (typeof chainedPrevious === 'function') {
        await chainedPrevious(to)
      }
      const path = to.startsWith('http')
        ? (() => {
          const url = new URL(to)
          return url.pathname + url.search + url.hash
        })()
        : to
      sync(path)
    }
    router.onAfterRouteChange = boundSyncHandler
  }

  return {
    i18n: plugin.global,
    plugin,
    get adapter() {
      return adapter
    },
    enhanceApp,
  }
}
