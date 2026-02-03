/**
 * Path normalization: extract locale from path and pathWithoutLocale (ufo getCleanPath, hasLeadingSlash).
 */
import { hasLeadingSlash } from 'ufo'
import { getCleanPath, normalizePath } from '../utils/path'

export interface PathWithoutLocaleResult {
  pathWithoutLocale: string
  localeFromPath: string | null
}

/**
 * Parses path: if first segment is a known locale, returns path without it and locale code.
 */
export function getPathWithoutLocale(path: string, localeCodes: string[]): PathWithoutLocaleResult {
  const clean = getCleanPath(path)
  const normalized = normalizePath(clean)

  if (normalized === '/') {
    return { pathWithoutLocale: '/', localeFromPath: null }
  }

  if (!hasLeadingSlash(normalized)) {
    return { pathWithoutLocale: normalized, localeFromPath: null }
  }

  const nextSlash = normalized.indexOf('/', 1)
  const firstSegment = nextSlash === -1 ? normalized.slice(1) : normalized.slice(1, nextSlash)

  if (firstSegment && localeCodes.includes(firstSegment)) {
    const lengthToCut = 1 + firstSegment.length
    const remaining = normalized.slice(lengthToCut)
    return {
      pathWithoutLocale: normalizePath(remaining || '/'),
      localeFromPath: firstSegment,
    }
  }

  return { pathWithoutLocale: normalized, localeFromPath: null }
}

/**
 * Determines locale from first path segment.
 */
export function getLocaleFromPath(path: string, localeCodes: string[]): string | null {
  const clean = getCleanPath(path)

  if (clean === '/' || clean === '') return null

  if (!hasLeadingSlash(clean)) return null

  const nextSlash = clean.indexOf('/', 1)
  const segment = nextSlash === -1 ? clean.slice(1) : clean.slice(1, nextSlash)
  if (segment && localeCodes.includes(segment)) {
    return segment
  }

  return null
}
