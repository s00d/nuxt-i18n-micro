import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { createI18n, setupRouterIntegration, I18nLocalesKey, I18nDefaultLocaleKey, setupVueDevTools } from '@i18n-micro/vue'
import type { Locale } from '@i18n-micro/types'
import App from './App.vue'
import Home from './pages/Home.vue'
import About from './pages/About.vue'
import Components from './pages/Components.vue'

const localesConfig: Locale[] = [
  { code: 'en', displayName: 'English', iso: 'en-US' },
  { code: 'fr', displayName: 'Français', iso: 'fr-FR' },
  { code: 'de', displayName: 'Deutsch', iso: 'de-DE' },
]

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/about', component: About },
    { path: '/components', component: Components },
    { path: '/:locale', component: Home },
    { path: '/:locale/about', component: About },
    { path: '/:locale/components', component: Components },
  ],
})

const i18n = createI18n({
  locale: 'en',
  fallbackLocale: 'en',
  messages: {
    en: {},
  },
})

// Async load translations
async function loadTranslations(locale: string) {
  try {
    const messages = await import(`./locales/${locale}.json`)
    i18n.global.addTranslations(locale, messages.default, false)
  }
  catch (error) {
    console.error(`Failed to load translations for locale: ${locale}`, error)
  }
}

// Helper to restore saves from DevTools (localStorage persistence)
function restoreDevToolsSaves(i18nInstance: typeof i18n.global) {
  if (typeof localStorage === 'undefined') return

  const keys = Object.keys(localStorage)
  keys.forEach((key) => {
    if (key.startsWith('i18n_v_save_')) {
      try {
        const filePath = key.replace('i18n_v_save_', '')
        const content = JSON.parse(localStorage.getItem(key) || '{}')

        // Parse file path similar to bridge save logic
        // 1. Check for pages: pages/{routeName}/{locale}.json
        const pageMatch = filePath.match(/^pages\/([^/]+)\/([^/]+)\.json$/)
        if (pageMatch) {
          const [, routeName, locale] = pageMatch
          if (routeName && locale) {
            i18nInstance.addRouteTranslations(locale, routeName, content, false)
            console.log(`[playground] Restored page translation: ${routeName} (${locale})`)
          }
        }
        else {
          // 2. Check for global: {locale}.json
          const globalMatch = filePath.match(/^([^/]+)\.json$/)
          if (globalMatch) {
            const [, locale] = globalMatch
            if (locale) {
              i18nInstance.addTranslations(locale, content, false)
              console.log(`[playground] Restored global translation: ${locale}`)
            }
          }
        }
      }
      catch (e) {
        console.error(`[playground] Failed to restore ${key}:`, e)
      }
    }
  })
}

// Initialize app
async function initApp() {
  // Load initial locale
  await loadTranslations('en')

  // Preload other locales in background
  Promise.all([
    loadTranslations('fr'),
    loadTranslations('de'),
  ]).catch(() => {
    // Ignore errors for preloading
  })

  const app = createApp(App)
  app.use(router)
  app.use(i18n)

  // Restore DevTools saves from localStorage (before router integration)
  restoreDevToolsSaves(i18n.global)

  // Setup router integration and store unwatch function
  const unwatchRouterIntegration = setupRouterIntegration({
    router,
    i18n: i18n.global,
    defaultLocale: 'en',
    locales: ['en', 'fr', 'de'],
  })

  // Cleanup on app unmount (for SPA this is optional, but good practice)
  app.onUnmount(() => {
    unwatchRouterIntegration()
  })

  // Provide locales configuration for useI18n composable
  app.provide(I18nLocalesKey, localesConfig)
  app.provide(I18nDefaultLocaleKey, 'en')

  // Setup Vue DevTools integration
  setupVueDevTools({
    i18n: i18n.global,
    locales: localesConfig,
    defaultLocale: 'en',
    translationDir: 'src/locales',
  })

  // IMPORTANT: Wait for router to determine current route from URL
  // This ensures that router.currentRoute is correct (/fr) before mounting
  // and setupRouterIntegration will pick it up correctly
  await router.isReady()

  // Only now mount the application
  // At this point router.currentRoute will be correct, and setupRouterIntegration
  // will have already synced the locale from the URL
  app.mount('#app')
}

// Start the app
initApp()
