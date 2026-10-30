import { localizedPath, routeQuery } from '@i18n-micro/core'
import type { Locale } from '@i18n-micro/types'
import type { I18nRoutingStrategy } from '../../../react/src/injection'

/** Tells routers on the History API (wouter, preact-router) that the URL changed. */
function go(method: 'pushState' | 'replaceState', path: string): void {
  if (typeof window === 'undefined') return
  window.history[method]({}, '', path)
  window.dispatchEvent(new Event('popstate'))
}

const here = (): Location | null => (typeof window === 'undefined' ? null : window.location)

/**
 * Adapter over the History API, for any router built on it (wouter, preact-router...). Links render
 * as `<a>`; `I18nLink` takes over plain clicks.
 */
export function createBrowserHistoryAdapter(locales: Locale[], defaultLocale: string): I18nRoutingStrategy {
  const codes = locales.map((locale) => locale.code)
  const fullPath = () => {
    const location = here()
    return location ? `${location.pathname}${location.search}${location.hash}` : '/'
  }

  return {
    getCurrentPath: fullPath,
    push: (target) => go('pushState', target.path),
    replace: (target) => go('replaceState', target.path),
    resolvePath: (to, locale) => localizedPath(to, locale, codes, defaultLocale),
    getRoute: () => ({ fullPath: fullPath(), query: routeQuery(here()?.search) }),
  }
}
