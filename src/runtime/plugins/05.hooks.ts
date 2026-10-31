import { isNoPrefixStrategy } from '@i18n-micro/core'
import type { ResolvedRouteLike } from '@i18n-micro/path-strategy'
import type { Translations } from '@i18n-micro/types'
import type { RouteLocationResolvedGeneric } from 'vue-router'
import { defineNuxtPlugin, useRouter } from '#imports'

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

    /** Asked on every call: a plugin may subscribe later. `_hooks` is hookable's own, so without it the hook just runs. */
    const subscribed = () => {
      const { _hooks: hooks } = nuxtApp.hooks as unknown as { _hooks?: Record<string, unknown[] | undefined> }
      return !hooks || Boolean(hooks['i18n:register']?.length)
    }

    const callRegister = async (route?: RouteLocationResolvedGeneric) => {
      const locale = $getLocale(route)
      // the chunk key the loader uses (`index` under disablePageLocales), not the route's base name
      const routeName = i18nStrategy.getPluginRouteName((route ?? router.currentRoute.value) as unknown as ResolvedRouteLike, locale)
      const mergeTasks: Promise<void>[] = []

      await nuxtApp.callHook(
        'i18n:register',
        (translations: unknown, selectedLocale?: string) => {
          mergeTasks.push(i18nHelper.mergeTranslation(selectedLocale ?? locale, routeName, translations as Translations, true))
        },
        locale,
      )

      await Promise.all(mergeTasks)
    }

    if (subscribed()) await callRegister()

    router.beforeEach((to, from) => {
      if (!subscribed()) return
      if (to.path !== from.path || isNoPrefixStrategy(i18nConfig.strategy!)) return callRegister(to as RouteLocationResolvedGeneric)
    })
  },
})
