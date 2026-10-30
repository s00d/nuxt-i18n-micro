/**
 * Strip Nuxt `app.baseURL` prefix from a request pathname.
 * `getRequestURL(event).pathname` includes baseURL; Vue Router paths do not.
 */
export function withoutAppBaseURL(pathname: string, baseURL?: string | null): string {
  if (!baseURL || baseURL === '/') return pathname

  const base = baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL
  if (!base || base === '/') return pathname

  if (pathname === base || pathname === `${base}/`) return '/'
  if (pathname.startsWith(`${base}/`)) {
    const stripped = pathname.slice(base.length)
    return stripped || '/'
  }

  return pathname
}

/**
 * Last-segment static-asset check. Dotted slugs (`/en/user/john.doe`) stay as pages;
 * only the final segment is considered. `.html` / `.htm` stay as pages.
 */
const STATIC_ASSET_EXT = /\.(xml|txt|ico|json|js|css|png|jpg|jpeg|gif|svg|webp|avif|pdf|wasm|map|mp4|webm|mp3|zip|gz|woff|woff2|ttf|eot)$/i

export function isStaticAssetPathname(pathname: string): boolean {
  if (!pathname || pathname.endsWith('.html') || pathname.endsWith('.htm')) return false
  const last = pathname.split('/').filter(Boolean).pop() ?? ''
  return STATIC_ASSET_EXT.test(last)
}

const INTERNAL_PREFIXES = ['/api', '/_nuxt'] as const

const DEFAULT_STATIC_PATTERNS = [
  /^\/sitemap.*\.xml$/,
  /^\/robots\.txt$/,
  /^\/favicon\.ico$/,
  /^\/apple-touch-icon.*\.png$/,
  /^\/manifest\.json$/,
  /^\/sw\.js$/,
  /^\/workbox-.*\.js$/,
]

/** `path` is `prefix` or below it: `/admin` covers `/admin` and `/admin/x`, not `/administrator`. */
function underPrefix(path: string, prefix: string): boolean {
  const base = prefix.length > 1 && prefix.endsWith('/') ? prefix.slice(0, -1) : prefix
  return path === base || path.startsWith(base === '/' ? '/' : `${base}/`)
}

const GLOBS = new Map<string, RegExp>()
const MAX_GLOBS = 256

/** An anchored RegExp of a `*` / `?` glob, compiled once per pattern string. */
function globOf(pattern: string): RegExp {
  let regex = GLOBS.get(pattern)
  if (regex) return regex
  if (GLOBS.size >= MAX_GLOBS) GLOBS.clear()
  const source = pattern
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*/g, '.*')
    .replace(/\?/g, '.')
  // a trailing slash is the same page, as for a plain prefix
  regex = new RegExp(`^${source}/?$`)
  GLOBS.set(pattern, regex)
  return regex
}

const isGlob = (pattern: string) => pattern.includes('*') || pattern.includes('?')

function matchesPattern(path: string, pattern: string | RegExp | object): boolean {
  if (typeof pattern === 'string') return isGlob(pattern) ? globOf(pattern).test(path) : underPrefix(path, pattern)
  if (!(pattern instanceof RegExp)) return false
  pattern.lastIndex = 0
  const matches = pattern.test(path)
  pattern.lastIndex = 0
  return matches
}

/**
 * True for Nuxt/i18n internals, Content `__` routes, and static assets that must
 * skip locale detection / redirects. Lives in utils so client middleware can import
 * it without pulling `@nuxt/schema` (via route-strategy) into the browser bundle.
 * `apiBaseUrl` is the translations route (`_locales` by default).
 */
export function isInternalPath(path: string, excludePatterns?: (string | RegExp | object)[], apiBaseUrl = '_locales'): boolean {
  if (INTERNAL_PREFIXES.some((prefix) => underPrefix(path, prefix))) return true
  if (apiBaseUrl && underPrefix(path, `/${apiBaseUrl.replace(/^\/+|\/+$/g, '')}`)) return true
  // `/__`, `/__/…`, `/__nuxt…`, and nested `/en/__nuxt_content`
  if (/(?:^|\/)__/.test(path)) return true
  const pathForMatch = path.length > 1 ? path.replace(/\/+$/, '') : path
  if (DEFAULT_STATIC_PATTERNS.some((pattern) => pattern.test(pathForMatch))) return true
  if (isStaticAssetPathname(path)) return true
  return excludePatterns?.some((pattern) => matchesPattern(path, pattern)) ?? false
}

/**
 * Normalize a payload-relative path and reject any walk out of the payload root.
 * Callers must use the returned string (or skip the read when this returns `null`).
 */
export function resolveContainedRelPath(relPath: string): string | null {
  const cleaned = relPath.replace(/\\/g, '/').replace(/^\/+/, '')
  if (!cleaned || cleaned.includes('\0')) return null

  const parts: string[] = []
  for (const part of cleaned.split('/')) {
    if (!part || part === '.') continue
    if (part === '..') {
      if (parts.length === 0) return null
      parts.pop()
      continue
    }
    parts.push(part)
  }

  return parts.length === 0 ? null : parts.join('/')
}
