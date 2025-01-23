// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import { isNoPrefixStrategy, useTranslationHelper } from 'nuxt-i18n-micro-core'
import type { ModuleOptionsExtend, Translations } from 'nuxt-i18n-micro-types'
import { defineNuxtPlugin, useRuntimeConfig } from '#app'
import { useRouter } from '#imports'

const i18nHelper = useTranslationHelper()

export default defineNuxtPlugin(async (nuxtApp) => {
  const config = useRuntimeConfig()
  const i18nConfig: ModuleOptionsExtend = config.public.i18nConfig as unknown as ModuleOptionsExtend
  const router = useRouter()
  const locale = (nuxtApp as unknown).$getLocale() as string
  const routeName = (nuxtApp as unknown).$getRouteName() as string
  await nuxtApp.callHook('i18n:register', (translations: Translations, selectedLocale?: string) => {
    i18nHelper.mergeTranslation(selectedLocale ?? locale, routeName, translations, true)
  }, locale)

  router.beforeEach(async (to, from, next) => {
    if (to.path !== from.path || isNoPrefixStrategy(i18nConfig.strategy!)) {
      const locale = (nuxtApp as unknown).$getLocale(to) as string
      const routeName = (nuxtApp as unknown).$getRouteName(to) as string
      await nuxtApp.callHook('i18n:register', (translations: Translations, selectedLocale?: string) => {
        i18nHelper.mergeTranslation(selectedLocale ?? locale, routeName, translations, true)
      }, locale)
    }
    if (next) {
      next()
    }
  })
})
