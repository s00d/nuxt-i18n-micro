import type { NavigationFailure, RouteLocationNormalizedLoaded, RouteLocationRaw, Router } from 'vue-router'
import type { Locale, ModuleOptionsExtend } from '../../module'
import { useTranslationHelper } from '../translationHelper'
import { defineNuxtPlugin, useRuntimeConfig } from '#app'
import { useRoute, useRouter } from '#imports'

const i18nHelper = useTranslationHelper()

const isDev = process.env.NODE_ENV !== 'production'

// Интерфейс для переводов, поддерживающий разные типы данных
export interface Translations {
  [key: string]: string | number | boolean | Translations | PluralTranslations | unknown[] | null
}

interface PluralTranslations {
  singular: string
  plural: string
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
 * Переключение текущей локали и перенаправление на новый локализованный маршрут.
 */
// eslint-disable-next-line @typescript-eslint/no-invalid-void-type
function switchLocale(locale: string, route: RouteLocationNormalizedLoaded, router: Router, i18nConfig: ModuleOptionsExtend): Promise<NavigationFailure | null | undefined | void> {
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
function getLocalizedRoute(to: RouteLocationRaw, router: Router, route: RouteLocationNormalizedLoaded, i18nConfig: ModuleOptionsExtend, locale?: string): RouteLocationRaw {
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

export default defineNuxtPlugin(async (nuxtApp) => {
  const router = useRouter()

  if (!nuxtApp.payload.data.translations) {
    nuxtApp.payload.data.translations = {}
  }

  if (import.meta.server) {
    nuxtApp.hook('app:rendered', async () => {
      if (import.meta.server) {
        const route = useRoute()
        const locale = (route.params?.locale ?? i18nConfig.defaultLocale).toString()

        const routeName = (route?.name ?? '').toString().replace(`localized-`, '')

        const cacheKey = `${locale}:${routeName}`
        nuxtApp.payload.data.translations[cacheKey] = i18nHelper.getCache(locale, routeName) ?? new Map<string, Translations | unknown>()
      }
    })
  }
  else {
    router.beforeEach(async (to, from, next) => {
      const locale = (to.params?.locale ?? i18nConfig.defaultLocale).toString()
      const routeName = (to.name as string).replace(`localized-`, '')
      const cacheKey = `${locale}:${routeName}`

      if (nuxtApp.payload.data.translations) {
        i18nHelper.setCache(locale, routeName, nuxtApp.payload.data.translations[cacheKey] || new Map<string, Translations | unknown>())
      }

      next()
    })
  }

  const route = useRoute()
  const config = useRuntimeConfig()
  const i18nConfig: ModuleOptionsExtend = config.public.i18nConfig as ModuleOptionsExtend

  const initialLocale = (route.params?.locale ?? i18nConfig.defaultLocale).toString()
  const initialRouteName = (route.name as string).replace(`localized-`, '')

  const plural = new Function('return ' + i18nConfig.plural)()

  router.beforeEach(async (to, from, next) => {
    if (import.meta.client) {
      const locale = (to.params?.locale ?? i18nConfig.defaultLocale).toString()
      const routeName = (to.name as string).replace(`localized-`, '')
      if (!i18nHelper.hasPageTranslation(locale, routeName)) {
        const data: Translations = await $fetch(`/_locales/${routeName}/${locale}/data.json`)
        await i18nHelper!.loadPageTranslations(locale, routeName, data ?? {})
      }
    }
    next()
  })

  const data: Translations = await $fetch(`/_locales/general/${initialLocale}/data.json`)
  await i18nHelper!.loadTranslations(initialLocale, initialRouteName, data ?? {})

  if (import.meta.server) {
    const locale = (route.params?.locale ?? i18nConfig.defaultLocale).toString()
    const routeName = (route.name as string).replace(`localized-`, '')
    const data: Translations = await $fetch(`/_locales/${routeName}/${locale}/data.json`)
    await i18nHelper!.loadPageTranslations(initialLocale, initialRouteName, data ?? {})
  }

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
        const routeName = (route.name as string).replace(`localized-`, '')

        let value = i18nHelper!.getTranslation(locale, routeName, key, !!i18nConfig.cache)

        if (!value) {
          if (isDev && import.meta.client) {
            console.warn(`Not found '${key}' key in '${locale}' locale messages.`)
          }
          value = defaultValue || key
        }

        if (typeof value === 'string' && params) {
          value = interpolate(value, params)
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
        const routeName = (route.name as string).replace(`localized-`, '')

        let translation = i18nHelper!.getTranslation(locale, routeName, key, !!i18nConfig.cache)

        if (!translation) {
          if (isDev && import.meta.client) {
            console.warn(`Not found '${key}' key in '${locale}' locale messages.`)
          }
          translation = defaultValue || key
        }

        return plural(translation!.toString(), count, locale) as string
      },
      has: (key: string): boolean => {
        const route = useRoute()
        const locale = (route.params?.locale ?? i18nConfig.defaultLocale).toString()
        const routeName = (route.name as string).replace(`localized-`, '')
        const translation = i18nHelper!.getTranslation(locale, routeName, key, !!i18nConfig.cache)

        return !!translation
      },
      mergeTranslations: (newTranslations: Translations) => {
        const route = useRoute()
        const routeName = (route.name as string).replace(`localized-`, '')
        const locale = (route.params?.locale ?? i18nConfig.defaultLocale).toString()
        i18nHelper.margeTranslation(locale, routeName, newTranslations)
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

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
declare module 'nuxt/dist/app/nuxt' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface NuxtApp extends PluginsInjections {}
}

declare module 'vue' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface ComponentCustomProperties extends PluginsInjections {}
}
