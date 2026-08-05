import { useState } from '#app'
import { defineNuxtPlugin, useNuxtApp } from '#imports'
import type { Params } from '@i18n-micro/types'
import { watch } from 'vue'
import { I18N_DEVTOOLS_BRIDGE_KEY, type I18nDevtoolsBridge } from '../devtools/bridge'
import { countLoadedTranslationKeys, setupVueI18nDevtools } from '../devtools/vue-devtools'

export default defineNuxtPlugin({
  name: 'i18n-vue-devtools',
  dependsOn: ['i18n-plugin-loader'],
  async setup() {
    if (!import.meta.dev || import.meta.server) {
      return
    }

    const nuxtApp = useNuxtApp()
    const bridge = useState<I18nDevtoolsBridge | null>(I18N_DEVTOOLS_BRIDGE_KEY, () => null).value
    if (!bridge) {
      return
    }

    const notifier = await setupVueI18nDevtools({
      app: nuxtApp.vueApp,
      i18n: bridge.i18n,
      i18nConfig: bridge.i18nConfig,
      onContextChange: (listener) => bridge.i18n.onContextChange(listener),
      onMissingKey: (listener) => bridge.i18n.onMissingKey(listener),
    })

    if (!notifier) {
      return
    }

    const notifyCurrentLoad = () => {
      const locale = bridge.i18n.getCurrentLocale()
      const routeName = bridge.i18n.getCurrentRouteName() || 'index'
      notifier.notifyLoad(locale, routeName, countLoadedTranslationKeys(bridge.i18n, locale, routeName))
    }

    notifyCurrentLoad()

    watch(
      () => bridge.localeState.value,
      (to, from) => {
        if (to && from && to !== from) {
          notifier.notifyLocaleSwitch(from, to, bridge.i18n.getCurrentRouteName() || 'index')
        }
      },
    )

    bridge.i18n.onContextChange(() => {
      notifyCurrentLoad()
    })

    if (bridge.i18nConfig.debug) {
      const wrapTranslate = <T extends (key: string, ...args: never[]) => unknown>(translate: T): T =>
        ((key: string, ...args: never[]) => {
          const result = translate(key, ...args)
          notifier.notifyTranslate(key, result)
          return result
        }) as T

      const app = nuxtApp as typeof nuxtApp & {
        $t: (key: string, params?: Params, defaultValue?: string | null) => unknown
        $ts: (key: string, params?: Params, defaultValue?: string) => string
        $tc: (key: string, params: number | Params, defaultValue?: string) => string
      }

      app.$t = wrapTranslate(app.$t.bind(app))
      app.$ts = wrapTranslate(app.$ts.bind(app))
      app.$tc = wrapTranslate(app.$tc.bind(app))
    }
  },
})
