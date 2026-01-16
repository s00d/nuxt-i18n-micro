import type { I18nRoutingStrategy } from './types'
import type { Locale } from '@i18n-micro/types'

/**
 * Создает адаптер для работы с History API (универсальный для Pure Preact)
 * Работает с любым роутером, который использует History API (wouter, preact-router, и т.д.)
 */
export function createBrowserHistoryAdapter(
  locales: Locale[],
  defaultLocale: string,
): I18nRoutingStrategy {
  const localeCodes = locales.map(loc => loc.code)

  /**
   * Path resolution logic (add prefix or not)
   */
  const resolvePath = (to: string | { path?: string }, locale: string): string | { path?: string } => {
    const path = typeof to === 'string' ? to : (to.path || '/')
    const pathSegments = path.split('/').filter(Boolean)

    // If path already starts with a locale, remove it
    if (pathSegments.length > 0 && localeCodes.includes(pathSegments[0])) {
      pathSegments.shift()
    }

    const cleanPath = '/' + pathSegments.join('/')

    // If default locale - return clean path
    if (locale === defaultLocale) {
      return cleanPath
    }

    // Otherwise add prefix
    return `/${locale}${cleanPath === '/' ? '' : cleanPath}`
  }

  return {
    // Just render <a>, navigation will be intercepted by onClick in I18nLink
    linkComponent: undefined,

    getCurrentPath: () => {
      if (typeof window !== 'undefined') {
        return window.location.pathname
      }
      return '/'
    },

    push: (target) => {
      if (typeof window !== 'undefined') {
        window.history.pushState({}, '', target.path)
        // Dispatch event so routers (wouter/preact-router) know about the change
        window.dispatchEvent(new Event('popstate'))
      }
    },

    replace: (target) => {
      if (typeof window !== 'undefined') {
        window.history.replaceState({}, '', target.path)
        window.dispatchEvent(new Event('popstate'))
      }
    },

    resolvePath: (to, locale) => resolvePath(to, locale),

    getRoute: () => {
      if (typeof window !== 'undefined') {
        return {
          fullPath: window.location.pathname + window.location.search,
          query: Object.fromEntries(new URLSearchParams(window.location.search)),
        }
      }
      return {
        fullPath: '/',
        query: {},
      }
    },
  }
}

// Export for backward compatibility (old name)
export const createPreactRouterAdapter = createBrowserHistoryAdapter
