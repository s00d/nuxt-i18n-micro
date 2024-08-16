import { defineNuxtPlugin, useCookie } from '#app'
import type { ModuleOptions } from '~/src/module'
import { useRoute, useRouter } from '#imports'

interface State extends ModuleOptions {
  rootDir: string
}

export default defineNuxtPlugin(async ({ $config }) => {
  const i18nConfig = $config.public.i18nConfig as State
  const userLocaleCookie = useCookie('user-locale')
  const supportedLocales = i18nConfig.locales?.map(locale => locale.code) ?? []
  const defaultLocale = i18nConfig.defaultLocale || 'en'

  if (userLocaleCookie.value) {
    // User already has a locale set in the cookie
    return
  }

  const router = useRouter()
  const route = useRoute()

  const browserLanguages = navigator.languages || [navigator.language]
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

    const resolvedRoute = router.resolve(currentPath.value)

    const routeName = (resolvedRoute.name as string).replace(`localized-`, '')

    const { defaultLocale } = i18nConfig

    const newRouteName = detectedLocale === defaultLocale ? routeName : `localized-${routeName}`
    const newParams = { ...route.params }

    delete newParams.locale

    if (detectedLocale !== defaultLocale) {
      newParams.locale = detectedLocale
    }

    // Set the locale in the cookie for future visits
    userLocaleCookie.value = detectedLocale

    location.href = router.resolve({ name: newRouteName, params: newParams }).href
  }
  else {
    // Set the default locale in the cookie if no match found
    userLocaleCookie.value = defaultLocale
  }
})
