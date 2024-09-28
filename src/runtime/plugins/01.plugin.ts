import type {
  NavigationFailure,
  RouteLocationNormalizedLoaded,
  RouteLocationRaw,
  RouteLocationResolvedGeneric,
  Router,
} from 'vue-router'
import { useTranslationHelper } from '../translationHelper'
import type { ModuleOptionsExtend, Locale, PluralFunc, I18nRouteParams } from '../../types'
import { defineNuxtPlugin, useRuntimeConfig } from '#app'
import { useRoute, useRouter, useCookie, useState } from '#imports'

const i18nHelper = useTranslationHelper()
const isDev = process.env.NODE_ENV !== 'production'

export interface Translations {
  [key: string]: string | number | boolean | Translations | PluralTranslations | unknown[] | null
}

interface PluralTranslations {
  singular: string
  plural: string
}

function interpolate(template: string, params: Record<string, string | number | boolean>): string {
  let result = template

  for (const key in params) {
    result = result.split(`{${key}}`).join(String(params[key]))
  }

  return result
}

// Вспомогательная функция для получения текущей локали
function getCurrentLocale(
  route: RouteLocationNormalizedLoaded | RouteLocationResolvedGeneric,
  i18nConfig: ModuleOptionsExtend,
  hashLocale: string | null | undefined,
): string {
  if (i18nConfig.hashMode && hashLocale) {
    return hashLocale
  }
  return (route.params?.locale ?? i18nConfig.defaultLocale).toString()
}

// Вспомогательная функция для получения имени маршрута
function getRouteName(route: RouteLocationNormalizedLoaded | RouteLocationResolvedGeneric, locale: string): string {
  return (route?.name ?? '')
    .toString()
    .replace('localized-', '')
    .replace(new RegExp(`-${locale}$`), '')
}

function switchLocaleRoute(fromLocale: string,
  toLocale: string,
  route: RouteLocationNormalizedLoaded | RouteLocationResolvedGeneric,
  router: Router,
  i18nConfig: ModuleOptionsExtend,
  i18nRouteParams: I18nRouteParams,
): RouteLocationRaw {

  const routeName = getRouteName(route, fromLocale)
  if (router.hasRoute(`localized-${routeName}-${toLocale}`)) {
    // const newParams = { ...route.params }
    const newParams = { ...route.params, ...i18nRouteParams?.[toLocale] }
    newParams.locale = toLocale

    // Если включен hashMode, добавляем хеш в URL
    if (i18nConfig.hashMode) {
      const userLocaleCookie = useCookie('hash-locale')
      userLocaleCookie.value = toLocale
    }

    return {
      name: `localized-${routeName}-${toLocale}`,
      params: newParams,
    }
  }

  const newRouteName
    = toLocale !== i18nConfig.defaultLocale || i18nConfig.includeDefaultLocaleRoute
      ? `localized-${routeName}`
      : routeName
  // const newParams = { ...route.params }
  const newParams = { ...route.params, ...i18nRouteParams?.[toLocale] }
  delete newParams.locale

  if (toLocale !== i18nConfig.defaultLocale || i18nConfig.includeDefaultLocaleRoute) {
    newParams.locale = toLocale
  }

  // Если включен hashMode, корректно строим ссылку с хешем
  if (i18nConfig.hashMode) {
    const userLocaleCookie = useCookie('hash-locale')

    userLocaleCookie.value = toLocale
  }

  return { name: newRouteName, params: newParams }
}

function switchLocale(
  fromLocale: string,
  toLocale: string,
  route: RouteLocationNormalizedLoaded | RouteLocationResolvedGeneric,
  router: Router,
  i18nConfig: ModuleOptionsExtend,
  i18nRouteParams: I18nRouteParams,
): Promise<void | NavigationFailure | false> | false | void | RouteLocationRaw {
  const checkLocale = i18nConfig.locales?.find(l => l.code === toLocale)
  if (!checkLocale) {
    console.warn(`Locale ${toLocale} is not available`)
    return Promise.reject(`Locale ${toLocale} is not available`)
  }
  const switchedRoute = switchLocaleRoute(fromLocale,
    toLocale,
    route,
    router,
    i18nConfig,
    i18nRouteParams)

  return router.push(switchedRoute)
}

