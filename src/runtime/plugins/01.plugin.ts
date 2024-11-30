import type {
  NavigationFailure,
  RouteLocationNormalizedGeneric,
  RouteLocationNormalizedLoaded,
  RouteLocationRaw,
  RouteLocationResolved,
  RouteLocationResolvedGeneric,
  Router,
} from 'vue-router'
import { useTranslationHelper } from '../translationHelper'
import type { ModuleOptionsExtend, Locale, I18nRouteParams, Params } from '../../types'
import { defineNuxtPlugin, useRuntimeConfig } from '#app'
import { useRouter, useCookie, useState, navigateTo } from '#imports'
import { plural } from '#build/i18n.plural.mjs'

const i18nHelper = useTranslationHelper()
const isDev = process.env.NODE_ENV !== 'production'

interface PluralTranslations {
  singular: string
  plural: string
}

type Translation = string | number | boolean | Translations | PluralTranslations | unknown | null

export interface Translations {
  [key: string]: Translation
}

function interpolate(template: string, params: Params): string {
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

function getCurrentName(
  route: RouteLocationNormalizedLoaded | RouteLocationResolvedGeneric,
  i18nConfig: ModuleOptionsExtend,
  hashLocale: string | null | undefined,
): string | null {
  const currentLocaleCode = getCurrentLocale(route, i18nConfig, hashLocale)
  const checkLocale = i18nConfig.locales?.find(l => l.code === currentLocaleCode)
  if (!checkLocale) {
    return null
  }
  return checkLocale?.displayName ?? null
}

// Вспомогательная функция для получения имени маршрута
function getRouteName(route: RouteLocationNormalizedLoaded | RouteLocationResolvedGeneric, locale: string): string {
  return (route?.name ?? '')
    .toString()
    .replace('localized-', '')
    .replace(new RegExp(`-${locale}$`), '')
}

function switchLocaleRoute(
  fromLocale: string,
  toLocale: string,
  route: RouteLocationNormalizedLoaded | RouteLocationResolvedGeneric,
  router: Router,
  i18nConfig: ModuleOptionsExtend,
  i18nRouteParams: I18nRouteParams,
): RouteLocationRaw {
  const currentLocale = i18nConfig.locales?.find(l => l.code === toLocale)

  function getFullPathWithBaseUrl(
    route: RouteLocationRaw,
  ): string {
    const resolvedRoute = router.resolve(route)
    let fullPath = resolvedRoute.fullPath

    // Remove the locale prefix from the path if baseDefault is set
    if (currentLocale?.baseDefault) {
      fullPath = fullPath.replace(new RegExp(`^/${currentLocale!.code}`), '')
    }

    let baseUrl = currentLocale!.baseUrl
    if (baseUrl?.endsWith('/')) {
      baseUrl = baseUrl.slice(0, -1)
    }

    return baseUrl + fullPath
  }

  const routeName = getRouteName(route, fromLocale)
  if (router.hasRoute(`localized-${routeName}-${toLocale}`)) {
    const newParams = { ...route.params, ...i18nRouteParams?.[toLocale] }
    newParams.locale = toLocale

    // If hashMode is enabled, set the locale cookie for hash-based routing
    if (i18nConfig.hashMode) {
      const userLocaleCookie = useCookie('hash-locale')
      userLocaleCookie.value = toLocale
    }

    const newRoute = {
      name: `localized-${routeName}-${toLocale}`,
      params: newParams,
    }

    if (currentLocale?.baseUrl) {
      return getFullPathWithBaseUrl(newRoute)
    }

    return newRoute
  }

  const newRouteName
    = toLocale !== i18nConfig.defaultLocale || i18nConfig.includeDefaultLocaleRoute
      ? `localized-${routeName}`
      : routeName

  const newParams = { ...route.params, ...i18nRouteParams?.[toLocale] }
  delete newParams.locale

  if (toLocale !== i18nConfig.defaultLocale || i18nConfig.includeDefaultLocaleRoute) {
    newParams.locale = toLocale
  }

  // Set the locale cookie for hash-based routing if hashMode is enabled
  if (i18nConfig.hashMode) {
    const userLocaleCookie = useCookie('hash-locale')
    userLocaleCookie.value = toLocale
  }

  const newRoute = {
    name: newRouteName,
    params: newParams,
  }

  if (currentLocale?.baseUrl) {
    return getFullPathWithBaseUrl(newRoute)
  }

  return newRoute
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

  if (typeof switchedRoute === 'string' && switchedRoute.startsWith('http')) {
    return navigateTo(switchedRoute, { redirectCode: 200, external: true })
  }

  return router.push(switchedRoute)
}

function getLocalizedRoute(
  to: RouteLocationRaw,
  router: Router,
  route: RouteLocationNormalizedLoaded,
  i18nConfig: ModuleOptionsExtend,
  locale?: string,
  hashLocale?: string | null,
): RouteLocationResolved {
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

  // get default route with prefix
  if (i18nConfig.includeDefaultLocaleRoute) {
    const defaultLocale = i18nConfig.defaultLocale!
    let resolvedTo = to
    if (typeof to === 'string') {
      resolvedTo = router.resolve('/' + defaultLocale + to)
    }

    // Формируем routeName для дефолтной локали
    const defaultRouteName = getRouteName(resolvedTo as RouteLocationNormalizedLoaded, defaultLocale)
    const newParams = resolveParams(resolvedTo)
    newParams.locale = defaultLocale
    // Если текущая локаль совпадает с дефолтной, то резолвим маршрут с дефолтной локалью
    if (router.hasRoute(`localized-${defaultRouteName}`)) {
      to = router.resolve({
        name: `localized-${defaultRouteName}`,
        query: (resolvedTo as RouteLocationNormalizedLoaded).query,
        params: newParams,
      })
    }
    else if (router.hasRoute(`localized-${defaultRouteName}-${defaultLocale}`)) {
      to = router.resolve({
        name: `localized-${defaultRouteName}-${defaultLocale}`,
        query: (resolvedTo as RouteLocationNormalizedLoaded).query,
        params: newParams,
      })
    }
  }

  const currentLocale = locale || getCurrentLocale(route, i18nConfig, hashLocale)
  const selectRoute = router.resolve(to)
  const routeName = getRouteName(selectRoute, currentLocale)
    .replace(new RegExp(`-${i18nConfig.defaultLocale!}$`), '')

  if (!routeName || routeName === '') {
    const resolved = router.resolve(to)
    let url = resolved.path.replace(new RegExp(`^/${currentLocale}/`), '/')
    if (currentLocale !== i18nConfig.defaultLocale || i18nConfig.includeDefaultLocaleRoute) {
      url = '/' + currentLocale + '' + url
    }

    return router.resolve({
      path: url,
      query: selectRoute.query,
      hash: selectRoute.hash,
    })
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

    if (!router.hasRoute(routeName)) {
      return router.resolve('/')
    }

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
  const i18nConfig: ModuleOptionsExtend = config.public.i18nConfig as unknown as ModuleOptionsExtend
  const apiBaseUrl = i18nConfig.apiBaseUrl ?? '_locales'
  const runtimeConfig = useRuntimeConfig()

  const loadTranslationsIfNeeded = async (locale: string, routeName: string, path: string) => {
    try {
      if (!i18nHelper.hasPageTranslation(locale, routeName)) {
        let fRouteName = routeName
        if (i18nConfig.routesLocaleLinks && i18nConfig.routesLocaleLinks[fRouteName]) {
          fRouteName = i18nConfig.routesLocaleLinks[fRouteName]
        }

        if (!fRouteName || fRouteName === '') {
          console.warn(`[nuxt-i18n-next] The page name is missing in the path: ${path}. Please ensure that definePageMeta({ name: 'pageName' }) is set.`)
          return
        }

        const route = `/${apiBaseUrl}/${fRouteName}/${locale}/data.json?v=${i18nConfig.dateBuild}`.replace(/\/{2,}/g, '/')
        const data: Translations = await $fetch(route, { baseURL: runtimeConfig.app.baseURL })
        await i18nHelper.loadPageTranslations(locale, routeName, data ?? {})
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    catch (_error) { /* empty */ }
  }

  async function loadTranslationsForRoute(
    to: RouteLocationNormalizedGeneric,
  ) {
    const hashLocale = i18nConfig.hashMode
      ? nuxtApp.runWithContext(() => (useCookie('hash-locale').value ?? i18nConfig.defaultLocale!).toString()).toString()
      : null
    const locale = getCurrentLocale(to, i18nConfig, hashLocale)

    if (!i18nHelper.hasGeneralTranslation(locale)) {
      const data: Translations = await $fetch(`/${apiBaseUrl}/general/${locale}/data.json?v=${i18nConfig.dateBuild}`, {
        baseURL: runtimeConfig.app.baseURL,
      })
      await i18nHelper.loadTranslations(locale, data ?? {})
    }

    if (!i18nConfig.disablePageLocales) {
      const routeName = getRouteName(to, locale)
      await loadTranslationsIfNeeded(locale, routeName, to.fullPath)
    }

    // Ensure i18n hook is called after all translations are loaded
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    await nuxtApp.callHook('i18n:register', (translations: Translations, selectedLocale?: string) => {
      const routeName = getRouteName(to, locale)
      i18nHelper.mergeTranslation(selectedLocale ?? locale, routeName, translations, true)
    }, locale)
  }

  const router = useRouter()
  router.beforeEach(async (to, from, next) => {
    if (to.path !== from.path) {
      await loadTranslationsForRoute(to)
    }
    if (next) {
      next()
    }
  })

  await loadTranslationsForRoute(router.currentRoute.value)

  const getTranslation = (
    key: string,
    params?: Params,
    defaultValue?: string,
  ): Translation => {
    if (!key) return ''

    const route = router.currentRoute.value
    const hashLocale = i18nConfig.hashMode ? (useCookie('hash-locale').value ?? i18nConfig.defaultLocale!).toString() : null
    const locale = getCurrentLocale(route, i18nConfig, hashLocale)
    const routeName = getRouteName(route, locale)
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
    getLocale: () => getCurrentLocale(router.currentRoute.value, i18nConfig, hashLocale),
    getLocaleName: () => getCurrentName(router.currentRoute.value, i18nConfig, hashLocale),
    defaultLocale: () => i18nConfig.defaultLocale,
    getLocales: () => i18nConfig.locales || [],
    getRouteName: (route?: RouteLocationNormalizedLoaded | RouteLocationResolvedGeneric, locale?: string) => {
      const selectedLocale = locale ?? getCurrentLocale(router.currentRoute.value, i18nConfig, hashLocale)
      const selectedRoute = route ?? router.currentRoute.value
      return getRouteName(selectedRoute, selectedLocale)
    },
    t: getTranslation,
    ts: (key: string, params?: Params, defaultValue?: string): string => {
      const value = getTranslation(key, params, defaultValue)
      return value?.toString() ?? defaultValue ?? key
    },
    tc: (key: string, params: number | Params, defaultValue?: string): string => {
      const route = router.currentRoute.value
      const currentLocale = getCurrentLocale(route, i18nConfig, hashLocale)
      const { count, ..._params } = typeof params === 'number' ? { count: params } : params

      return plural(key, Number.parseInt(count.toString()), _params, currentLocale, getTranslation) as string ?? defaultValue ?? key
    },
    tn: (value: number, options?: Intl.NumberFormatOptions) => {
      const route = router.currentRoute.value
      const locale = getCurrentLocale(route, i18nConfig, hashLocale)
      return formatNumber(value, locale, options)
    },
    td: (value: Date | number | string, options?: Intl.DateTimeFormatOptions) => {
      const route = router.currentRoute.value
      const locale = getCurrentLocale(route, i18nConfig, hashLocale)
      return formatDate(value, locale, options)
    },
    has: (key: string): boolean => {
      return !!getTranslation(key)
    },
    mergeTranslations: (newTranslations: Translations) => {
      const route = router.currentRoute.value
      const locale = getCurrentLocale(route, i18nConfig, hashLocale)
      const routeName = getRouteName(route, locale)
      i18nHelper.mergeTranslation(locale, routeName, newTranslations)
    },
    switchLocaleRoute: (toLocale: string) => {
      const route = router.currentRoute.value

      const fromLocale = getCurrentLocale(route, i18nConfig, hashLocale)
      if (i18nConfig.hashMode) {
        hashLocale = toLocale
      }
      return switchLocaleRoute(fromLocale, toLocale, route, router, i18nConfig, i18nRouteParams.value)
    },
    switchLocalePath: (toLocale: string) => {
      const route = router.currentRoute.value

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
      const route = router.currentRoute.value

      const fromLocale = getCurrentLocale(route, i18nConfig, hashLocale)
      if (i18nConfig.hashMode) {
        hashLocale = toLocale
      }
      switchLocale(fromLocale, toLocale, route, router, i18nConfig, i18nRouteParams.value)
    },
    switchRoute: (route: RouteLocationNormalizedLoaded | RouteLocationResolvedGeneric | string, toLocale?: string) => {
      if (typeof route === 'string') {
        route = router.resolve(route)
      }

      const fromLocale = getCurrentLocale(route, i18nConfig, hashLocale)
      if (i18nConfig.hashMode) {
        hashLocale = toLocale ?? fromLocale
      }
      switchLocale(fromLocale, toLocale ?? fromLocale, route, router, i18nConfig, i18nRouteParams.value)
    },
    localeRoute: (to: RouteLocationRaw, locale?: string): RouteLocationResolved => {
      const route = router.currentRoute.value
      return getLocalizedRoute(to, router, route, i18nConfig, locale, hashLocale)
    },
    localePath: (to: RouteLocationRaw, locale?: string): string => {
      const route = router.currentRoute.value
      const localeRoute = getLocalizedRoute(to, router, route, i18nConfig, locale, hashLocale)
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

  const $provideData = Object.fromEntries(
    Object.entries(provideData).map(([key, value]) => [`$${key}`, value]),
  )
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  provideData.i18n = { ...provideData, ...$provideData }

  return {
    provide: provideData,
  }
})

export interface PluginsInjections {
  $getLocale: () => string
  $getLocaleName: () => string | null
  $getLocales: () => Locale[]
  $defaultLocale: () => string | undefined
  $getRouteName: (route?: RouteLocationNormalizedLoaded | RouteLocationResolvedGeneric, locale?: string) => string
  $t: (key: string, params?: Params, defaultValue?: string) => Translation
  $ts: (key: string, params?: Params, defaultValue?: string) => string
  $tc: (key: string, params: number | Params, defaultValue?: string) => string
  $tn: (value: number, options?: Intl.NumberFormatOptions) => string
  $td: (value: Date | number | string, options?: Intl.DateTimeFormatOptions) => string
  $has: (key: string) => boolean
  $mergeTranslations: (newTranslations: Translations) => void
  $switchLocaleRoute: (locale: string) => RouteLocationRaw
  $switchLocalePath: (locale: string) => string
  $switchLocale: (locale: string) => void
  $switchRoute: (route: RouteLocationNormalizedLoaded | RouteLocationResolvedGeneric | string, toLocale?: string) => void
  $localeRoute: (to: RouteLocationRaw, locale?: string) => RouteLocationResolved
  $localePath: (to: RouteLocationRaw, locale?: string) => string
  $setI18nRouteParams: (value: I18nRouteParams) => I18nRouteParams
}
