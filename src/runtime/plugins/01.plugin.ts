import type {
  NavigationFailure,
  RouteLocationNormalizedLoaded,
  RouteLocationRaw,
  RouteLocationResolvedGeneric,
  Router,
} from 'vue-router'
import type { Locale, ModuleOptionsExtend } from '../../module'
import { useTranslationHelper } from '../translationHelper'
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
  return template.replace(/\{(\w+)\}/g, (_, match) => params[match] !== undefined ? String(params[match]) : `{${match}}`)
}

// Вспомогательная функция для получения текущей локали
function getCurrentLocale(route: RouteLocationNormalizedLoaded, i18nConfig: ModuleOptionsExtend): string {
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
function switchLocale(locale: string, route: RouteLocationNormalizedLoaded, router: Router, i18nConfig: ModuleOptionsExtend): Promise<void | NavigationFailure | null | undefined> {
  const checkLocale = i18nConfig.locales?.find(l => l.code === locale)
  if (!checkLocale) {
    console.warn(`Locale ${locale} is not available`)
    return Promise.reject(`Locale ${locale} is not available`)
  }

  const routeName = getRouteName(route, locale)
  if (router.hasRoute(`localized-${routeName}-${locale}`)) {
    const newParams = { ...route.params }
    newParams.locale = locale
    return router.push({
      params: newParams,
      name: `localized-${routeName}-${locale}`,
    })
  }
  const newRouteName = locale !== i18nConfig.defaultLocale || i18nConfig.includeDefaultLocaleRoute ? `localized-${routeName}` : routeName
  const newParams = { ...route.params }
  delete newParams.locale

  if (locale !== i18nConfig.defaultLocale || i18nConfig.includeDefaultLocaleRoute) {
    newParams.locale = locale
  }
  return router.push({ name: newRouteName, params: newParams })
}

function getLocalizedRoute(to: RouteLocationRaw, router: Router, route: RouteLocationNormalizedLoaded, i18nConfig: ModuleOptionsExtend, locale?: string): RouteLocationRaw {
  const currentLocale = (locale || getCurrentLocale(route, i18nConfig))
  const selectRoute = router.resolve(to)

  const routeName = getRouteName(selectRoute, currentLocale)
  if (router.hasRoute(`localized-${routeName}-${currentLocale}`)) {
    const newParams = { ...route.params }
    newParams.locale = currentLocale
    return router.resolve({
      params: newParams,
      name: `localized-${routeName}-${currentLocale}`,
    })
  }

  const newRouteName = currentLocale !== i18nConfig.defaultLocale || i18nConfig.includeDefaultLocaleRoute ? `localized-${routeName}` : routeName
  const newParams = { ...route.params }
  delete newParams.locale

  if (currentLocale !== i18nConfig.defaultLocale || i18nConfig.includeDefaultLocaleRoute) {
    newParams.locale = currentLocale
  }

  return router.resolve({ name: newRouteName, params: newParams })
}

export default defineNuxtPlugin(async (nuxtApp) => {
  const registerI18nModule = (translations: Translations, locale: string) => {
    i18nHelper.mergeGlobalTranslation(locale, translations)
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  await nuxtApp.callHook('i18n:register', registerI18nModule)

  if (!nuxtApp.payload.data.translations) {
    nuxtApp.payload.data.translations = {}
  }

  const route = useRoute()
  const config = useRuntimeConfig()
  const i18nConfig: ModuleOptionsExtend = config.public.i18nConfig as ModuleOptionsExtend

  const plural = new Function('return ' + i18nConfig.plural)()

  const initialLocale = getCurrentLocale(route, i18nConfig)
  if (!i18nHelper.hasGeneralTranslation(initialLocale)) {
    const data: Translations = await $fetch(`/_locales/general/${initialLocale}/data.json?v=${i18nConfig.dateBuild}`, { baseURL: i18nConfig.baseURL })
    await i18nHelper.loadTranslations(initialLocale, data ?? {})
  }

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

  if (import.meta.server && !i18nConfig.disablePageLocales) {
    const locale = getCurrentLocale(route, i18nConfig)
    const initialRouteName = getRouteName(route, locale)
    await loadTranslationsIfNeeded(locale, initialRouteName)
  }
  useRouter().beforeEach(async (to, from, next) => {
    if (import.meta.client && !i18nConfig.disablePageLocales) {
      const locale = getCurrentLocale(to, i18nConfig)
      const routeName = getRouteName(to, locale)
      await loadTranslationsIfNeeded(locale, routeName)
    }
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
      t: getTranslation,
      tc: (key: string, count: number, defaultValue?: string): string => {
        const translation = getTranslation(key, {}, defaultValue)
        return plural(translation?.toString(), count, getCurrentLocale(useRoute(), i18nConfig)) as string
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
      switchLocale: (locale: string) => {
        const router = useRouter()
        const route = useRoute()
        switchLocale(locale, route, router, i18nConfig)
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
  $t: <T extends Record<string, string | number | boolean>>(
    key: string,
    params?: T,
    defaultValue?: string
  ) => string | number | boolean | Translations | PluralTranslations | unknown[] | unknown | null
  $tc: (key: string, count: number, defaultValue?: string) => string
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
