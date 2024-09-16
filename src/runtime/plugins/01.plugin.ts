import type {
  NavigationFailure,
  RouteLocationNormalizedLoaded,
  RouteLocationRaw,
  RouteLocationResolvedGeneric,
  Router,
} from 'vue-router'
import { useTranslationHelper } from '../translationHelper'
import type { ModuleOptionsExtend, Locale, PluralFunc } from '../../types'
import { defineNuxtPlugin, useRuntimeConfig } from '#app'
import { useRoute, useRouter } from '#imports'

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
function getCurrentLocale(route: RouteLocationNormalizedLoaded | RouteLocationResolvedGeneric, i18nConfig: ModuleOptionsExtend): string {
  return (route.params?.locale ?? i18nConfig.defaultLocale).toString()
}

// Вспомогательная функция для получения имени маршрута
function getRouteName(route: RouteLocationNormalizedLoaded | RouteLocationResolvedGeneric, locale: string): string {
  return (route?.name ?? '')
    .toString()
    .replace('localized-', '')
    .replace(new RegExp(`-${locale}$`), '')
}

// eslint-disable-next-line @typescript-eslint/no-invalid-void-type
function switchLocale(fromLocale: string, toLocale: string, route: RouteLocationNormalizedLoaded | RouteLocationResolvedGeneric, router: Router, i18nConfig: ModuleOptionsExtend): Promise<void | NavigationFailure | null | undefined> {
  const checkLocale = i18nConfig.locales?.find(l => l.code === toLocale)
  if (!checkLocale) {
    console.warn(`Locale ${toLocale} is not available`)
    return Promise.reject(`Locale ${toLocale} is not available`)
  }

  const routeName = getRouteName(route, fromLocale)

  if (router.hasRoute(`localized-${routeName}-${toLocale}`)) {
    const newParams = { ...route.params }
    newParams.locale = toLocale
    return router.push({
      params: newParams,
      name: `localized-${routeName}-${toLocale}`,
    })
  }
  const newRouteName = toLocale !== i18nConfig.defaultLocale || i18nConfig.includeDefaultLocaleRoute ? `localized-${routeName}` : routeName
  const newParams = { ...route.params }
  delete newParams.locale

  if (toLocale !== i18nConfig.defaultLocale || i18nConfig.includeDefaultLocaleRoute) {
    newParams.locale = toLocale
  }
  return router.push({ name: newRouteName, params: newParams })
}

function getLocalizedRoute(
  to: RouteLocationRaw,
  router: Router,
  route: RouteLocationNormalizedLoaded,
  i18nConfig: ModuleOptionsExtend,
  locale?: string,
): RouteLocationRaw {
  const currentLocale = locale || getCurrentLocale(route, i18nConfig)
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
    const newParams = resolveParams(to)
    newParams.locale = currentLocale

    return router.resolve({
      params: newParams,
      name: `localized-${routeName}-${currentLocale}`,
    })
  }

  // Determine the new route name based on locale and configuration
  const newRouteName
    = currentLocale !== i18nConfig.defaultLocale || i18nConfig.includeDefaultLocaleRoute
      ? `localized-${routeName}`
      : routeName

  const newParams = resolveParams(to)
  delete newParams.locale

  if (currentLocale !== i18nConfig.defaultLocale || i18nConfig.includeDefaultLocaleRoute) {
    newParams.locale = currentLocale
  }

  return router.resolve({ name: newRouteName, params: newParams })
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
    if (!i18nHelper.hasPageTranslation(locale, routeName)) {
      let fRouteName = routeName
      if (i18nConfig.routesLocaleLinks && i18nConfig.routesLocaleLinks[fRouteName]) {
        fRouteName = i18nConfig.routesLocaleLinks[fRouteName]
      }

      const data: Translations = await $fetch(`/_locales/${fRouteName}/${locale}/data.json?v=${i18nConfig.dateBuild}`, { baseURL: i18nConfig.baseURL })
      await i18nHelper.loadPageTranslations(locale, routeName, data ?? {})
    }
  }

  useRouter().beforeEach(async (to, from, next) => {
    const locale = getCurrentLocale(to, i18nConfig)
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

  // Оптимизация методов, предоставляемых через `provide`
  const getTranslation = (
    key: string,
    params?: Record<string, string | number | boolean>,
    defaultValue?: string,
  ) => {
    if (!key) return ''

    const locale = getCurrentLocale(useRoute(), i18nConfig)
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

  return {
    provide: {
      getLocale: () => getCurrentLocale(useRoute(), i18nConfig),
      getLocales: () => i18nConfig.locales || [],
      getRouteName: (route?: RouteLocationNormalizedLoaded | RouteLocationResolvedGeneric, locale?: string) => {
        const selectedLocale = locale ?? getCurrentLocale(useRoute(), i18nConfig)
        const selectedRoute = route ?? useRoute()
        return getRouteName(selectedRoute, selectedLocale)
      },
      t: getTranslation,
      tc: (key: string, count: number, defaultValue?: string): string => {
        const currentLocale = getCurrentLocale(useRoute(), i18nConfig)
        return plural(key, count, currentLocale, getTranslation) as string ?? defaultValue ?? key
      },
      tn: (value: number, options?: Intl.NumberFormatOptions) => {
        const locale = getCurrentLocale(useRoute(), i18nConfig)
        return formatNumber(value, locale, options)
      },
      td: (value: Date | number | string, options?: Intl.DateTimeFormatOptions) => {
        const locale = getCurrentLocale(useRoute(), i18nConfig)
        return formatDate(value, locale, options)
      },
      has: (key: string): boolean => {
        return !!getTranslation(key)
      },
      mergeTranslations: (newTranslations: Translations) => {
        const route = useRoute()
        const locale = getCurrentLocale(route, i18nConfig)
        const routeName = getRouteName(route, locale)
        i18nHelper.mergeTranslation(locale, routeName, newTranslations)
      },
      switchLocale: (toLocale: string) => {
        const router = useRouter()
        const route = useRoute()

        const fromLocale = getCurrentLocale(route, i18nConfig)
        switchLocale(fromLocale, toLocale, route, router, i18nConfig)
      },
      localeRoute: (to: RouteLocationRaw, locale?: string): RouteLocationRaw => {
        const router = useRouter()
        const route = useRoute()
        return getLocalizedRoute(to, router, route, i18nConfig, locale)
      },
    },
  }
})

export interface PluginsInjections {
  $getLocale: () => string
  $getLocales: () => Locale[]
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
  $switchLocale: (locale: string) => void
  $localeRoute: (to: RouteLocationRaw, locale?: string) => RouteLocationRaw
  $loadPageTranslations: (locale: string, routeName: string) => Promise<void>
}

declare module '#app' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface NuxtApp extends PluginsInjections {}
}

declare module '@vue/runtime-core' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface ComponentCustomProperties extends PluginsInjections {}
}

declare module 'vue' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface ComponentCustomProperties extends PluginsInjections {}
}

declare module '#app/nuxt' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface NuxtApp extends PluginsInjections {}
}
