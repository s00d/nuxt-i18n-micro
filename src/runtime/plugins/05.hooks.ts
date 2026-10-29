import { isNoPrefixStrategy } from '@i18n-micro/core'
import type { ResolvedRouteLike } from '@i18n-micro/path-strategy'
import type { Translations } from '@i18n-micro/types'
import type { RouteLocationResolvedGeneric } from 'vue-router'
import { defineNuxtPlugin, useRouter } from '#imports'

const isDev = process.env.NODE_ENV !== 'production'

export default defineNuxtPlugin({
  name: 'i18n-plugin-hooks',
  dependsOn: ['i18n-plugin-loader'],
  async setup(nuxtApp) {
    const i18nConfig = nuxtApp.$getI18nConfig()
    const router = useRouter()
    const { $getLocale, $i18nStrategy: i18nStrategy } = nuxtApp
    const i18nHelper = nuxtApp.$helper as {
      mergeTranslation: (locale: string, routeName: string, translations: Translations, force?: boolean) => Promise<void>
    }

    const callRegister = async (route?: RouteLocationResolvedGeneric) => {
      const locale = $getLocale(route)
      // the chunk key the loader uses (`index` under disablePageLocales), not the route's base name
      const routeName = i18nStrategy.getPluginRouteName((route ?? router.currentRoute.value) as unknown as ResolvedRouteLike, locale)
      const mergeTasks: Promise<void>[] = []

      await nuxtApp.callHook(
        // @ts-expect-error i18n:register is custom hook
        'i18n:register',
        (translations: Translations, selectedLocale?: string) => {
          mergeTasks.push(i18nHelper.mergeTranslation(selectedLocale ?? locale, routeName, translations, true))
        },
        locale,
      )

      await Promise.all(mergeTasks)
    }

    if (i18nConfig.hooks !== false) {
      await callRegister()
    }

    router.beforeEach(async (to, from) => {
      if (i18nConfig.hooks === false) return
      if (to.path !== from.path || isNoPrefixStrategy(i18nConfig.strategy!)) {
        await callRegister(to as RouteLocationResolvedGeneric)
      }
    })
  },
})
