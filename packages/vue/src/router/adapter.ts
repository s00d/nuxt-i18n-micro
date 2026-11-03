import { localizedPath } from '@i18n-micro/core'
import type { Locale } from '@i18n-micro/types'
import type { RouteLocationRaw, Router } from 'vue-router'
import { RouterLink } from 'vue-router'
import type { I18nRoutingStrategy, I18nRouteTarget } from './types'

/**
 * Factory for Vue Router adapter
 * Implements routing utilities for Vue Router
 * Uses vue-router APIs for navigation and path resolution
 */
export function createVueRouterAdapter(router: Router, locales: Locale[], defaultLocale: string): I18nRoutingStrategy {
  const localeCodes = locales.map((loc) => loc.code)

  /** A target as a URL: a location goes through the router, so `name`, `query` and `hash` count. */
  const urlOf = (to: I18nRouteTarget): string => {
    // `{}` names no target: the router would answer this page
    if (typeof to !== 'string') return to.path || to.name || to.params || to.query || to.hash ? router.resolve(to as RouteLocationRaw).fullPath : '/'
    // `#top`, `?x=1`: relative to this page
    return to[0] === '?' || to[0] === '#' ? `${router.currentRoute.value.path}${to}` : to
  }

  /** As in the other router bindings: the query and hash stay as they are. */
  const resolvePath = (to: I18nRouteTarget, locale: string): string => localizedPath(urlOf(to), locale, localeCodes, defaultLocale)

  return {
    linkComponent: RouterLink,

    getCurrentPath: () => {
      // currentRoute in Vue Router is reactive
      return router.currentRoute.value.path
    },

    push: (target: { path: string }) => {
      router.push(target.path).catch(() => {})
    },

    replace: (target: { path: string }) => {
      router.replace(target.path).catch(() => {})
    },

    resolvePath,

    getRoute: () => ({
      fullPath: router.currentRoute.value.fullPath,
      query: router.currentRoute.value.query,
    }),
  }
}
