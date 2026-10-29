import { isNoPrefixStrategy } from '@i18n-micro/core'
import type { PathStrategy, ResolvedRouteLike } from '@i18n-micro/path-strategy'
import type { ModuleOptionsExtend, Translations } from '@i18n-micro/types'
import { resolveI18nConfigWithRuntimeOverrides } from '@i18n-micro/utils/runtime-config'
import type { RouteLocationResolvedGeneric } from 'vue-router'
import { getI18nConfig } from '#build/i18n.strategy.mjs'
import { defineNuxtPlugin, useNuxtApp, useRouter } from '#imports'

const isDev = process.env.NODE_ENV !== 'production'

export default defineNuxtPlugin({
  name: 'i18n-plugin-hooks',
  dependsOn: ['i18n-plugin-loader'],
  async setup(nuxtApp) {
    const getRuntimeConfig = (nuxtApp as unknown as { $getI18nConfig?: () => ModuleOptionsExtend }).$getI18nConfig
    const i18nConfig: ModuleOptionsExtend = resolveI18nConfigWithRuntimeOverrides(
      (typeof getRuntimeConfig === 'function' ? getRuntimeConfig() : getI18nConfig()) as ModuleOptionsExtend,
    )
    const router = useRouter()
    const { $getLocale } = useNuxtApp()
    const i18nStrategy = (nuxtApp as unknown as { $i18nStrategy: PathStrategy }).$i18nStrategy

    // @ts-expect-error $i18n is dynamically provided
    const i18nHelper = nuxtApp.$i18n?.helper as
      | { mergeTranslation: (locale: string, routeName: string, translations: Translations, force?: boolean) => Promise<void> }
      | undefined

    if (!i18nHelper) {
      if (isDev) {
        console.warn('[i18n] Helper is not available. Skipping hooks plugin.')
      }
      return
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
