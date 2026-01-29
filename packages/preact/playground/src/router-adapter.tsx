import { Link } from 'wouter-preact'
import type { I18nRoutingStrategy } from '@i18n-micro/preact'
import type { Locale } from '@i18n-micro/types'
import type React from 'react'

export function createWouterAdapter(
  locales: Locale[],
  defaultLocale: string,
  locationPath: string, // from useLocation()[0]
  navigate: (to: string, options?: { replace?: boolean }) => void, // from useLocation()[1]
): I18nRoutingStrategy {
  const localeCodes = locales.map(loc => loc.code)

  const resolvePath = (to: string | { path?: string }, locale: string): string | { path?: string } => {
    const path = typeof to === 'string' ? to : (to.path || '/')
    const pathSegments = path.split('/').filter(Boolean)
    const first = pathSegments[0]
    if (first !== undefined && localeCodes.includes(first)) {
      pathSegments.shift()
    }
    const cleanPath = '/' + pathSegments.join('/')
    return locale === defaultLocale ? cleanPath : `/${locale}${cleanPath === '/' ? '' : cleanPath}`
  }

  return {
    // Pass Wouter's Link component
    // Type assertion needed because wouter-preact Link type doesn't match React.ComponentType
    // but is compatible at runtime
    linkComponent: Link as unknown as React.ComponentType<{
      href: string
      children?: React.ReactNode
      style?: React.CSSProperties
      className?: string
      [key: string]: unknown
    }>,

    getCurrentPath: () => locationPath,

    push: target => navigate(target.path),

    replace: target => navigate(target.path, { replace: true }),

    resolvePath: (to, locale) => resolvePath(to, locale),

    getRoute: () => ({
      fullPath: locationPath,
      query: Object.fromEntries(new URLSearchParams(window.location.search)),
    }),
  }
}
