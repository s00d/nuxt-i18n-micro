import type { ModuleOptions } from '../../module'
import { defineNuxtPlugin, useRuntimeConfig } from '#app'
import { useRoute, useRouter } from '#imports'

interface State extends ModuleOptions {
  rootDir: string
}

export default defineNuxtPlugin((_nuxtApp) => {
  const config = useRuntimeConfig()
  const route = useRoute()
  const router = useRouter()

  const i18nConfig: State = config.public.i18nConfig as State

  // Функция для определения i18n маршрута
  const defineI18nRoute = (routeDefinition: { locales?: string[] }) => {
    const currentLocale = (route.params.locale || i18nConfig.defaultLocale!).toString()
    const { locales } = routeDefinition
    const { name } = route

    // Проверяем, если текущая локаль не входит в допустимые локали
    if (locales && !locales.includes(currentLocale)) {
      // Если локаль не допустима, перенаправляем на дефолтную локаль
      let defaultRouteName = name?.toString().replace('localized-', '')
      const resolvedRoute = router.resolve({ name: defaultRouteName })
      const newParams = { ...route.params }
      delete newParams.locale

      if (i18nConfig.includeDefaultLocaleRoute) {
        defaultRouteName = `localized-${defaultRouteName}`
        newParams.locale = i18nConfig.defaultLocale!
      }

      return router.push(resolvedRoute)
    }
  }

  // Предоставляем функцию в Nuxt контексте
  return {
    provide: {
      defineI18nRoute,
    },
  }
})
