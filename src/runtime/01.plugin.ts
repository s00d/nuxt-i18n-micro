import type { RouteLocationNormalizedLoaded, RouteLocationRaw, Router, RouteRecordName } from 'vue-router'
import { defineNuxtPlugin, useRuntimeConfig } from '#app'
import { useRoute, useRouter, watch } from '#imports'
import type { ModuleOptions } from '~/src/module'

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
}

// Кэш для хранения переводов
const generalLocaleCache: { [key: string]: Translations } = {}
const routeLocaleCache: { [key: string]: Translations } = {}
const dynamicTranslationsCaches: { [key: string]: Translations }[] = []

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
  // if (Object.prototype.hasOwnProperty.call(translations, key)) {
  //   const value = translations[key]
  //   // If the value is an object or an array, clone it to avoid mutation
  //   if (typeof value === 'object' && value !== null) {
  //     return deepClone(value) as T
  //   }
  //
  //   return value as T
  // }

  const value = key.split('.').reduce<Translations | T | undefined>((acc, part) => {
    if (typeof acc === 'object' && acc !== null && part in acc) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      return acc[part] as Translations | T
    }
    return undefined
  }, translations)

  if (value && typeof value === 'object') {
    return deepClone(value) as T
  }

  return (value as T) ?? null
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
      const translations = await import(`~/${translationDir}/pages/${routeName}_${locale}.json`)
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
function switchLocale(locale: string, route: RouteLocationNormalizedLoaded, router: Router, i18nConfig: State): void {
  const checkLocale = i18nConfig.locales?.find(l => l.code === locale)

  if (!checkLocale) {
    console.warn(`Locale ${locale} is not available`)
    return
  }

  const { defaultLocale } = i18nConfig
  const currentLocale = route.params.locale || defaultLocale
  let routeName = route.name as string

  if (currentLocale !== defaultLocale) {
    routeName = routeName.replace(`localized-`, '')
  }

  const newRouteName = locale === defaultLocale ? routeName : `localized-${routeName}`
  const newParams = { ...route.params }
  delete newParams.locale

  if (locale !== defaultLocale) {
    newParams.locale = locale
  }

  window.location.href = router.resolve({ name: newRouteName, params: newParams }).fullPath
}

/**
 * Получение локализованного маршрута.
 */
function getLocalizedRoute(to: RouteLocationRaw, router: Router, route: RouteLocationNormalizedLoaded, i18nConfig: State): RouteLocationRaw {
  const { defaultLocale } = i18nConfig
  const currentLocale = (route.params.locale || defaultLocale)!.toString()

  let resolvedRoute = router.resolve(to)

  if (typeof to === 'object' && 'name' in to) {
    resolvedRoute = router.resolve({ name: to.name, params: to.params, query: to.query, hash: to.hash })
    delete resolvedRoute.params.locale

    if (resolvedRoute.name) {
      resolvedRoute.name = currentLocale === defaultLocale
        ? (resolvedRoute.name as string).replace(`localized-`, '') as RouteRecordName
        : (`localized-${resolvedRoute.name.toString()}` as string) as RouteRecordName

      if (defaultLocale !== currentLocale) {
        resolvedRoute.params.locale = currentLocale
      }
    }
  }

  return resolvedRoute
}

export default defineNuxtPlugin(async (_nuxtApp) => {
  const router = useRouter()
  const route = useRoute()
  const config = useRuntimeConfig()
  const i18nConfig: State = config.public.i18nConfig as State

  const initialLocale = (route.params?.locale ?? i18nConfig.defaultLocale).toString()
  const initialRouteName = (route.name as string).replace(`localized-`, '')

  await loadTranslations(initialLocale, initialRouteName, i18nConfig.translationDir!)

  let init = false
  watch(route, async () => {
    if (!init) {
      init = true
      return
    }
    const locale = (route.params?.locale ?? i18nConfig.defaultLocale).toString()
    const routeName = (route.name as string).replace(`localized-`, '')
    await loadTranslations(locale, routeName, i18nConfig.translationDir!)
  }, { immediate: true })

  return {
    provide: {
      getLocale: () => (route.params?.locale ?? i18nConfig.defaultLocale).toString(),
      getLocales: () => i18nConfig.locales || [],
      t: <T extends Record<string, string | number | boolean>>(
        key: string,
        params?: T,
        defaultValue?: string,
      ): string | number | boolean | Translations | PluralTranslations | unknown[] | unknown | null => {
        const locale = (route.params?.locale ?? i18nConfig.defaultLocale).toString()
        const routeName = (route.name as string).replace(`localized-`, '')

        let value = getTranslation(routeLocaleCache[`${locale}:${routeName}`] ?? {}, key)
          || getTranslation(generalLocaleCache[locale] ?? {}, key)
          || dynamicTranslationsCaches.reduce((result, cache) => {
            return result || getTranslation(cache[locale] ?? {}, key)
          }, null as unknown)

        if (!value) {
          value = defaultValue || key
        }

        if (typeof value === 'string' && params) {
          value = interpolate(value, params)
        }

        return value
      },
      tc: (key: string, count: number, defaultValue?: string): string => {
        const locale = (route.params?.locale ?? i18nConfig.defaultLocale).toString()
        const routeName = (route.name as string).replace(`localized-`, '')

        let translation = getPluralTranslation(routeLocaleCache[`${locale}:${routeName}`] ?? {}, key)
          || getPluralTranslation(generalLocaleCache[locale] ?? {}, key)
          || dynamicTranslationsCaches.reduce((result, cache) => {
            return result || getPluralTranslation(cache[locale] ?? {}, key)
          }, null as unknown)

        if (!translation) {
          translation = defaultValue || key
        }

        const forms = translation!.toString().split('|')
        if (count === 0 && forms.length > 2) {
          return forms[0].trim() // Case for "no apples"
        }
        if (count === 1 && forms.length > 1) {
          return forms[1].trim() // Case for "one apple"
        }
        return (forms.length > 2 ? forms[2].trim() : forms[forms.length - 1].trim()).replace('{count}', count.toString()) // Case for "multiple apples"
      },
      mergeTranslations: (newTranslations: Translations) => {
        const routeName = (route.name as string).replace(`localized-`, '')
        const locale = (route.params?.locale ?? i18nConfig.defaultLocale).toString()
        mergeTranslations(routeName, locale, newTranslations)
      },
      switchLocale: (locale: string) => {
        switchLocale(locale, route, router, i18nConfig)
      },
      localeRoute: (to: RouteLocationRaw): RouteLocationRaw => {
        return getLocalizedRoute(to, router, route, i18nConfig)
      },
    },
  }
})
