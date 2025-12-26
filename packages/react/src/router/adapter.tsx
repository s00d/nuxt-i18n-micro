import React from 'react'
import { Link } from 'react-router-dom'
import type { useNavigate, useLocation } from 'react-router-dom'
import type { I18nRoutingStrategy } from './types'
import type { Locale } from '@i18n-micro/types'

/**
 * Factory for React Router adapter
 * Implements routing utilities for React Router
 * Uses react-router-dom APIs for navigation and path resolution
 */
export function createReactRouterAdapter(
  locales: Locale[],
  defaultLocale: string,
  location: ReturnType<typeof useLocation>,
  navigate: ReturnType<typeof useNavigate>,
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
    linkComponent: ((props: {
      href: string
      children?: React.ReactNode
      className?: string
      style?: React.CSSProperties
      [key: string]: unknown
    }) => {
      const { href, children, className, style, ...restProps } = props
      return React.createElement(
        Link,
        {
          to: href,
          className,
          style,
          ...restProps,
        },
        children,
      )
    }) as React.ComponentType<{
      href: string
      children?: React.ReactNode
      style?: React.CSSProperties
      className?: string
      [key: string]: unknown
    }>,

    getCurrentPath: () => location.pathname,

    push: (target: { path: string }) => {
      navigate(target.path)
    },

    replace: (target: { path: string }) => {
      navigate(target.path, { replace: true })
    },

    resolvePath: (to: string | { path?: string }, locale: string) => resolvePath(to, locale),

    getRoute: () => ({
      fullPath: location.pathname,
      query: Object.fromEntries(new URLSearchParams(location.search)),
    }),
  }
}
