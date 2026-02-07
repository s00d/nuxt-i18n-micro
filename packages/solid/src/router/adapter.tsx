// @ts-nocheck

import type { Locale } from '@i18n-micro/types'
import { A, type Location, type useNavigate } from '@solidjs/router'
import { type Accessor, type Component, createEffect, createSignal, type JSX } from 'solid-js'
import type { I18nRoutingStrategy } from './types'

type NavigateFunction = ReturnType<typeof useNavigate>

/**
 * Factory for Solid Router adapter
 * Implements routing utilities for Solid Router
 * Uses @solidjs/router APIs for navigation and path resolution
 *
 * **IMPORTANT**: This function must be called inside a SolidJS component or reactive context
 * (e.g., inside a component function, not at module level). This is required because
 * `createSignal` and `createEffect` need to be within a reactive owner context.
 *
 * @example
 * ```tsx
 * const RouterRoot: Component = () => {
 *   const navigate = useNavigate()
 *   const location = useLocation()
 *   const routingStrategy = createSolidRouterAdapter(
 *     locales,
 *     defaultLocale,
 *     navigate,
 *     location,
 *   )
 *   // ...
 * }
 * ```
 *
 * @param locales - Array of locale configurations
 * @param defaultLocale - Default locale code
 * @param navigate - Navigation function from @solidjs/router's useNavigate hook
 * @param location - Location object from @solidjs/router's useLocation hook
 * @returns I18nRoutingStrategy with reactive pathname accessor
 */
export function createSolidRouterAdapter(
  locales: Locale[],
  defaultLocale: string,
  navigate: NavigateFunction,
  location: Location,
): I18nRoutingStrategy & { getCurrentPathAccessor: Accessor<string> } {
  const localeCodes = locales.map((loc) => loc.code)

  // Create signal to track pathname changes
  // NOTE: This requires a reactive context (component/effect), so this function
  // must be called inside a component, not at module level
  const [pathname, setPathname] = createSignal(location.pathname)

  // Track location.pathname changes
  // NOTE: createEffect requires a reactive owner, so this function must be called
  // inside a component or runWithOwner context
  createEffect(() => {
    setPathname(location.pathname)
  })

  const resolvePath = (to: string | { path?: string }, locale: string): string | { path?: string } => {
    const path = typeof to === 'string' ? to : to.path || '/'
    const pathSegments = path.split('/').filter(Boolean)

    if (pathSegments.length > 0 && localeCodes.includes(pathSegments[0])) {
      pathSegments.shift()
    }

    const cleanPath = `/${pathSegments.join('/')}`
    return locale === defaultLocale ? cleanPath : `/${locale}${cleanPath === '/' ? '' : cleanPath}`
  }

  return {
    getCurrentPath: () => pathname(), // Returns current value for compatibility
    getCurrentPathAccessor: pathname, // Returns accessor for reactivity

    push: (target: { path: string }) => {
      // Use navigate from @solidjs/router
      navigate(target.path)
    },

    replace: (target: { path: string }) => {
      // Use navigate with replace option
      navigate(target.path, { replace: true })
    },

    resolvePath: (to: string | { path?: string }, locale: string) => resolvePath(to, locale),

    getRoute: () => ({
      fullPath: pathname(),
      query: {},
    }),

    // Use A component from @solidjs/router
    linkComponent: ((props: { href: string; children?: JSX.Element; class?: string; style?: JSX.CSSProperties; [key: string]: unknown }) => {
      const { href, children, class: className, style, ...restProps } = props
      return (
        <A href={href} class={className} style={style} {...restProps}>
          {children}
        </A>
      ) as unknown as JSX.Element
    }) as unknown as Component<{
      href: string
      children?: JSX.Element
      style?: JSX.CSSProperties
      class?: string
      [key: string]: unknown
    }>,
  }
}
