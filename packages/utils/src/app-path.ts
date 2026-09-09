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
 * Last-segment static-asset check used by the server middleware and redirect plugin.
 *
 * A path may contain dots in a slug (`/en/user/john.doe`, `/docs/v1.2`) and still be a
 * real page. Only the final segment is considered, and `.html` / `.htm` stay as pages.
 * The extension list covers common static assets (including formats the old
 * `path.includes('.')` guard used to skip wholesale: webp, avif, pdf, wasm, …).
 */
const STATIC_ASSET_EXT = /\.(xml|txt|ico|json|js|css|png|jpg|jpeg|gif|svg|webp|avif|pdf|wasm|map|mp4|webm|mp3|zip|gz|woff|woff2|ttf|eot)$/i

export function isStaticAssetPathname(pathname: string): boolean {
  if (!pathname || pathname.endsWith('.html') || pathname.endsWith('.htm')) return false
  // Last non-empty segment — trailing slashes must not defeat the extension check.
  const last = pathname.split('/').filter(Boolean).pop() ?? ''
  return STATIC_ASSET_EXT.test(last)
}

const INTERNAL_PREFIXES = ['/api', '/_nuxt', '/_locales'] as const

const DEFAULT_STATIC_PATTERNS = [
  /^\/sitemap.*\.xml$/,
  /^\/sitemap\.xml$/,
  /^\/robots\.txt$/,
  /^\/favicon\.ico$/,
  /^\/apple-touch-icon.*\.png$/,
  /^\/manifest\.json$/,
  /^\/sw\.js$/,
  /^\/workbox-.*\.js$/,
]

/**
 * True for Nuxt/i18n internals, Content `__` routes, and static assets that must
 * skip locale detection / redirects. Lives in utils (not route-strategy) so client
 * middleware can import it without pulling `@nuxt/schema` into the browser bundle.
 */
export function isInternalPath(path: string, excludePatterns?: (string | RegExp | object)[]): boolean {
  for (const prefix of INTERNAL_PREFIXES) {
    if (path === prefix || path.startsWith(`${prefix}/`)) return true
  }
  // `/__`, `/__/…`, `/__nuxt…`, and nested `/en/__nuxt_content`
  if (/(?:^|\/)__/.test(path)) {
    return true
  }
  const pathForMatch = path.length > 1 ? path.replace(/\/+$/, '') : path
  for (const pattern of DEFAULT_STATIC_PATTERNS) {
    if (pattern.test(pathForMatch)) {
      return true
    }
  }
  if (isStaticAssetPathname(path)) {
    return true
  }
  if (excludePatterns) {
    for (const pattern of excludePatterns) {
      if (typeof pattern === 'string') {
        if (pattern.includes('*') || pattern.includes('?')) {
          // Escape regex metacharacters first so `[`, `(`, etc. match literally;
          // only `*` / `?` remain as wildcards.
          const regex = new RegExp(
            pattern
              .replace(/[.+^${}()|[\]\\]/g, '\\$&')
              .replace(/\*/g, '.*')
              .replace(/\?/g, '.'),
          )
          if (regex.test(path)) return true
        } else if (path === pattern || path.startsWith(pattern)) {
          return true
        }
      } else if (pattern instanceof RegExp) {
        // Global/sticky regexes keep lastIndex across calls — reset so each path
        // is tested from the start (otherwise matches alternate true/false).
        pattern.lastIndex = 0
        const matches = pattern.test(path)
        pattern.lastIndex = 0
        if (matches) return true
      }
    }
  }
  return false
}

/**
 * Normalize a payload-relative path and reject any walk out of the payload root.
 *
 * `join(baseDir, rel)` would honour `..`. Callers must use the returned string (or skip
 * the read when this returns `null`) rather than the raw request param.
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
