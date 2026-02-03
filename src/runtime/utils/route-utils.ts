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
 * @param localizedRouteNamePrefix - Prefix for localized route names
 * @param localeCodes - Optional list of locale codes; when provided, path like /es/test is also looked up as routeLocales['test']/['/test']
 * @returns Array of allowed locale codes or null if no restrictions
 */
export function findAllowedLocalesForRoute(
  route: RouteLocationNormalizedLoaded,
  routeLocales: Record<string, string[]> | undefined,
  localizedRouteNamePrefix = 'localized-',
  localeCodes?: string[],
): string[] | null {
  const routePath = route.path
  const routeName = route.name?.toString()
  const normalizedRouteName = routeName?.replace(localizedRouteNamePrefix, '')
  const normalizedRoutePath = normalizedRouteName ? `/${normalizedRouteName}` : undefined

  // Try to find allowed locales for this route (module uses path without leading slash, e.g. 'test' for pages/test/)
  let allowedLocales = (routeName && routeLocales?.[routeName])
    || (normalizedRouteName && routeLocales?.[normalizedRouteName])
    || (normalizedRoutePath && routeLocales?.[normalizedRoutePath])
    || (normalizedRoutePath && routeLocales?.[normalizedRoutePath.replace(/^\//, '')])
    || routeLocales?.[routePath]
    || (routePath && routeLocales?.[routePath.replace(/^\//, '')])

  // Path-based lookup when path has locale prefix (e.g. /es/test) and route might not be matched yet (SSR/direct request)
  if (!allowedLocales && routeLocales && localeCodes?.length) {
    const segments = routePath.split('/').filter(Boolean)
    const first = segments[0]
    if (first && localeCodes.includes(first) && segments.length > 1) {
      const pathWithoutLocale = '/' + segments.slice(1).join('/')
      const pathKey = pathWithoutLocale === '/' ? '/' : pathWithoutLocale.replace(/^\//, '')
      allowedLocales = routeLocales[pathWithoutLocale] ?? routeLocales[pathKey] ?? undefined
    }
  }

  // For dynamic routes, try to match against route patterns using route.matched
  if (!allowedLocales && route.matched && route.matched.length > 0) {
    const matchedRoute = route.matched[0]
    if (!matchedRoute) return null
    const matchedPath = matchedRoute.path

    const baseRoutePattern = extractBaseRoutePattern(matchedPath)

    // Try to find matching route pattern in routeLocales
    if (routeLocales?.[baseRoutePattern]) {
      allowedLocales = routeLocales[baseRoutePattern]
    }
  }

  return allowedLocales || null
}

/**
 * Checks if meta tags should be disabled for a route
 *
 * @param route - The route object
 * @param routeDisableMeta - The routeDisableMeta configuration object
 * @param currentLocale - The current locale code
 * @returns True if meta tags should be disabled, false otherwise
 */
export function isMetaDisabledForRoute(
  route: RouteLocationNormalizedLoaded,
  routeDisableMeta: Record<string, boolean | string[]> | undefined,
  currentLocale?: string,
  localizedRouteNamePrefix = 'localized-',
): boolean {
  if (!routeDisableMeta) {
    return false
  }

  const routePath = route.path
  const routeName = route.name?.toString()
  const normalizedRouteName = routeName?.replace(localizedRouteNamePrefix, '')
  const normalizedRoutePath = normalizedRouteName ? `/${normalizedRouteName}` : undefined

  // Helper function to check if meta is disabled for a specific route pattern
  const checkDisableMeta = (disableMetaValue: boolean | string[] | undefined): boolean => {
    if (disableMetaValue === undefined) {
      return false
    }

    if (typeof disableMetaValue === 'boolean') {
      return disableMetaValue
    }

    if (Array.isArray(disableMetaValue)) {
      return currentLocale ? disableMetaValue.includes(currentLocale) : false
    }

    return false
  }

  // Check if meta is disabled for this route
  if (checkDisableMeta(routeDisableMeta[routePath])
    || (routeName && checkDisableMeta(routeDisableMeta[routeName]))
    || (normalizedRouteName && checkDisableMeta(routeDisableMeta[normalizedRouteName]))
    || (normalizedRoutePath && checkDisableMeta(routeDisableMeta[normalizedRoutePath]))) {
    return true
  }

  // For dynamic routes, try to match against route patterns using route.matched
  if (route.matched && route.matched.length > 0) {
    const matchedRoute = route.matched[0]
    if (!matchedRoute) return false
    const matchedPath = matchedRoute.path

    const baseRoutePattern = extractBaseRoutePattern(matchedPath)

    // Check if meta is disabled for this route pattern
    if (checkDisableMeta(routeDisableMeta[baseRoutePattern])) {
      return true
    }
  }

  return false
}
