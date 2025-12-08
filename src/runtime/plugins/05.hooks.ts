// src/runtime/plugins/05.hooks.ts

// УБИРАЕМ: import { useTranslationHelper } from '@i18n-micro/core'
import { isNoPrefixStrategy } from '@i18n-micro/core'
import type { ModuleOptionsExtend, Translations } from '@i18n-micro/types'
import { defineNuxtPlugin, useRuntimeConfig, useRouter, useNuxtApp } from '#imports'

const isDev = process.env.NODE_ENV !== 'production'

export default defineNuxtPlugin(async (nuxtApp) => {
  const config = useRuntimeConfig()
  const i18nConfig: ModuleOptionsExtend = config.public.i18nConfig as unknown as ModuleOptionsExtend
  const router = useRouter()
  const { $getLocale, $getRouteName } = useNuxtApp()

  // --- КЛЮЧЕВОЕ ИЗМЕНЕНИЕ ---
  // Получаем helper, созданный в плагине 01.plugin.ts
  // Он уже работает с изолированным кэшем для этого запроса.
  // Используем `nuxtApp.$i18n.helper` или `nuxtApp.helper`, в зависимости от того, как вы назвали в provide
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  const i18nHelper = nuxtApp.$i18n.helper

  // Проверяем, что helper доступен, на всякий случай
  if (!i18nHelper) {
    if (isDev) {
      console.warn('[i18n] Helper is not available. Skipping hooks plugin.')
    }
    return
  }

  const locale = $getLocale()
  const routeName = $getRouteName()

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore i18n:register is custom hook
  await nuxtApp.callHook('i18n:register', (translations: Translations, selectedLocale?: string) => {
    i18nHelper.mergeTranslation(selectedLocale ?? locale, routeName, translations, true)
  }, locale)

  router.beforeEach(async (to, from, next) => {
    if (to.path !== from.path || isNoPrefixStrategy(i18nConfig.strategy!)) {
      const locale = $getLocale(to)
      const routeName = $getRouteName(to)

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore i18n:register is custom hook
      await nuxtApp.callHook('i18n:register', (translations: Translations, selectedLocale?: string) => {
        i18nHelper.mergeTranslation(selectedLocale ?? locale, routeName, translations, true)
      }, locale)
    }
    if (next) {
      next()
    }
  })
})
