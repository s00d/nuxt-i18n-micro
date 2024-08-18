import type { NavigationFailure, RouteLocationNormalizedLoaded, RouteLocationRaw, Router } from 'vue-router'
import type { ModuleOptions } from '../module'
import { defineNuxtPlugin, useRuntimeConfig } from '#app'
import { useRoute, useRouter } from '#imports'

const isDev = process.env.NODE_ENV !== 'production'

// Интерфейс для переводов, поддерживающий разные типы данных
interface Translations {
  [key: string]: string | number | boolean | Translations | PluralTranslations | unknown[] | null
}

interface PluralTranslations {
  singular: string
  plural: string
}

interface State extends ModuleOptions {
  translations: { [key: string]: Translations }
  rootDir: string
  pluralString: string
}

// Кэш для хранения переводов
const generalLocaleCache: { [key: string]: Translations } = {}
const routeLocaleCache: { [key: string]: Translations } = {}
const dynamicTranslationsCaches: { [key: string]: Translations }[] = []

const translationCache = { map: new Map<string, unknown>() }

/**
 * Клонирование объектов и массивов.
 */
function deepClone<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.slice() as T
  }
  else if (typeof value === 'object' && value !== null) {
    return { ...value } as T
  }
  return value
}

/**
 * Получение перевода по ключу с кэшированием.
 */
function getTranslation<T = unknown>(translations: Translations, key: string): T | null {
  const parts = key.split('.')
  let value: string | number | boolean | Translations | PluralTranslations | unknown | null = translations

  for (let i = 0; i < parts.length; i++) {
    if (value && typeof value === 'object' && parts[i] in value) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      value = value[parts[i]]
    }
    else {
      return null
    }
  }

  if (typeof value === 'object' && value !== null) {
    return deepClone(value) as T
  }

  return value as T ?? null
}

/**
 * Интерполяция строки с параметрами.
 */
function interpolate(template: string, params: Record<string, string | number | boolean>): string {
  return template.replace(/\{(\w+)\}/g, (_, match) => {
    return params[match] !== undefined ? String(params[match]) : `{${match}}`
  })
}

/**
 * Получение множественной формы перевода.
 */
function getPluralTranslation(translations: Translations, key: string): string | null {
  return getTranslation<string>(translations, key)
}

/**
 * Загрузка переводов для конкретной локали и маршрута.
 */
async function loadTranslations(locale: string, routeName: string, translationDir: string): Promise<void> {
  try {
    if (!generalLocaleCache[locale]) {
      const translations = await import(`~/${translationDir}/${locale}.json`)
      generalLocaleCache[locale] = { ...translations.default }
    }

    if (!routeLocaleCache[`${locale}:${routeName}`]) {
      const translations = await import(`~/${translationDir}/pages/${routeName}/${locale}.json`)
      routeLocaleCache[`${locale}:${routeName}`] = { ...translations.default }
    }
  }
  catch (error) {
    console.error(`Error loading translations for ${locale} and ${routeName}:`, error)
  }
}

/**
 * Объединение новой порции переводов с существующими.
 */
function mergeTranslations(routeName: string, locale: string, newTranslations: Translations): void {
  routeLocaleCache[`${locale}:${routeName}`] = {
    ...generalLocaleCache[locale],
    ...newTranslations,
  }
}

/**
 * Переключение текущей локали и перенаправление на новый локализованный маршрут.
 */
// eslint-disable-next-line @typescript-eslint/no-invalid-void-type
function switchLocale(locale: string, route: RouteLocationNormalizedLoaded, router: Router, i18nConfig: State): Promise<NavigationFailure | null | undefined | void> {
  const checkLocale = i18nConfig.locales?.find(l => l.code === locale)

  if (!checkLocale) {
    console.warn(`Locale ${locale} is not available`)
    return Promise.reject(`Locale ${locale} is not available`)
  }

  const { defaultLocale } = i18nConfig
  const routeName = (route.name as string).replace(`localized-`, '')

  const newRouteName = locale !== defaultLocale || i18nConfig.includeDefaultLocaleRoute ? `localized-${routeName}` : routeName
  const newParams = { ...route.params }
  delete newParams.locale

  if (locale !== defaultLocale || i18nConfig.includeDefaultLocaleRoute) {
    newParams.locale = locale
  }
  return router.push({ name: newRouteName, params: newParams })
}

/**
 * Получение локализованного маршрута.
 */
function getLocalizedRoute(to: RouteLocationRaw, router: Router, route: RouteLocationNormalizedLoaded, i18nConfig: State, locale?: string): RouteLocationRaw {
  const { defaultLocale } = i18nConfig
  const currentLocale = (locale || route.params.locale || defaultLocale)!.toString()

  const selectRoute = router.resolve(to)

  const routeName = (selectRoute.name as string).replace(`localized-`, '')
  const newRouteName = currentLocale !== defaultLocale || i18nConfig.includeDefaultLocaleRoute ? `localized-${routeName}` : routeName
  const newParams = { ...route.params }
  delete newParams.locale

  if (currentLocale !== defaultLocale || i18nConfig.includeDefaultLocaleRoute) {
    newParams.locale = currentLocale
  }

  return router.resolve({ name: newRouteName, params: newParams })
}

