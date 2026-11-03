import { localizedPath, routeQuery } from '@i18n-micro/core'
import type { Locale } from '@i18n-micro/types'
import { createElement } from 'react'
import type { useLocation, useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import type { I18nRoutingStrategy } from '../injection'

interface LinkProps {
  href: string
  [key: string]: unknown
}

const RouterLink = ({ href, ...rest }: LinkProps) => createElement(Link, { to: href, ...rest })

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
  const codes = locales.map((locale) => locale.code)
  const fullPath = `${location.pathname}${location.search}${location.hash}`

  return {
    linkComponent: RouterLink,
    getCurrentPath: () => fullPath,
    push: (target) => {
      navigate(target.path)
    },
    replace: (target) => {
      navigate(target.path, { replace: true })
    },
    resolvePath: (to, locale) => localizedPath(to, locale, codes, defaultLocale),
    getRoute: () => ({ fullPath, query: routeQuery(location.search) }),
  }
}
