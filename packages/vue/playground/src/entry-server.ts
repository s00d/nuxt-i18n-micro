import { createSSRApp } from 'vue'
import { renderToString } from 'vue/server-renderer'
import App from './App.vue'
import { dirOf } from '../../../../benchmark/integrations/catalogue'
import { createRoutedApp } from './routed'

export async function render(url: string) {
  const { router, i18n } = createRoutedApp(url)
  const app = createSSRApp(App)
  app.use(router).use(i18n)
  await router.push(url)
  await router.isReady()
  const html = await renderToString(app)
  const locale = i18n.global.locale.value
  return { html, state: { locale, dir: dirOf(locale), route: router.currentRoute.value.path } }
}
