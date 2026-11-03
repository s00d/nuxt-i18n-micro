// The router half of the app: kept out of the no-router build by a dynamic import.
import { createVueRouterAdapter } from '@i18n-micro/vue/router'
import { createMemoryHistory, createRouter, createWebHistory } from 'vue-router'
import { localeCodes, localeOfPath, routeOfPath } from '../../../../benchmark/integrations/catalogue'
import { createBenchI18n, defaultLocale, localesConfig } from './app-config'
import Big from './pages/Big.vue'
import Cases from './pages/Cases.vue'
import Components from './pages/Components.vue'
import Dictionaries from './pages/Dictionaries.vue'
import NotFound from './pages/NotFound.vue'
import Routing from './pages/Routing.vue'

const pages = [
  { path: '', name: 'home', component: Cases },
  { path: 'components', name: 'components', component: Components },
  { path: 'dictionaries', name: 'dictionaries', component: Dictionaries },
  { path: 'routing', name: 'routing', component: Routing },
  { path: 'big', name: 'big', component: Big },
]

const prefix = `/:locale(${localeCodes.join('|')})`

export const routes = [
  ...pages.map(({ path, name, component }) => ({ path: `/${path}`, name, component })),
  ...pages.map(({ path, name, component }) => ({ path: `${prefix}${path ? `/${path}` : ''}`, name: `${name}-prefixed`, component })),
  { path: '/:rest(.*)*', name: 'not-found', component: NotFound },
]

export function createRoutedApp(ssrUrl?: string) {
  const router = createRouter({ history: ssrUrl === undefined ? createWebHistory() : createMemoryHistory(), routes })
  const strategy = createVueRouterAdapter(router, localesConfig, defaultLocale)
  const i18n = createBenchI18n(localeOfPath(ssrUrl ?? window.location.pathname), strategy)
  // the locale comes from the URL; a route's name selects its dictionary
  router.beforeEach((to) => {
    i18n.global.locale.value = localeOfPath(to.path)
    i18n.global.setRoute(routeOfPath(to.path))
  })
  return { router, i18n }
}
