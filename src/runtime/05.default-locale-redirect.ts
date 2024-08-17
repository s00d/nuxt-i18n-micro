import { defineNuxtPlugin, navigateTo } from '#app'
import type { ModuleOptions } from '~/src/module'
import { useRoute, useRouter, watch, computed } from '#imports'

interface State extends ModuleOptions {
  rootDir: string
}

export default defineNuxtPlugin(async ({ $config }) => {
  const i18nConfig = $config.public.i18nConfig as State

  const router = useRouter()
  const route = useRoute()

  if (!route.params?.locale) {
    const routeName = route.name as string
    const newRouteName = `localized-${routeName}`
    const newParams = { ...route.params, locale: i18nConfig.defaultLocale }

    if (import.meta.client) {
      location.href = router.resolve({ name: newRouteName, params: newParams }).href
    }
    else {
      await navigateTo({ name: newRouteName, params: newParams }, { redirectCode: 301 })
    }
  }

  if (import.meta.client) {
    const routeName = computed(() => route.name)
    watch(routeName, async () => {
      if (!route.params?.locale) {
        const routeName = route.name as string
        const newRouteName = `localized-${routeName}`
        const newParams = { ...route.params, locale: i18nConfig.defaultLocale }
        // location.href = router.resolve({ name: newRouteName, params: newParams }).href
        await navigateTo({ name: newRouteName, params: newParams }, { redirectCode: 301 })
      }
    })
  }
})
