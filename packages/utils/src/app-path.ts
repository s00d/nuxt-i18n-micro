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
