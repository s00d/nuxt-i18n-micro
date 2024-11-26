import type { ModuleOptionsExtend } from '../../types'
import { defineNuxtPlugin, useCookie, useRequestHeaders, navigateTo } from '#app'
import { useRoute, useRouter } from '#imports'

const parseAcceptLanguage = (acceptLanguage: string) =>
  acceptLanguage
    .split(',')
    .map(entry => entry.split(';')[0].trim())

export default defineNuxtPlugin(async (nuxtApp) => {
  if(import.meta.prerender){
    return
  }
  const i18nConfig = nuxtApp.$config.public.i18nConfig as ModuleOptionsExtend
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
    const currentPath = router.currentRoute
    const resolvedRoute = router.resolve(currentPath.value)
    const routeName = (resolvedRoute.name as string).replace(`localized-`, '')

    const newRouteName = i18nConfig.includeDefaultLocaleRoute || newLocale !== defaultLocale
      ? `localized-${routeName}`
      : routeName

    const newParams = { ...route.params }
    delete newParams.locale

    if (i18nConfig.includeDefaultLocaleRoute || newLocale !== defaultLocale) {
      newParams.locale = newLocale
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
  let detectedLocale = defaultLocale

  for (const language of browserLanguages) {
    const primaryLanguage = language.split('-')[0]
    if (supportedLocales.includes(primaryLanguage)) {
      detectedLocale = primaryLanguage
      break
    }
  }

  userLocaleCookie.value = detectedLocale
  if (i18nConfig.hashMode) {
    hashCookie.value = detectedLocale
  }

  const currentLocale = route.params.locale ?? defaultLocale
  if (detectedLocale !== currentLocale) {
    await switchLocale(detectedLocale)
  }
})
