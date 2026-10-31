import path from 'node:path'

/** `a//b/` -> `a/b`; `''` and `.` -> `''`. */
export function normalizePath(routePath: string): string {
  if (!routePath) return ''
  const normalized = path.posix.normalize(routePath).replace(/\/+$/, '')
  return normalized === '.' ? '' : normalized
}

export const removeLeadingSlash = (routePath: string): string => (routePath.startsWith('/') ? routePath.slice(1) : routePath)

/** Absolute form of a path: `about` -> `/about`, `` -> `/`. */
export const absolute = (routePath: string): string => normalizePath(`/${removeLeadingSlash(routePath)}`) || '/'

/** Full path of a child route: an absolute child path stands alone, a relative one is joined. */
export function joinChild(parentFullPath: string, childPath: string): string {
  return childPath.startsWith('/') ? absolute(childPath) : absolute(path.posix.join(parentFullPath, childPath))
}

/**
 * File-path and Nuxt forms of a route path to the vue-router form rules are keyed and written in:
 * `[...slug]` -> `:slug(.*)*`, `[[page]]` -> `:page?`, `[id]` -> `:id`, `:id()` -> `:id`
 * (non-empty matchers such as `:id(\d+)` stay).
 */
export function normalizeRouteKey(key: string): string {
  return key
    .split('/')
    .map((segment) =>
      segment
        .replace(/^\[\.\.\.(\w+)\]$/, ':$1(.*)*')
        .replace(/\[\[(\w+)\]\]/g, ':$1?')
        .replace(/\[(\w+)\]/g, ':$1')
        .replace(/:(\w+)\(\)/g, ':$1'),
    )
    .join('/')
}

const routeKeys = new Map<string, string>()
/** Lookup key of a route path or name: normalized, without the leading slash (`/` for the root). */
export function routeKey(routePathOrName: string): string {
  let key = routeKeys.get(routePathOrName)
  if (key === undefined) routeKeys.set(routePathOrName, (key = removeLeadingSlash(normalizePath(normalizeRouteKey(routePathOrName))) || '/'))
  return key
}

/**
 * Route path segment of a child from its custom value, relative to the parent's localized path.
 * A relative value is kept as written. An absolute value is a full URL: when it starts with the
 * parent's localized path the rest is the segment (`/konto/bestellungen` under `/konto`), the
 * parent path itself is the empty segment, and any other value keeps what follows the segments it
 * shares with the parent (`/bereich/artikel` under `/bereich/kategorie` is `artikel`).
 */
export function childSegment(parentLocalizedPath: string, customValue: string): string {
  if (!customValue.startsWith('/')) return removeLeadingSlash(normalizePath(customValue))
  const value = absolute(customValue)
  const parent = absolute(parentLocalizedPath)
  if (parent === '/') return removeLeadingSlash(value)
  if (value === parent) return ''
  if (value.startsWith(`${parent}/`)) return value.slice(parent.length + 1)
  const valueSegments = value.split('/').filter(Boolean)
  const parentSegments = parent.split('/').filter(Boolean)
  let shared = 0
  while (shared < valueSegments.length && valueSegments[shared] === parentSegments[shared]) shared++
  return valueSegments.slice(shared).join('/')
}

/**
 * A page path as a route rule pattern: `/artikel/:id(\\d+)` -> `/artikel/:id`, `/a/:rest(.*)*` ->
 * `/a/**`. Null when it starts with a param: `/:slug` would match every URL of that depth.
 */
export function rulePattern(routePath: string): string | null {
  const segments = absolute(routePath).split('/').slice(1)
  if (segments[0]?.includes(':')) return null
  const repeatable = segments.findIndex((segment) => /[*+?]$/.test(segment))
  const fixed = repeatable === -1 ? segments : [...segments.slice(0, repeatable), '**']
  return `/${fixed.map((segment) => segment.replace(/^(:\w+)\(.*\)$/, '$1')).join('/')}`
}

/** Whether a child's custom value is its URL: an absolute value elsewhere is nested under the parent anyway. */
export function staysUnderParent(parentLocalizedPath: string, customValue: string): boolean {
  if (!customValue.startsWith('/')) return true
  const parent = absolute(parentLocalizedPath)
  const value = absolute(customValue)
  return parent === '/' || value === parent || value.startsWith(`${parent}/`)
}

/** What a browser percent-encodes in a path and a route path has no syntax for: non-ASCII, a space, quotes, angle brackets. */
const ENCODED_IN_URL = /[\u0080-￿ "<>`]/

/** Percent-encoded variant of a path with such static segments (vue-router matches either). */
export function encodedVariant(routePath: string): string | undefined {
  if (!ENCODED_IN_URL.test(routePath)) return undefined
  const encoded = routePath
    .split('/')
    .map((segment) => (segment.startsWith(':') || !ENCODED_IN_URL.test(segment) ? segment : encodeURI(segment)))
    .join('/')
  return encoded === routePath ? undefined : encoded
}
