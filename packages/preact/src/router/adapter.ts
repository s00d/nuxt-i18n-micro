import { localizedPath, routeQuery } from '@i18n-micro/core'
import type { Locale } from '@i18n-micro/types'
import type { I18nRoutingStrategy } from '../../../react/src/injection'

/** Tells routers on the History API (wouter, preact-router) that the URL changed. */
function go(method: 'pushState' | 'replaceState', path: string): void {
  if (typeof window === 'undefined') return
  window.history[method]({}, '', path)
  window.dispatchEvent(new Event('popstate'))
}

type Place = Pick<Location, 'pathname' | 'search' | 'hash'>

const SSR_URL = /^(?:[a-z][a-z\d+.-]*:\/\/[^/?#]*)?([^?#]+)?(\?[^#]*)?(#.*)?$/is

/** The parts of a request's URL as `location` has them. A Fetch runtime's `request.url` is absolute: its origin is no part of a page. */
function ssrPlace(url: string): Place {
  const [, pathname = '/', search = '', hash = ''] = SSR_URL.exec(url)!
  return { pathname, search, hash }
}

/**
 * Adapter over the History API, for any router built on it (wouter, preact-router...). Links render
 * as `<a>`; `I18nLink` takes over plain clicks. A server has no address bar: pass the request's URL as
 * `ssrUrl`, so links and the switcher render for that page. In a browser the address bar wins.
 */
export function createBrowserHistoryAdapter(locales: Locale[], defaultLocale: string, ssrUrl = '/'): I18nRoutingStrategy {
  const codes = locales.map((locale) => locale.code)
  const ssr = ssrPlace(ssrUrl)
  const here = (): Place => (typeof window === 'undefined' ? ssr : window.location)
  const fullPath = () => {
    const { pathname, search, hash } = here()
    return `${pathname}${search}${hash}`
  }

  return {
    getCurrentPath: fullPath,
    push: (target) => go('pushState', target.path),
    replace: (target) => go('replaceState', target.path),
    resolvePath: (to, locale) => localizedPath(to, locale, codes, defaultLocale),
    getRoute: () => ({ fullPath: fullPath(), query: routeQuery(here().search) }),
  }
}
