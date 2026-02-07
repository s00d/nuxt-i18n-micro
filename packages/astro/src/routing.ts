/**
 * Get route name from Astro path
 * Extracts route name from path (e.g., /en/about -> about)
 */
export function getRouteName(path: string, locales: string[] = []): string {
  // Нормализуем путь
  const cleanPath = path.replace(/^\//, '').replace(/\/$/, '')

  if (!cleanPath) {
    return 'index'
  }

  const segments = cleanPath.split('/').filter(Boolean)

  // Remove locale from path if present
  const firstSegment = segments[0]
  if (firstSegment && locales.includes(firstSegment)) {
    segments.shift()
  }

  if (segments.length === 0) {
    return 'index'
  }

  return segments.join('-')
}

/**
 * Get locale from path
 * Checks if first segment is a locale code
 */
export function getLocaleFromPath(path: string, defaultLocale: string = 'en', locales: string[] = []): string {
  const segments = path.split('/').filter(Boolean)
  const firstSegment = segments[0]
  if (firstSegment && locales.includes(firstSegment)) {
    return firstSegment
  }

  return defaultLocale
}

/**
 * Switch locale in path
 * Replaces or adds locale prefix to path
 */
export function switchLocalePath(path: string, newLocale: string, locales: string[] = [], defaultLocale?: string): string {
  const segments = path.split('/').filter(Boolean)

  // Remove existing locale if present
  const firstSegment = segments[0]
  if (firstSegment && locales.includes(firstSegment)) {
    segments.shift()
  }

  // Add new locale if not default or if default should be included
  if (newLocale !== defaultLocale || defaultLocale === undefined) {
    segments.unshift(newLocale)
  }

  return `/${segments.join('/')}`
}

/**
 * Localize path with locale prefix
 */
export function localizePath(path: string, locale: string, locales: string[] = [], defaultLocale?: string): string {
  const cleanPath = path.replace(/^\//, '').replace(/\/$/, '') || ''
  const segments = cleanPath.split('/').filter(Boolean)

  // Remove existing locale if present
  const firstSegment = segments[0]
  if (firstSegment && locales.includes(firstSegment)) {
    segments.shift()
  }

  // Add locale if not default or if default should be included
  if (locale !== defaultLocale || defaultLocale === undefined) {
    segments.unshift(locale)
  }

  return `/${segments.join('/')}`
}

/**
 * Remove locale from path
 */
export function removeLocaleFromPath(path: string, locales: string[] = []): string {
  const segments = path.split('/').filter(Boolean)
  const firstSegment = segments[0]
  if (firstSegment && locales.includes(firstSegment)) {
    segments.shift()
  }
  return `/${segments.join('/')}`
}
