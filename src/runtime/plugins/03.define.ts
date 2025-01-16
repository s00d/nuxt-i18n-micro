import type { RouteLocationNormalizedLoaded } from 'vue-router'
import type { Translations } from 'nuxt-i18n-micro-core'
import type { ModuleOptionsExtend } from '../../types'
import { isNoPrefixStrategy, isPrefixStrategy } from '../helpers'
import { defineNuxtPlugin, navigateTo, useNuxtApp, useRuntimeConfig } from '#app'
import { useRoute, useRouter } from '#imports'

// Тип для локалей
type LocalesObject = Record<string, Translations>

export default defineNuxtPlugin(async (_nuxtApp) => {
  const config = useRuntimeConfig()
  const route = useRoute()
  const router = useRouter()

  const i18nConfig: ModuleOptionsExtend = config.public.i18nConfig as unknown as ModuleOptionsExtend

  // Функция нормализации, которая объединяет массивы и объекты в единый массив строк
  const normalizeLocales = (locales?: string[] | LocalesObject): LocalesObject => {
    if (Array.isArray(locales)) {
      // Если передан массив, преобразуем его в объект с пустыми значениями
      return locales.reduce((acc, locale) => {
        acc[locale] = {}
        return acc
      }, {} as LocalesObject)
    }
    else if (typeof locales === 'object' && locales !== null) {
      // Если передан объект, возвращаем его как есть
      return locales
    }
    return {}
  }

  // Логика для редиректа по умолчанию, используем как на сервере, так и на клиенте
  const handleRedirect = async (to: RouteLocationNormalizedLoaded) => {
    const currentLocale = (to.params.locale || i18nConfig.defaultLocale!).toString()
    const { name } = to

    let defaultRouteName = name?.toString()
      .replace('localized-', '')
      .replace(new RegExp(`-${currentLocale}$`), '')

    if (!to.params.locale) {
      if (router.hasRoute(`localized-${to.name?.toString()}-${currentLocale}`)) {
        defaultRouteName = `localized-${to.name?.toString()}-${currentLocale}`
      }
      else {
        defaultRouteName = `localized-${to.name?.toString()}`
      }

      if (!router.hasRoute(defaultRouteName)) {
        return
      }

      const newParams = { ...to.params }
      if (!isNoPrefixStrategy(i18nConfig.strategy!)) {
        newParams.locale = i18nConfig.defaultLocale!
      }

      return navigateTo({ name: defaultRouteName, params: newParams }, { redirectCode: 301, external: true })
    }
  }

  if (import.meta.server) {
    if (isPrefixStrategy(i18nConfig.strategy!)) {
      await handleRedirect(route)
    }
  }

  router.beforeEach(async (to, from, next) => {
    if (isPrefixStrategy(i18nConfig.strategy!)) {
      await handleRedirect(to)
    }
    if (next) {
      next()
    }
  })

  // Функция для определения i18n маршрута
  const defineI18nRoute = async (routeDefinition: {
    locales?: string[] | Record<string, Record<string, string>>
    localeRoutes?: Record<string, string>
  }) => {
    const currentLocale = (route.params.locale || i18nConfig.defaultLocale!).toString()
    const normalizedLocales = normalizeLocales(routeDefinition.locales)

    if (Object.values(normalizedLocales).length) {
      // Если текущая локаль есть в объекте locales
      if (normalizedLocales[currentLocale]) {
        const translation = normalizedLocales[currentLocale]
        const { $mergeGlobalTranslations } = useNuxtApp()
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        $mergeGlobalTranslations(translation)
      }

      // Если текущей локали нет в объекте locales
      if (!normalizedLocales[currentLocale]) {
        let defaultRouteName = route.name?.toString()
          .replace('localized-', '')
          .replace(new RegExp(`-${currentLocale}$`), '')
        const resolvedRoute = router.resolve({ name: defaultRouteName })
        const newParams = { ...route.params }
        delete newParams.locale

        if (isPrefixStrategy(i18nConfig.strategy!)) {
          if (router.hasRoute(`localized-${defaultRouteName}-${currentLocale}`)) {
            defaultRouteName = `localized-${defaultRouteName}-${currentLocale}`
          }
          else {
            defaultRouteName = `localized-${defaultRouteName}`
          }

          if (!router.hasRoute(defaultRouteName)) {
            return
          }

          newParams.locale = i18nConfig.defaultLocale!
          newParams.name = defaultRouteName
        }

        return router.push(resolvedRoute)
      }
    }
  }

  return {
    provide: {
      defineI18nRoute,
    },
  }
})
