import { RouterLink, type Router } from 'vue-router'
import type { I18nRoutingStrategy } from '@i18n-micro/vue'
import type { Locale } from '@i18n-micro/types'

/**
 * Factory for router adapter
 * IMPORTANT: Accepts router instance, not calling useRouter()
 */
export function createVueRouterAdapter(
  router: Router, // <--- Vue Router instance
  locales: Locale[],
  defaultLocale: string,
): I18nRoutingStrategy {
  const localeCodes = locales.map(loc => loc.code)

  /**
   * Path resolution logic (add prefix or not)
   */
  const resolvePath = (to: string | { path?: string }, locale: string): string => {
    const path = typeof to === 'string' ? to : (to.path || '/')
    const pathSegments = path.split('/').filter(Boolean)

    // If path already starts with a locale, remove it
    const first = pathSegments[0]
    if (first !== undefined && localeCodes.includes(first)) {
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

    resolvePath: (to: string | { path?: string }, locale: string) => resolvePath(to, locale),

    getRoute: () => ({
      fullPath: router.currentRoute.value.fullPath,
      query: router.currentRoute.value.query,
    }),
  }
}
