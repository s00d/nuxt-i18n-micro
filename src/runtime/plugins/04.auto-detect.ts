import type { ModuleOptionsExtend } from '../../types'
import { defineNuxtPlugin, useCookie, useRequestHeaders, navigateTo } from '#app'
import { useRoute, useRouter } from '#imports'

export default defineNuxtPlugin(async (nuxtApp) => {
  const i18nConfig = nuxtApp.$config.public.i18nConfig as ModuleOptionsExtend
  const userLocaleCookie = useCookie('user-locale')
  const headers = useRequestHeaders(['accept-language'])
  const supportedLocales = i18nConfig.locales?.map(locale => locale.code) ?? []
  const defaultLocale = i18nConfig.defaultLocale || 'en'
  const autoDetectPath = i18nConfig.autoDetectPath || '*'

  if (userLocaleCookie.value) {
    // User already has a locale set in the cookie
    return
  }

  const router = useRouter()
  const route = useRoute()

  if (autoDetectPath !== '*' && route.path !== autoDetectPath) {
    // Skip auto-detection for routes that don't match the specified path
    return
  }

  const acceptLanguage = headers?.['accept-language'] ?? ''
  const browserLanguages = acceptLanguage ? acceptLanguage.split(',').map(lang => lang.split(';')[0]) : [defaultLocale]

  let detectedLocale = defaultLocale

  for (const language of browserLanguages) {
    const primaryLanguage = language.split('-')[0]
    if (supportedLocales.includes(primaryLanguage)) {
      detectedLocale = primaryLanguage
      break
    }
  }

  if (supportedLocales.includes(detectedLocale)) {
    const currentPath = router.currentRoute

    const currentLocale = (currentPath.value.params.locale ?? defaultLocale)

    if (detectedLocale === currentLocale) {
      return
    }

    const resolvedRoute = router.resolve(currentPath.value)

    const routeName = (resolvedRoute.name as string).replace(`localized-`, '')

    const newRouteName = detectedLocale === defaultLocale ? routeName : `localized-${routeName}`
    const newParams = { ...route.params }

    delete newParams.locale

    if (detectedLocale !== defaultLocale) {
      newParams.locale = detectedLocale
    }

    // Set the locale in the cookie for future visits
    userLocaleCookie.value = detectedLocale

    await navigateTo(router.resolve({ name: newRouteName, params: newParams }).href, { redirectCode: 301, external: true })
  }
  else {
    // Set the default locale in the cookie if no match found
    userLocaleCookie.value = defaultLocale
  }
})