function getLocalizedRoute(
  to: RouteLocationRaw,
  router: Router,
  route: RouteLocationNormalizedLoaded,
  i18nConfig: ModuleOptionsExtend,
  locale?: string,
  hashLocale?: string | null,
): RouteLocationRaw {
  const currentLocale = locale || getCurrentLocale(route, i18nConfig, hashLocale)
  const selectRoute = router.resolve(to)
  const routeName = getRouteName(selectRoute, currentLocale)

  // Helper function to handle parameters based on the type of 'to'
  const resolveParams = (to: RouteLocationRaw) => {
    const params
      = typeof to === 'object' && 'params' in to && typeof to.params === 'object'
        ? { ...to.params }
        : {}

    if (typeof to === 'string') {
      const resolved = router.resolve(to)
      if (resolved && resolved.params) {
        Object.assign(params, resolved.params)
      }
    }

    return params
  }
  // Check if the localized route exists
  if (router.hasRoute(`localized-${routeName}-${currentLocale}`)) {
    const newParams = resolveParams(selectRoute)
    newParams.locale = currentLocale
    return router.resolve({
      name: `localized-${routeName}-${currentLocale}`,
      params: newParams,
      query: selectRoute.query,
      hash: selectRoute.hash,
    })
  }

  // Determine the new route name based on locale and configuration
  const newRouteName
    = currentLocale !== i18nConfig.defaultLocale || i18nConfig.includeDefaultLocaleRoute
      ? `localized-${routeName}`
      : routeName

  if (!router.hasRoute(newRouteName)) {
    const newParams = resolveParams(to)
    delete newParams.locale
    return router.resolve({
      name: routeName,
      params: newParams,
      query: selectRoute.query,
      hash: selectRoute.hash,
    })
  }

  const newParams = resolveParams(to)
  delete newParams.locale

  if (currentLocale !== i18nConfig.defaultLocale || i18nConfig.includeDefaultLocaleRoute) {
    newParams.locale = currentLocale
  }

  return router.resolve({
    name: newRouteName,
    params: newParams,
    query: selectRoute.query,
    hash: selectRoute.hash,
  })
}

function formatNumber(value: number, locale: string, options?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat(locale, options).format(value)
}

function formatDate(value: Date | number | string, locale: string, options?: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat(locale, options).format(new Date(value))
}

