import type { Locale } from '@i18n-micro/types'
import Home from './pages/Home.vue'
import About from './pages/About.vue'
import Components from './pages/Components.vue'

export const localesConfig: Locale[] = [
  { code: 'en', displayName: 'English', iso: 'en-US' },
  { code: 'fr', displayName: 'Français', iso: 'fr-FR' },
  { code: 'de', displayName: 'Deutsch', iso: 'de-DE' },
]

export const routes = [
  { path: '/', component: Home },
  { path: '/about', component: About },
  { path: '/components', component: Components },
  { path: '/:locale', component: Home },
  { path: '/:locale/about', component: About },
  { path: '/:locale/components', component: Components },
]

export const defaultLocale = 'en'
