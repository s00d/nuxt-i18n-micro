import { createApp, createSSRApp } from 'vue'
import { persisted } from '../../../../benchmark/integrations/catalogue'
import App from './App.vue'
import { createBenchI18n, defaultLocale } from './app-config'

const ssr = (window as { __INITIAL_STATE__?: unknown }).__INITIAL_STATE__ !== undefined
const app = ssr ? createSSRApp(App) : createApp(App)

if (import.meta.env.VITE_ROUTER === '0') {
  app.use(createBenchI18n(persisted.read() ?? defaultLocale))
} else {
  const { createRoutedApp } = await import('./routed')
  const { router, i18n } = createRoutedApp()
  app.use(router).use(i18n)
  await router.isReady()
}
app.mount('#app')
