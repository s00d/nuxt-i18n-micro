// plugins/i18n.redirect.ts
import { isNoPrefixStrategy, isPrefixStrategy } from 'nuxt-i18n-micro-core'
import type { ModuleOptionsExtend } from 'nuxt-i18n-micro-types'
import { defineNuxtPlugin, useRuntimeConfig, useRoute, useRouter, navigateTo, createError } from '#imports'
import { findAllowedLocalesForRoute } from '../utils/route-utils'

export default defineNuxtPlugin(async (nuxtApp) => {
  const config = useRuntimeConfig()
  const i18nConfig: ModuleOptionsExtend = config.public.i18nConfig as unknown as ModuleOptionsExtend
  const { routeLocales } = useRuntimeConfig().public.i18nConfig as unknown as ModuleOptionsExtend
  const route = useRoute()
  const router = useRouter()

  const checkRouteLocales = (to: ReturnType<typeof useRoute>) => {
    const allowedLocales = findAllowedLocalesForRoute(to, routeLocales)

    // If there are no restrictions for this route, skip the check
    if (!allowedLocales || allowedLocales.length === 0) {
      return
    }

    // Extract locale from path
    const pathSegments = to.path.split('/').filter(Boolean)
    const firstSegment = pathSegments[0]

    // Check if the first segment is a locale
    // Get all available locales from configuration
    const allLocales = i18nConfig.locales?.map(l => l.code) || []

    if (firstSegment && allLocales.includes(firstSegment) && !allowedLocales.includes(firstSegment)) {
      console.log('Locale not allowed, throwing 404')
      // If locale is not allowed for this route, return 404
      throw createError({
        statusCode: 404,
        statusMessage: 'Page Not Found',
      })
    }
  }

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

  // Always check routeLocales regardless of strategy
  if (import.meta.server) {
    checkRouteLocales(route)
    if (isPrefixStrategy(i18nConfig.strategy!) || isNoPrefixStrategy(i18nConfig.strategy!)) {
      await handleRedirect(route)
    }
  }

  router.beforeEach(async (to, from, next) => {
    // Check routeLocales only if it's not a locale switch
    if (from.path !== to.path) {
      checkRouteLocales(to)
    }

    if (isPrefixStrategy(i18nConfig.strategy!) || isNoPrefixStrategy(i18nConfig.strategy!)) {
      await handleRedirect(to)
    }
    next?.()
  })
})
