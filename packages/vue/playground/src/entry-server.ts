import { renderToString } from 'vue/server-renderer'
import { createSSRApp } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import { createI18n } from '@i18n-micro/vue'
import App from './App.vue'
import { routes, defaultLocale, localesConfig } from './app-config'
import { createVueRouterAdapter } from './router-adapter'
import { loadTranslations, setupApp } from './app-utils'

export async function render(url: string) {
  console.log('[SSR] render() called with URL:', url)

  // Create router with memory history for SSR
  const router = createRouter({
    history: createMemoryHistory(),
    routes,
  })
  console.log('[SSR] Router created')

  // Set the router to the requested URL
  router.push(url)
  console.log('[SSR] Router pushed URL, waiting for ready...')
  await router.isReady()
  console.log('[SSR] Router is ready')

  // Determine current locale from URL
  const route = router.currentRoute.value
  const localeParam = route.params.locale as string | undefined
  const localeCodes = localesConfig.map(locale => locale.code)
  const currentLocale = localeParam && localeCodes.includes(localeParam) ? localeParam : defaultLocale

  // Create adapter BEFORE creating i18n instance
  const routingStrategy = createVueRouterAdapter(
    router,
    localesConfig,
    defaultLocale,
  )

  // Create i18n instance with routingStrategy
  const i18n = createI18n({
    locale: currentLocale,
    fallbackLocale: defaultLocale,
    messages: {
      [currentLocale]: {},
    },
    routingStrategy,
  })

  // Load translations for current locale
  await loadTranslations(i18n.global, currentLocale)

  // Preload fallback locale if different
  if (currentLocale !== defaultLocale) {
    await loadTranslations(i18n.global, defaultLocale)
  }

  // Create app instance
  console.log('[SSR] Creating app instance')
  const app = createSSRApp(App)
  setupApp(app, i18n, router)
  console.log('[SSR] App setup complete')

  // Render to string
  console.log('[SSR] Rendering to string...')
  const html = await renderToString(app)
  console.log('[SSR] Render complete, HTML length:', html.length)
  console.log('[SSR] HTML preview:', html.substring(0, 200))

  // Get current locale for state (i18n.global.locale is a Ref, so use .value)
  const finalLocale = i18n.global.locale.value || String(i18n.global.locale.value)

  // Return only serializable data
  const result = {
    html,
    state: {
      locale: finalLocale,
      route: String(route.path),
    },
  }
  console.log('[SSR] Returning result:', { htmlLength: html.length, state: result.state })
  return result
}
