/**
 * Converts Vue Router dynamic route patterns to file-based route patterns.
 *
 * @example
 * extractBaseRoutePattern('/:locale(es)/test/:param()') // '/test/[param]'
 * extractBaseRoutePattern('/:locale(en)/static') // '/static'
 */
export function extractBaseRoutePattern(matchedPath: string): string {
  return matchedPath
    .replace(/\/:locale\([^)]+\)/g, '')
    .replace(/\/:([^()]+)\(\)/g, '/[$1]')
    .replace(/\/:([^()]+)/g, '/[$1]')
}

export function stripLocalizedRouteNamePrefix(routeName: string | undefined | null, localizedRouteNamePrefix = 'localized-'): string | undefined {
  if (!routeName) return undefined
  const normalized = routeName.replace(localizedRouteNamePrefix, '')
  return normalized.length > 0 ? normalized : undefined
}

export function routeNameToPath(normalizedRouteName: string | undefined): string | undefined {
  return normalizedRouteName ? `/${normalizedRouteName}` : undefined
}

export function stripLeadingSlash(path: string): string {
  return path.replace(/^\//, '')
}
