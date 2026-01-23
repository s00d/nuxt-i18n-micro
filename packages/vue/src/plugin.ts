import type { App, Plugin } from 'vue'
import { VueI18n, type VueI18nOptions } from './composer'
import { I18nInjectionKey, I18nRouterKey, I18nLocalesKey, I18nDefaultLocaleKey } from './injection'
import { I18nT } from './components/i18n-t'
import { I18nLink } from './components/i18n-link'
import { I18nGroup } from './components/i18n-group'
import { I18nSwitcher } from './components/i18n-switcher'
import type { TranslationKey, Locale } from '@i18n-micro/types'
import type { I18nRoutingStrategy } from './router/types'
import type { RouteLocationNormalizedLoaded, RouteLocationResolvedGeneric } from 'vue-router'

export interface CreateI18nOptions extends VueI18nOptions {
  routingStrategy?: I18nRoutingStrategy
  /**
   * Array of locale configurations
   * If provided, will be automatically provided to the app via I18nLocalesKey
   */
  locales?: Locale[]
  /**
   * Default locale code
   * If provided, will be automatically provided to the app via I18nDefaultLocaleKey
   */
  defaultLocale?: string
}

export type I18nPlugin = Plugin & {
  global: VueI18n
  setRoutingStrategy: (strategy: I18nRoutingStrategy) => void
}

export function createI18n(options: CreateI18nOptions): I18nPlugin {
  const { routingStrategy, locales, defaultLocale, ...i18nOptions } = options
  const i18n = new VueI18n(i18nOptions)

  let currentApp: App | null = null
  let currentStrategy: I18nRoutingStrategy | null = routingStrategy || null

  const setRoutingStrategy = (strategy: I18nRoutingStrategy) => {
    currentStrategy = strategy
    if (currentApp) {
      currentApp.provide(I18nRouterKey, strategy)
    }
  }

  return {
    global: i18n, // Access to instance outside components
    setRoutingStrategy, // Method to set adapter after creation
    install(app: App) {
      currentApp = app
      // 1. Provide for useI18n
      app.provide(I18nInjectionKey, i18n)

      // 2. Provide routing strategy if provided
      if (currentStrategy) {
        app.provide(I18nRouterKey, currentStrategy)
      }

      // 3. Automatically provide locales and defaultLocale if provided in options
      // This improves DX by eliminating the need for manual provide calls
      if (locales) {
        app.provide(I18nLocalesKey, locales)
      }
      if (defaultLocale) {
        app.provide(I18nDefaultLocaleKey, defaultLocale)
      }

      // 4. Global properties ($t, $tc, etc.)
      // Note: In templates, these may be called with string literals, so we use TranslationKey type
      app.config.globalProperties.$t = (key: TranslationKey, params?: Record<string, string | number | boolean>, defaultValue?: string | null, routeName?: string) => {
        return i18n.t(key, params, defaultValue, routeName)
      }
      app.config.globalProperties.$ts = (key: TranslationKey, params?: Record<string, string | number | boolean>, defaultValue?: string, routeName?: string) => {
        return i18n.ts(key, params, defaultValue, routeName)
      }
      app.config.globalProperties.$tc = (key: TranslationKey, count: number | Record<string, string | number | boolean>, defaultValue?: string) => {
        return i18n.tc(key, count, defaultValue)
      }
      app.config.globalProperties.$tn = (value: number, options?: Intl.NumberFormatOptions) => {
        return i18n.tn(value, options)
      }
      app.config.globalProperties.$td = (value: Date | number | string, options?: Intl.DateTimeFormatOptions) => {
        return i18n.td(value, options)
      }
      app.config.globalProperties.$tdr = (value: Date | number | string, options?: Intl.RelativeTimeFormatOptions) => {
        return i18n.tdr(value, options)
      }
      app.config.globalProperties.$has = (key: TranslationKey, routeOrName?: string | RouteLocationNormalizedLoaded | RouteLocationResolvedGeneric) => {
        // If route object is passed, extract route name from it
        let routeName: string | undefined
        if (routeOrName && typeof routeOrName === 'object') {
          // Extract route name from route object (name can be string | symbol | undefined)
          const routeNameValue = routeOrName.name
          routeName = typeof routeNameValue === 'string' ? routeNameValue : undefined
        }
        else {
          routeName = routeOrName as string | undefined
        }
        return i18n.has(key, routeName)
      }
      // Provide access to i18n instance via $i18n
      // Using unknown and then casting to avoid any, but Vue's globalProperties requires flexibility
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      app.config.globalProperties.$i18n = i18n as any

      // 5. Register components
      app.component('I18nT', I18nT)
      app.component('I18nLink', I18nLink)
      app.component('I18nGroup', I18nGroup)
      app.component('I18nSwitcher', I18nSwitcher)
    },
  }
}
