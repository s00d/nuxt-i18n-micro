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
 * The extension list matches `isInternalPath` in `@i18n-micro/route-strategy`.
 */
const STATIC_ASSET_EXT = /\.(xml|txt|ico|json|js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/i

export function isStaticAssetPathname(pathname: string): boolean {
  if (!pathname || pathname.endsWith('.html') || pathname.endsWith('.htm')) return false
  const last = pathname.split('/').filter(Boolean).pop() ?? ''
  return STATIC_ASSET_EXT.test(last)
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
