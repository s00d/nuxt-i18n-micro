import type { RouteLocationNormalizedLoaded } from 'vue-router'

/**
 * Extracts the base route pattern from a matched route path
 * Converts Vue Router dynamic route patterns to file-based route patterns
 *
 * @param matchedPath - The matched route path from route.matched[0].path
 * @returns The base route pattern (e.g., "/test/[param]")
 *
 * @example
 * extractBaseRoutePattern('/:locale(es)/test/:param()') // Returns '/test/[param]'
 * extractBaseRoutePattern('/:locale(en)/static') // Returns '/static'
 * extractBaseRoutePattern('/:locale(fr)/about/:id') // Returns '/about/[id]'
 */
export function extractBaseRoutePattern(matchedPath: string): string {
  return matchedPath
    .replace(/\/:locale\([^)]+\)/g, '') // Remove locale parameter
    .replace(/\/:([^()]+)\(\)/g, '/[$1]') // Convert :param() to [param]
    .replace(/\/:([^()]+)/g, '/[$1]') // Convert :param to [param]
}

/**
 * Finds allowed locales for a route using various matching strategies
 *
 * @param route - The route object
 * @param routeLocales - The routeLocales configuration object
 * @returns Array of allowed locale codes or null if no restrictions
 */
export function findAllowedLocalesForRoute(
  route: RouteLocationNormalizedLoaded,
  routeLocales: Record<string, string[]> | undefined,
): string[] | null {
  const routePath = route.path
  const routeName = route.name?.toString()
  const normalizedRouteName = routeName?.replace('localized-', '')
  const normalizedRoutePath = normalizedRouteName ? `/${normalizedRouteName}` : undefined

  // Try to find allowed locales for this route
  let allowedLocales = (routeName && routeLocales?.[routeName])
    || (normalizedRouteName && routeLocales?.[normalizedRouteName])
    || (normalizedRoutePath && routeLocales?.[normalizedRoutePath])
    || routeLocales?.[routePath]

  // For dynamic routes, try to match against route patterns using route.matched
  if (!allowedLocales && route.matched && route.matched.length > 0) {
    const matchedRoute = route.matched[0]
    const matchedPath = matchedRoute.path

    const baseRoutePattern = extractBaseRoutePattern(matchedPath)

    // Try to find matching route pattern in routeLocales
    if (routeLocales?.[baseRoutePattern]) {
      allowedLocales = routeLocales[baseRoutePattern]
    }
  }

  return allowedLocales || null
}
