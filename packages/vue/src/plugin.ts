import type { Locale, TranslationKey } from '@i18n-micro/types'
import type { App, Plugin } from 'vue'
import { I18nGroup } from './components/i18n-group'
import { I18nLink } from './components/i18n-link'
import { I18nSwitcher } from './components/i18n-switcher'
import { I18nT } from './components/i18n-t'
import { VueI18n, type VueI18nOptions } from './composer'
import { I18nDefaultLocaleKey, I18nInjectionKey, I18nLocalesKey, I18nRouterKey } from './injection'
import type { I18nRoutingStrategy } from './router/types'

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
    global: i18n, // Доступ к инстансу вне компонентов
    setRoutingStrategy, // Метод для установки адаптера после создания
    install(app: App) {
      currentApp = app
      // 1. Provide для useI18n
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

      // 4. Глобальные свойства ($t, $tc, и т.д.)
      // Note: In templates, these may be called with string literals, so we use TranslationKey type
      app.config.globalProperties.$t = (
        key: TranslationKey,
        params?: Record<string, string | number | boolean>,
        defaultValue?: string | null,
        routeName?: string,
      ) => {
        return i18n.t(key, params, defaultValue, routeName)
      }
      app.config.globalProperties.$ts = (
        key: TranslationKey,
        params?: Record<string, string | number | boolean>,
        defaultValue?: string,
        routeName?: string,
      ) => {
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
      app.config.globalProperties.$has = (key: TranslationKey, routeName?: string) => {
        return i18n.has(key, routeName)
      }
      // Provide access to i18n instance via $i18n
      // Using unknown and then casting to avoid any, but Vue's globalProperties requires flexibility
      app.config.globalProperties.$i18n = i18n as any

      // 5. Регистрация компонентов
      app.component('I18nT', I18nT)
      app.component('I18nLink', I18nLink)
      app.component('I18nGroup', I18nGroup)
      app.component('I18nSwitcher', I18nSwitcher)
    },
  }
}
