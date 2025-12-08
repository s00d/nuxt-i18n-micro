import type { ModuleOptionsExtend } from '@i18n-micro/types'
import { isPrefixStrategy, isNoPrefixStrategy } from '@i18n-micro/core'
import { defineNuxtPlugin, useCookie, useRequestHeaders, navigateTo, useRoute, useRouter } from '#imports'

const parseAcceptLanguage = (acceptLanguage: string) =>
  acceptLanguage
    .split(',')
    .map((entry) => {
      const parts = entry.split(';')
      return parts[0] ? parts[0].trim() : ''
    })

export default defineNuxtPlugin(async (nuxtApp) => {
  const i18nConfig = nuxtApp.$config.public.i18nConfig as unknown as ModuleOptionsExtend
  const date = new Date()
  const userLocaleCookie = useCookie(i18nConfig.localeCookie || 'user-locale', {
    watch: false,
    expires: new Date(date.setDate(date.getDate() + 365)),
  })

  const hashCookie = useCookie<string | undefined>('hash-locale')
  const headers = useRequestHeaders(['accept-language'])
  const supportedLocales = i18nConfig.locales?.map(locale => locale.code) ?? []
  const defaultLocale = i18nConfig.defaultLocale || 'en'
  const autoDetectPath = i18nConfig.autoDetectPath || '/'

  const router = useRouter()
  const route = useRoute()

  async function switchLocale(newLocale: string) {
    if (isNoPrefixStrategy(i18nConfig.strategy!)) {
      if (newLocale !== defaultLocale) {
        const newParams = { ...route.params }
        delete newParams.locale
        const resolvedRoute = router.resolve(router.currentRoute.value)
        const routeName = (resolvedRoute.name as string).replace(`localized-`, '')

        const newRoute = router.resolve({
          name: routeName,
          params: newParams,
        })

        const userLocaleCookie = useCookie('no-prefix-locale')
        userLocaleCookie.value = newLocale

        await navigateTo(newRoute, {
          redirectCode: 302,
          external: true,
        })
      }
      return
    }

    const currentPath = router.currentRoute
    const resolvedRoute = router.resolve(currentPath.value)
    const routeName = (resolvedRoute.name as string).replace(`localized-`, '')

    const newRouteName = isPrefixStrategy(i18nConfig.strategy!) || newLocale !== defaultLocale
      ? `localized-${routeName}`
      : routeName

    const newParams = { ...route.params }
    delete newParams.locale

    if (!isNoPrefixStrategy(i18nConfig.strategy!)) {
      if (isPrefixStrategy(i18nConfig.strategy!) || newLocale !== defaultLocale) {
        newParams.locale = newLocale
      }
    }

    const newRoute = router.resolve({
      name: newRouteName,
      params: newParams,
    })
    await navigateTo(newRoute.href, {
      redirectCode: 302,
      external: true,
    })
  }

  if (userLocaleCookie.value || i18nConfig.isSSG) {
    return
  }

  if (autoDetectPath !== '*' && route.path !== autoDetectPath) {
    return
  }

  const acceptLanguage = headers?.['accept-language'] ?? ''
  const browserLanguages = acceptLanguage ? parseAcceptLanguage(acceptLanguage) : [defaultLocale]
  let detectedLocale: string | undefined = defaultLocale

  for (const language of browserLanguages) {
    const lowerCaseLanguage = language.toLowerCase()
    const primaryLanguage = lowerCaseLanguage.split('-')[0]

    detectedLocale = supportedLocales.find(
      locale => locale.toLowerCase() === lowerCaseLanguage || locale.toLowerCase() === primaryLanguage,
    )

    if (detectedLocale) break
  }

  if (detectedLocale) {
    userLocaleCookie.value = detectedLocale
    if (i18nConfig.hashMode) {
      hashCookie.value = detectedLocale
    }

    const currentLocale = route.params.locale ?? defaultLocale
    if (detectedLocale !== currentLocale) {
      await switchLocale(detectedLocale)
    }
  }
})