export default defineNuxtPlugin(async (nuxtApp) => {
  if (!nuxtApp.payload.data.translations) {
    nuxtApp.payload.data.translations = {}
  }
  const config = useRuntimeConfig()
  const i18nConfig: ModuleOptionsExtend = config.public.i18nConfig as ModuleOptionsExtend
  const plural: PluralFunc = new Function('return ' + i18nConfig.plural.toString())()

  const loadTranslationsIfNeeded = async (locale: string, routeName: string) => {
    try {
      if (!i18nHelper.hasPageTranslation(locale, routeName)) {
        let fRouteName = routeName
        if (i18nConfig.routesLocaleLinks && i18nConfig.routesLocaleLinks[fRouteName]) {
          fRouteName = i18nConfig.routesLocaleLinks[fRouteName]
        }

        const data: Translations = await $fetch(`/_locales/${fRouteName}/${locale}/data.json?v=${i18nConfig.dateBuild}`, { baseURL: i18nConfig.baseURL })
        await i18nHelper.loadPageTranslations(locale, routeName, data ?? {})
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    catch (_error) { /* empty */ }
  }

  useRouter().beforeEach(async (to, from, next) => {
    const hashLocale = i18nConfig.hashMode ? nuxtApp.runWithContext(() => (useCookie('hash-locale').value ?? i18nConfig.defaultLocale!).toString()).toString() : null
    const locale = getCurrentLocale(to, i18nConfig, hashLocale)

    if (!i18nHelper.hasGeneralTranslation(locale)) {
      const data: Translations = await $fetch(`/_locales/general/${locale}/data.json?v=${i18nConfig.dateBuild}`, { baseURL: i18nConfig.baseURL })
      await i18nHelper.loadTranslations(locale, data ?? {})
    }

    if (!i18nConfig.disablePageLocales) {
      const routeName = getRouteName(to, locale)
      await loadTranslationsIfNeeded(locale, routeName)
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    await nuxtApp.callHook('i18n:register', (translations: Translations, selectedLocale?: string) => {
      const routeName = getRouteName(to, locale)
      i18nHelper.mergeTranslation(selectedLocale ?? locale, routeName, translations, true)
    }, locale)
    next()
  })

  const getTranslation = (
    key: string,
    params?: Record<string, string | number | boolean>,
    defaultValue?: string,
  ) => {
    if (!key) return ''

    const hashLocale = i18nConfig.hashMode ? (useCookie('hash-locale').value ?? i18nConfig.defaultLocale!).toString() : null
    const locale = getCurrentLocale(useRoute(), i18nConfig, hashLocale)
    const routeName = getRouteName(useRoute(), locale)
    let value = i18nHelper.getTranslation(locale, routeName, key)

    if (!value) {
      if (isDev && import.meta.client) {
        console.warn(`Not found '${key}' key in '${locale}' locale messages.`)
      }
      value = defaultValue || key
    }

    return typeof value === 'string' && params ? interpolate(value, params) : value
  }

  let hashLocale: string | null = null
  if (i18nConfig.hashMode) {
    hashLocale = useCookie('hash-locale').value ?? i18nConfig.defaultLocale!
  }
  // Creating storage for route params
  const i18nRouteParams = useState<I18nRouteParams>('i18n-route-params')
  nuxtApp.hook('page:start', () => {
    // Cleaning route-params on client side only
    i18nRouteParams.value = null
  })

  const provideData = {
    i18n: undefined,
    __micro: true,
    getLocale: () => getCurrentLocale(useRoute(), i18nConfig, hashLocale),
    defaultLocale: () => i18nConfig.defaultLocale,
    getLocales: () => i18nConfig.locales || [],
    getRouteName: (route?: RouteLocationNormalizedLoaded | RouteLocationResolvedGeneric, locale?: string) => {
      const selectedLocale = locale ?? getCurrentLocale(useRoute(), i18nConfig, hashLocale)
      const selectedRoute = route ?? useRoute()
      return getRouteName(selectedRoute, selectedLocale)
    },
    t: getTranslation,
    tc: (key: string, count: number, defaultValue?: string): string => {
      const currentLocale = getCurrentLocale(useRoute(), i18nConfig, hashLocale)
      return plural(key, count, currentLocale, getTranslation) as string ?? defaultValue ?? key
    },
    tn: (value: number, options?: Intl.NumberFormatOptions) => {
      const locale = getCurrentLocale(useRoute(), i18nConfig, hashLocale)
      return formatNumber(value, locale, options)
    },
    td: (value: Date | number | string, options?: Intl.DateTimeFormatOptions) => {
      const locale = getCurrentLocale(useRoute(), i18nConfig, hashLocale)
      return formatDate(value, locale, options)
    },
    has: (key: string): boolean => {
      return !!getTranslation(key)
    },
    mergeTranslations: (newTranslations: Translations) => {
      const route = useRoute()
      const locale = getCurrentLocale(route, i18nConfig, hashLocale)
      const routeName = getRouteName(route, locale)
      i18nHelper.mergeTranslation(locale, routeName, newTranslations)
    },
    switchLocaleRoute: (toLocale: string) => {
      const router = useRouter()
      const route = useRoute()

      const fromLocale = getCurrentLocale(route, i18nConfig, hashLocale)
      if (i18nConfig.hashMode) {
        hashLocale = toLocale
      }
      return switchLocaleRoute(fromLocale, toLocale, route, router, i18nConfig, i18nRouteParams.value)
    },
    switchLocalePath: (toLocale: string) => {
      const router = useRouter()
      const route = useRoute()

      const fromLocale = getCurrentLocale(route, i18nConfig, hashLocale)
      if (i18nConfig.hashMode) {
        hashLocale = toLocale
      }
      const localeRoute = switchLocaleRoute(fromLocale, toLocale, route, router, i18nConfig, i18nRouteParams.value)
      if (typeof localeRoute === 'string') {
        return localeRoute
      }
      if ('fullPath' in localeRoute) {
        return localeRoute.fullPath as string
      }
      return ''
    },
    switchLocale: (toLocale: string) => {
      const router = useRouter()
      const route = useRoute()

      const fromLocale = getCurrentLocale(route, i18nConfig, hashLocale)
      if (i18nConfig.hashMode) {
        hashLocale = toLocale
      }
      switchLocale(fromLocale, toLocale, route, router, i18nConfig, i18nRouteParams.value)
    },
    localeRoute: (to: RouteLocationRaw, locale?: string): RouteLocationRaw => {
      const router = useRouter()
      const route = useRoute()
      return getLocalizedRoute(to, router, route, i18nConfig, locale, hashLocale)
    },
    localePath: (to: RouteLocationRaw, locale?: string): string => {
      const router = useRouter()
      const route = useRoute()
      let localeRoute = getLocalizedRoute(to, router, route, i18nConfig, locale, hashLocale)
      if (typeof localeRoute === 'string') {
        return localeRoute
      }
      if ('fullPath' in localeRoute) {
        return localeRoute.fullPath as string
      }
      return ''
    },
    setI18nRouteParams: (value: I18nRouteParams) => {
      i18nRouteParams.value = value
      return i18nRouteParams.value
    },
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  provideData.i18n = provideData

  return {
    provide: provideData,
  }
})

export interface PluginsInjections {
  $getLocale: () => string
  $getLocales: () => Locale[]
  $defaultLocale: () => string
  $getRouteName: (route?: RouteLocationRaw, locale?: string) => string
  $t: <T extends Record<string, string | number | boolean>>(
    key: string,
    params?: T,
    defaultValue?: string
  ) => string | number | boolean | Translations | PluralTranslations | unknown[] | unknown | null
  $tc: (key: string, count: number, defaultValue?: string) => string
  $tn: (value: number, options?: Intl.NumberFormatOptions) => string
  $td: (value: Date | number | string, options?: Intl.DateTimeFormatOptions) => string
  $has: (key: string) => boolean
  $mergeTranslations: (newTranslations: Translations) => void
  $switchLocaleRoute: (locale: string) => RouteLocationRaw
  $switchLocalePath: (locale: string) => string
  $switchLocale: (locale: string) => void
  $localeRoute: (to: RouteLocationRaw, locale?: string) => RouteLocationRaw
  $localePath: (to: RouteLocationRaw, locale?: string) => string
  $loadPageTranslations: (locale: string, routeName: string) => Promise<void>
  $setI18nRouteParams: (value: I18nRouteParams) => I18nRouteParams
}

declare module '#app' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface NuxtApp extends PluginsInjections { }
}

declare module '@vue/runtime-core' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface ComponentCustomProperties extends PluginsInjections { }
}

declare module 'vue' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface ComponentCustomProperties extends PluginsInjections { }
}

declare module '#app/nuxt' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface NuxtApp extends PluginsInjections { }
}
