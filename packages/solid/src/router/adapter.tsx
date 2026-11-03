import { localizedPath, routeQuery } from '@i18n-micro/core'
import type { Locale } from '@i18n-micro/types'
import { A, type Location, type useNavigate } from '@solidjs/router'
import type { ComponentProps, JSX } from 'solid-js'
import type { I18nRoutingStrategy } from './types'

type NavigateFunction = ReturnType<typeof useNavigate>

const RouterLink = (props: { href: string; [key: string]: unknown }): JSX.Element => <A {...(props as ComponentProps<typeof A>)} />

/**
 * Factory for Solid Router adapter
 *
 * `location` is the router's reactive object, so reading the path inside a memo or JSX follows
 * navigation without a signal of its own.
 *
 * @example
 * ```tsx
 * const RouterRoot: Component = () => {
 *   const navigate = useNavigate()
 *   const location = useLocation()
 *   const routingStrategy = createSolidRouterAdapter(locales, defaultLocale, navigate, location)
 *   // ...
 * }
 * ```
 *
 * @param locales - Array of locale configurations
 * @param defaultLocale - Default locale code
 * @param navigate - Navigation function from @solidjs/router's useNavigate hook
 * @param location - Location object from @solidjs/router's useLocation hook
 * @returns I18nRoutingStrategy
 */
export function createSolidRouterAdapter(
  locales: Locale[],
  defaultLocale: string,
  navigate: NavigateFunction,
  location: Location,
): I18nRoutingStrategy {
  const codes = locales.map((locale) => locale.code)
  const fullPath = () => `${location.pathname}${location.search}${location.hash}`

  return {
    linkComponent: RouterLink,
    getCurrentPath: fullPath,
    push: (target) => {
      navigate(target.path)
    },
    replace: (target) => {
      navigate(target.path, { replace: true })
    },
    resolvePath: (to, locale) => localizedPath(to, locale, codes, defaultLocale),
    getRoute: () => ({ fullPath: fullPath(), query: routeQuery(location.search) }),
  }
}
