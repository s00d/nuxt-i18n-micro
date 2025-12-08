import type { App, Plugin } from 'vue'
import { VueI18n, type VueI18nOptions } from './composer'
import { I18nInjectionKey } from './injection'
import { I18nT } from './components/i18n-t'
import { I18nLink } from './components/i18n-link'
import { I18nGroup } from './components/i18n-group'
import { I18nSwitcher } from './components/i18n-switcher'
import type { TranslationKey } from '@i18n-micro/types'
import './vue-shim.d'

export function createI18n(options: VueI18nOptions): Plugin & { global: VueI18n } {
  const i18n = new VueI18n(options)

  return {
    global: i18n, // Доступ к инстансу вне компонентов
    install(app: App) {
      // 1. Provide для useI18n
      app.provide(I18nInjectionKey, i18n)

      // 2. Глобальные свойства ($t, $tc, и т.д.)
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
      app.config.globalProperties.$has = (key: TranslationKey, routeName?: string) => {
        return i18n.has(key, routeName)
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      app.config.globalProperties.$i18n = i18n as any

      // 3. Регистрация компонентов
      app.component('I18nT', I18nT)
      app.component('I18nLink', I18nLink)
      app.component('I18nGroup', I18nGroup)
      app.component('I18nSwitcher', I18nSwitcher)
    },
  }
}
