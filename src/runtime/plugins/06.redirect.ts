// plugins/i18n.redirect.ts
import { isNoPrefixStrategy, isPrefixStrategy } from 'nuxt-i18n-micro-core'
import type { ModuleOptionsExtend } from 'nuxt-i18n-micro-types'
import { defineNuxtPlugin, useRuntimeConfig, useRoute, useRouter, navigateTo } from '#imports'

export default defineNuxtPlugin(async (nuxtApp) => {
  const config = useRuntimeConfig()
  const i18nConfig: ModuleOptionsExtend = config.public.i18nConfig as unknown as ModuleOptionsExtend
  const route = useRoute()
  const router = useRouter()

  const handleRedirect = async (to: ReturnType<typeof useRoute>) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const currentLocale = (nuxtApp as unknown).$getLocale().toString()
    const name = to.name?.toString()

    let defaultRouteName = name?.toString()
      .replace('localized-', '')
      .replace(new RegExp(`-${currentLocale}$`), '')

    if (!to.params.locale) {
      if (router.hasRoute(`localized-${name}-${currentLocale}`)) {
        defaultRouteName = `localized-${name}-${currentLocale}`
      }
      else {
        defaultRouteName = `localized-${name}`
      }

      if (!router.hasRoute(defaultRouteName)) return

      const newParams = { ...to.params }
      if (!isNoPrefixStrategy(i18nConfig.strategy!)) {
        newParams.locale = i18nConfig.defaultLocale!
      }

      return navigateTo({ name: defaultRouteName, params: newParams }, {
        redirectCode: 301,
        external: true,
      })
    }
  }

  if (import.meta.server && (isPrefixStrategy(i18nConfig.strategy!) || isNoPrefixStrategy(i18nConfig.strategy!))) {
    await handleRedirect(route)
  }

  router.beforeEach(async (to, from, next) => {
    if (isPrefixStrategy(i18nConfig.strategy!) || isNoPrefixStrategy(i18nConfig.strategy!)) {
      await handleRedirect(to)
    }
    next?.()
  })
})
