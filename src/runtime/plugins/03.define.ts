import type { ModuleOptionsExtend } from '../../types'
import type { Translations } from '../plugins/01.plugin'
import { defineNuxtPlugin, navigateTo, useNuxtApp, useRuntimeConfig } from '#app'
import { useRoute, useRouter } from '#imports'

// Тип для локалей
type LocalesObject = Record<string, Translations>

export default defineNuxtPlugin((_nuxtApp) => {
  const config = useRuntimeConfig()
  const route = useRoute()
  const router = useRouter()

  const i18nConfig: ModuleOptionsExtend = config.public.i18nConfig as ModuleOptionsExtend

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

  useRouter().beforeEach(async (to, from, next) => {
    if (i18nConfig.includeDefaultLocaleRoute) {
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

        const newParams = { ...to.params }
        newParams.locale = i18nConfig.defaultLocale!
        newParams.name = defaultRouteName

        await navigateTo({ name: defaultRouteName, params: newParams }, { redirectCode: 301, external: true })
      }
    }
    next()
  })

  // Функция для определения i18n маршрута
  const defineI18nRoute = async (routeDefinition: {
    locales?: string[] | Record<string, Record<string, string>>
    localeRoutes?: Record<string, string>
  }) => {
    const currentLocale = (route.params.locale || i18nConfig.defaultLocale!).toString()
    const normalizedLocales = normalizeLocales(routeDefinition.locales)

    // Если текущая локаль есть в объекте locales
    if (!Object.values(normalizedLocales).length || normalizedLocales[currentLocale]) {
      const translation = normalizedLocales[currentLocale]
      const nuxtApp = useNuxtApp()
      nuxtApp.$mergeTranslations(translation)
    }
  }

  // Предоставляем функцию в Nuxt контексте
  return {
    provide: {
      defineI18nRoute,
    },
  }
})
