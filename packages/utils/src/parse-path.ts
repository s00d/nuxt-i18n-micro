import { deepMergeTranslations } from './deep-merge'

export type ParsedTranslationRelativePath = { type: 'page'; pageName: string; locale: string } | { type: 'root'; locale: string } | { type: 'ignore' }

export interface TranslationFileBuckets<T = Record<string, unknown>> {
  root: Record<string, T>
  routes: Record<string, Record<string, T>>
}

/**
 * Parse a translation file path relative to the locales root.
 * Examples: `en.json`, `pages/about/en.json`, `pages/user/profile/en.json`
 */
export function parseTranslationRelativePath(relativePath: string): ParsedTranslationRelativePath {
  const normalizedPath = relativePath.replace(/\\/g, '/')

  if (!normalizedPath.endsWith('.json')) {
    return { type: 'ignore' }
  }

  if (normalizedPath.startsWith('pages/')) {
    const match = normalizedPath.match(/^pages\/(.+)\/([^/]+)\.json$/)
    if (!match?.[1] || !match[2]) {
      return { type: 'ignore' }
    }

    const pageName = pagePathSegmentsToRouteName(match[1].split('/'))
    if (!pageName) {
      return { type: 'ignore' }
    }

    return { type: 'page', pageName, locale: match[2] }
  }

  const match = normalizedPath.match(/^([^/]+)\.json$/)
  if (!match?.[1]) {
    return { type: 'ignore' }
  }

  return { type: 'root', locale: match[1] }
}

/**
 * Classify a translation path, optionally treating page files as root-level translations.
 */
export function classifyTranslationRelativePath(relativePath: string, disablePageLocales = false): ParsedTranslationRelativePath {
  const parsed = parseTranslationRelativePath(relativePath)
  if (disablePageLocales && parsed.type === 'page') {
    return { type: 'root', locale: parsed.locale }
  }
  return parsed
}

/**
 * Convert nested page path segments to a route name (e.g. `user/profile` → `user-profile`).
 */
export function pagePathSegmentsToRouteName(segments: string[]): string | null {
  if (segments.length === 0) return null
  return segments.join('-')
}

/**
 * Store a loaded translation file in root or route buckets based on its relative path.
 */
export function storeLoadedTranslationFile<T extends Record<string, unknown>>(
  buckets: TranslationFileBuckets<T>,
  relativePath: string,
  translations: T,
  disablePageLocales = false,
): void {
  const parsed = classifyTranslationRelativePath(relativePath, disablePageLocales)

  if (parsed.type === 'page') {
    const routeBucket = buckets.routes[parsed.pageName] ?? (buckets.routes[parsed.pageName] = {} as Record<string, T>)
    routeBucket[parsed.locale] = translations
    return
  }

  if (parsed.type === 'root') {
    buckets.root[parsed.locale] = translations
  }
}

/**
 * Merge route-specific translations on top of root translations.
 */
export function mergeRouteTranslationsWithRoot<T extends Record<string, unknown>>(rootTranslations: T | undefined, routeTranslations: T): T {
  return deepMergeTranslations((rootTranslations ?? {}) as Record<string, unknown>, routeTranslations as Record<string, unknown>) as T
}
