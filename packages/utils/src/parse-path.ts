import { forwardSlashes } from './app-path'
import { deepMergeTranslationsRecursive } from './deep-merge'

export type ParsedTranslationRelativePath = { type: 'page'; pageName: string; locale: string } | { type: 'root'; locale: string } | { type: 'ignore' }

export interface TranslationFileBuckets<T = Record<string, unknown>> {
  root: Record<string, T>
  routes: Record<string, Record<string, T>>
}

/**
 * Parse a translation file path relative to the locales root.
 * Examples: `en.json`, `pages/about/en.json`, `pages/user/profile/en.json`
 * A `__proto__` page or locale is ignored: as a bucket key it would write the prototype.
 */
export function parseTranslationRelativePath(relativePath: string): ParsedTranslationRelativePath {
  const normalizedPath = forwardSlashes(relativePath)

  if (!normalizedPath.endsWith('.json')) {
    return { type: 'ignore' }
  }

  const slash = normalizedPath.lastIndexOf('/')
  const locale = normalizedPath.slice(slash + 1, -5)
  if (!locale || locale === '__proto__') {
    return { type: 'ignore' }
  }

  if (normalizedPath.startsWith('pages/')) {
    if (slash < 7) {
      return { type: 'ignore' }
    }

    const pageName = pagePathSegmentsToRouteName(normalizedPath.slice(6, slash).split('/'))
    if (!pageName || pageName === '__proto__') {
      return { type: 'ignore' }
    }

    return { type: 'page', pageName, locale }
  }

  return slash === -1 ? { type: 'root', locale } : { type: 'ignore' }
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

  // merged, never replaced: under disablePageLocales page files land in the root bucket next to
  // the root file, and either may be read first
  if (parsed.type === 'page') {
    const routeBucket = own(buckets.routes, parsed.pageName) ?? (buckets.routes[parsed.pageName] = {} as Record<string, T>)
    routeBucket[parsed.locale] = mergeInto(own(routeBucket, parsed.locale), translations)
    return
  }

  if (parsed.type === 'root') {
    // a page file (folded into root by disablePageLocales) wins over the root file in either read order
    const isPageFile = relativePath.startsWith('pages/')
    const existing = own(buckets.root, parsed.locale)
    buckets.root[parsed.locale] = isPageFile || !existing ? mergeInto(existing, translations) : mergeInto(translations, existing)
  }
}

/** A page or locale named `constructor` must not read the inherited `Object`. */
const own = <V>(bucket: Record<string, V>, key: string): V | undefined =>
  Object.prototype.hasOwnProperty.call(bucket, key) ? bucket[key] : undefined

const mergeInto = <T extends Record<string, unknown>>(existing: T | undefined, incoming: T): T =>
  existing ? (deepMergeTranslationsRecursive(existing, incoming) as T) : incoming
