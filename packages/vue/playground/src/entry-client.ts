import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { createI18n } from '@i18n-micro/vue'
import App from './App.vue'
import { routes, defaultLocale, localesConfig } from './app-config'
import { createVueRouterAdapter } from './router-adapter'
import { loadTranslations, setupApp, preloadTranslations } from './app-utils'

console.log('[playground] entry-client.ts: All imports loaded')

console.log('[playground] entry-client.ts: Creating router')
const router = createRouter({
  history: createWebHistory(),
  routes,
})
console.log('[playground] entry-client.ts: Router created')

// Initialize app
async function initApp() {
  console.log('[playground] initApp: Starting initialization')

  // Get initial state from SSR (if available)
  const initialState = (window as { __INITIAL_STATE__?: { locale?: string } }).__INITIAL_STATE__
  // Ensure locale is a string, not an object
  const initialLocale = typeof initialState?.locale === 'string'
    ? initialState.locale
    : defaultLocale

  console.log('[playground] initApp: Initial locale:', initialLocale)

  // Create adapter BEFORE creating i18n instance
  // Note: router.isReady() will be called after app is created and router is installed
  const routingStrategy = createVueRouterAdapter(
    router,
    localesConfig,
    defaultLocale,
  )

  // Create I18n instance with routingStrategy
  const i18n = createI18n({
    locale: initialLocale,
    fallbackLocale: defaultLocale,
    messages: {
      [initialLocale]: {},
    },
    routingStrategy,
  })

  // Load initial locale translations
  await loadTranslations(i18n.global, initialLocale)

  // Preload other locales in background
  await preloadTranslations(i18n.global, initialLocale)

  const app = createApp(App)
  setupApp(app, i18n, router)

  console.log('[playground] App setup complete, waiting for router...')
  console.log('[playground] i18n instance:', i18n)
  console.log('[playground] router:', router)

  // Wait for router to be ready after it's installed
  await router.isReady()
  console.log('[playground] Router is ready')

  // Mount the application (hydrate if SSR)
  app.mount('#app')

  console.log('[playground] App mounted')
}

// Start the app
console.log('[playground] entry-client.ts: Calling initApp()')
initApp().catch((error) => {
  console.error('[playground] initApp failed:', error)
})
