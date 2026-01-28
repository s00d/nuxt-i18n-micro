/**
 * Default patterns for static files that should be excluded from i18n routing
 */
const DEFAULT_STATIC_PATTERNS = [
  /^\/sitemap.*\.xml$/,
  /^\/sitemap\.xml$/,
  /^\/robots\.txt$/,
  /^\/favicon\.ico$/,
  /^\/apple-touch-icon.*\.png$/,
  /^\/manifest\.json$/,
  /^\/sw\.js$/,
  /^\/workbox-.*\.js$/,
  /\.(xml|txt|ico|json|js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/,
]

/**
 * Checks if a path should be excluded from i18n routing
 * @param path - The path to check
 * @param excludePatterns - Optional custom exclusion patterns
 * @returns true if the path should be excluded
 */
export const isInternalPath = (path: string, excludePatterns?: (string | RegExp | object)[]): boolean => {
  if (/(?:^|\/)__[^/]+/.test(path)) {
    return true
  }

  for (const pattern of DEFAULT_STATIC_PATTERNS) {
    if (pattern.test(path)) {
      return true
    }
  }

  if (excludePatterns) {
    for (const pattern of excludePatterns) {
      if (typeof pattern === 'string') {
        if (pattern.includes('*') || pattern.includes('?')) {
          const regex = new RegExp(pattern.replace(/\*/g, '.*').replace(/\?/g, '.'))
          if (regex.test(path)) {
            return true
          }
        }
        else if (path === pattern || path.startsWith(pattern)) {
          return true
        }
      }
      else if (pattern instanceof RegExp) {
        if (pattern.test(path)) {
          return true
        }
      }
    }
  }

  return false
}
