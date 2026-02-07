/**
 * Path utilities: delegate to ufo for URL/paths; custom logic only for route names (kebab/slash).
 */
import type { QueryObject } from 'ufo'
import {
  cleanDoubleSlashes,
  hasProtocol,
  isEmptyURL,
  joinURL,
  parseFilename,
  parsePath,
  withFragment,
  withLeadingSlash,
  withoutTrailingSlash,
  withQuery,
} from 'ufo'

/** Path segments without leading/repeated slashes (ufo parsePath.pathname). */
export function getPathSegments(pathOrSlashKey: string): string[] {
  const pathname = parsePath(pathOrSlashKey.startsWith('/') ? pathOrSlashKey : `/${pathOrSlashKey}`).pathname || ''
  return pathname.split('/').filter(Boolean)
}

export const normalizePath = (p: string): string => {
  if (isEmptyURL(p ?? '')) return '/'
  return withLeadingSlash(withoutTrailingSlash(cleanDoubleSlashes(p))) || '/'
}

/** Path for comparison: collapse slashes, remove trailing slash, empty -> '/'. */
export function normalizePathForCompare(p: string): string {
  const collapsed = cleanDoubleSlashes(p || '/')
  const trimmed = withoutTrailingSlash(collapsed)
  return trimmed || '/'
}

/**
 * Join URL segments (ufo handles protocols and slashes correctly).
 * For path-style (no protocol) result always has leading slash.
 */
export function joinUrl(...segments: (string | undefined | null)[]): string {
  const valid = segments.filter((s): s is string => typeof s === 'string' && s !== '')
  if (valid.length === 0) return '/'
  const [base, ...rest] = valid
  const joined = joinURL(base!, ...rest) || '/'
  if (hasProtocol(joined)) return joined
  return withLeadingSlash(joined)
}

/**
 * Safely strips query and hash from path (ufo parsePath).
 * /news?id=1#top -> /news
 */
export function getCleanPath(path: string | null | undefined): string {
  if (!path) return ''
  const parsed = parsePath(path)
  return parsed.pathname || ''
}

/**
 * Builds full URL from path, query and hash (ufo withQuery + withFragment).
 */
export function buildUrl(path: string, query?: Record<string, unknown>, hash?: string): string {
  let url = withQuery(path, (query ?? {}) as QueryObject)
  if (hash && hash !== '#') {
    const fragment = hash.startsWith('#') ? hash.slice(1) : hash
    url = withFragment(url, fragment)
  }
  return url
}

/**
 * Parent path. /a/b/c -> /a/b, /a -> /, / -> null
 */
export function getParentPath(routePath: string): string | null {
  const segments = getPathSegments(routePath)
  if (segments.length === 0) return null
  if (segments.length <= 1) return '/'
  return joinUrl('/', ...segments.slice(0, -1))
}

/**
 * kebab -> path key: activity-skiing-locale -> activity/skiing/locale
 */
export function transformNameKeyToPath(nameKey: string): string {
  if (!nameKey) return ''
  let out = ''
  for (let i = 0; i < nameKey.length; i++) {
    out += nameKey[i] === '-' ? '/' : nameKey[i]
  }
  return out
}

/** First hyphen -> slash: activity-skiing-locale -> activity/skiing-locale */
export function nameKeyFirstSlash(nameKey: string): string {
  if (!nameKey) return ''
  const idx = nameKey.indexOf('-')
  return idx === -1 ? nameKey : joinURL(nameKey.slice(0, idx), nameKey.slice(idx + 1))
}

/** Last hyphen -> slash: activity-locale-skiing -> activity-locale/skiing */
export function nameKeyLastSlash(nameKey: string): string {
  if (!nameKey) return ''
  const idx = nameKey.lastIndexOf('-')
  return idx === -1 ? nameKey : joinURL(nameKey.slice(0, idx), nameKey.slice(idx + 1))
}

/** Parent key from slash-key: activity-locale/hiking -> activity-locale; a/b/c -> a-b */
export function parentKeyFromSlashKey(keyWithSlash: string): string {
  const segments = getPathSegments(keyWithSlash)
  return segments.length > 1 ? segments.slice(0, -1).join('-') : ''
}

/** Last path segment: /change-activity/hiking -> hiking (ufo parseFilename). */
export function lastPathSegment(path: string): string {
  return parseFilename(path || '/') ?? ''
}
