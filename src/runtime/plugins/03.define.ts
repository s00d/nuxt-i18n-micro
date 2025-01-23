import type { RouteLocationNormalizedLoaded } from 'vue-router'
import type { Ref, WatchHandle } from 'vue'
import type { ModuleOptionsExtend, Translations } from 'nuxt-i18n-micro-types'
import { isNoPrefixStrategy, isPrefixStrategy } from 'nuxt-i18n-micro-core'
import { defineNuxtPlugin, navigateTo, useRuntimeConfig } from '#app'
import { unref, useRoute, useRouter, useNuxtApp, watch, computed, onUnmounted } from '#imports'

type LocalesObject = Record<string, Translations>

export default defineNuxtPlugin(async (nuxtApp) => {
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
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const currentLocale = (nuxtApp as unknown).$getLocale().toString()
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
    locales?: string[] | LocalesObject
    localeRoutes?: Record<string, string>
  }) => {
    const { $getLocale } = useNuxtApp()
    let currentLocale: Ref<string> | null = computed(() => $getLocale())
    const normalizedLocales = normalizeLocales(routeDefinition.locales)

    const updateTranslations = () => {
      const currentLocaleValue = unref(currentLocale)
      if (currentLocaleValue && Object.values(normalizedLocales).length) {
        if (normalizedLocales[currentLocaleValue]) {
          const translation = normalizedLocales[currentLocaleValue]
          const { $mergeGlobalTranslations } = useNuxtApp()
          if ($mergeGlobalTranslations) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            $mergeGlobalTranslations(translation)
          }
        }
      }
    }

    updateTranslations()

    if (import.meta.client) {
      let stopWatcher: WatchHandle | null = watch(currentLocale, updateTranslations)
      onUnmounted(() => {
        if (stopWatcher) {
          stopWatcher()
          currentLocale = null
          stopWatcher = null
        }
      })
    }
  }

  return {
    provide: {
      defineI18nRoute,
    },
  }
})