export default defineNuxtPlugin(async (_nuxtApp) => {
  const router = useRouter()
  const route = useRoute()
  const config = useRuntimeConfig()
  const i18nConfig: State = config.public.i18nConfig as State

  const initialLocale = (route.params?.locale ?? i18nConfig.defaultLocale).toString()
  const initialRouteName = (route.name as string).replace(`localized-`, '')

  const plural = new Function('return ' + i18nConfig.plural)()

  router.beforeEach(async (to, from, next) => {
    const locale = (to.params?.locale ?? i18nConfig.defaultLocale).toString()
    const routeName = (to.name as string).replace(`localized-`, '')

    if (!routeLocaleCache[`${locale}:${routeName}`]) {
      await loadTranslations(locale, routeName, i18nConfig.translationDir!)
    }

    next()
  })

  await loadTranslations(initialLocale, initialRouteName, i18nConfig.translationDir!)

  return {
    provide: {
      getLocale: () => {
        const route = useRoute()
        return (route.params?.locale ?? i18nConfig.defaultLocale).toString()
      },
      getLocales: () => i18nConfig.locales || [],
      t: <T extends Record<string, string | number | boolean>>(
        key: string,
        params?: T,
        defaultValue?: string,
      ): string | number | boolean | Translations | PluralTranslations | unknown[] | unknown | null => {
        if (!key) {
          console.log(`$t: key not exist`)
          return ''
        }
        const route = useRoute()
        const locale = (route.params?.locale ?? i18nConfig.defaultLocale).toString()
        const cacheKey = locale + ':' + key

        if (i18nConfig.cache && translationCache.map.has(cacheKey)) {
          return translationCache.map.get(cacheKey) as string | number | boolean | Translations | PluralTranslations | unknown[] | unknown | null
        }

        const routeName = (route.name as string).replace(`localized-`, '')

        let value = getTranslation(routeLocaleCache[`${locale}:${routeName}`] ?? {}, key)
          || getTranslation(generalLocaleCache[locale] ?? {}, key)
          || dynamicTranslationsCaches.reduce((result, cache) => {
            return result || getTranslation(cache[locale] ?? {}, key)
          }, null as unknown)

        if (!value) {
          if (isDev && import.meta.client) {
            console.warn(`Not found '${key}' key in '${locale}' locale messages.`)
          }
          value = defaultValue || key
        }

        if (typeof value === 'string' && params) {
          value = interpolate(value, params)
        }

        if (i18nConfig.cache) {
          translationCache.map.set(cacheKey, value)
        }

        return value
      },
      tc: (key: string, count: number, defaultValue?: string): string => {
        if (!key) {
          console.log(`$tc: key not exist`)
          return ''
        }
        const route = useRoute()
        const locale = (route.params?.locale ?? i18nConfig.defaultLocale).toString()
        const cacheKey = locale + ':' + key + ':' + count
        if (i18nConfig.cache && translationCache.map.has(cacheKey)) {
          return translationCache.map.get(cacheKey) as string
        }
        const routeName = (route.name as string).replace(`localized-`, '')

        let translation = getPluralTranslation(routeLocaleCache[`${locale}:${routeName}`] ?? {}, key)
          || getPluralTranslation(generalLocaleCache[locale] ?? {}, key)
          || dynamicTranslationsCaches.reduce((result, cache) => {
            return result || getPluralTranslation(cache[locale] ?? {}, key)
          }, null as unknown)

        if (!translation) {
          if (isDev && import.meta.client) {
            console.warn(`Not found '${key}' key in '${locale}' locale messages.`)
          }
          translation = defaultValue || key
        }

        const value = plural(translation!.toString(), count, locale) as string

        if (i18nConfig.cache) {
          translationCache.map.set(cacheKey, value)
        }

        return value
      },
      mergeTranslations: (newTranslations: Translations) => {
        const route = useRoute()
        const routeName = (route.name as string).replace(`localized-`, '')
        const locale = (route.params?.locale ?? i18nConfig.defaultLocale).toString()
        mergeTranslations(routeName, locale, newTranslations)
      },
      switchLocale: (locale: string) => {
        const route = useRoute()
        switchLocale(locale, route, router, i18nConfig)
      },
      localeRoute: (to: RouteLocationRaw, locale?: string): RouteLocationRaw => {
        const route = useRoute()
        return getLocalizedRoute(to, router, route, i18nConfig, locale)
      },
    },
  }
})

export interface PluginsInjections {
  $getLocale: () => string
  $getLocales: () => string[]
  $t: <T extends Record<string, string | number | boolean>>(
    key: string,
    params?: T,
    defaultValue?: string
  ) => string | number | boolean | Translations | PluralTranslations | unknown[] | unknown | null
  $tc: (key: string, count: number, defaultValue?: string) => string
  $mergeTranslations: (newTranslations: Translations) => void
  $switchLocale: (locale: string) => void
  $localeRoute: (to: RouteLocationRaw, locale?: string) => RouteLocationRaw
  $loadPageTranslations: (locale: string, routeName: string) => Promise<void>
}

declare module '#app' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface NuxtApp extends PluginsInjections {}
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
declare module 'nuxt/dist/app/nuxt' {
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
