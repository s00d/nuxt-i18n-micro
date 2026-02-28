// src/runtime/plugins/05.hooks.ts

import { isNoPrefixStrategy } from '@i18n-micro/core'
import type { ModuleOptionsExtend, Translations } from '@i18n-micro/types'
// Note: useTranslationHelper from @i18n-micro/core is no longer needed
import type { RouteLocationResolvedGeneric } from 'vue-router'
import { getI18nConfig } from '#build/i18n.strategy.mjs'
import { defineNuxtPlugin, useNuxtApp, useRouter } from '#imports'

const isDev = process.env.NODE_ENV !== 'production'

export default defineNuxtPlugin(async (nuxtApp) => {
  const i18nConfig: ModuleOptionsExtend = getI18nConfig() as ModuleOptionsExtend
  const router = useRouter()
  const { $getLocale, $getRouteName } = useNuxtApp()

  // Get helper created in 01.plugin.ts
  // It already works with an isolated cache for this request.
  // @ts-expect-error $i18n is dynamically provided
  const i18nHelper = nuxtApp.$i18n.helper

  // Check that helper is available, just in case
  if (!i18nHelper) {
    if (isDev) {
      console.warn('[i18n] Helper is not available. Skipping hooks plugin.')
    }
    return
  }

  const locale = $getLocale()
  const routeName = $getRouteName()

  await nuxtApp.callHook(
    // @ts-expect-error i18n:register is custom hook
    'i18n:register',
    (translations: Translations, selectedLocale?: string) => {
      i18nHelper.mergeTranslation(selectedLocale ?? locale, routeName, translations, true)
    },
    locale,
  )

  router.beforeEach(async (to, from) => {
    if (to.path !== from.path || isNoPrefixStrategy(i18nConfig.strategy!)) {
      const locale = $getLocale(to)
      const routeName = $getRouteName(to as RouteLocationResolvedGeneric)

      await nuxtApp.callHook(
        // @ts-expect-error i18n:register is custom hook
        'i18n:register',
        (translations: Translations, selectedLocale?: string) => {
          i18nHelper.mergeTranslation(selectedLocale ?? locale, routeName, translations, true)
        },
        locale,
      )
    }
    return
  })
})
