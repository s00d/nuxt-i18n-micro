export function shouldLocalizeRouteRulePath(originalPath: string): boolean {
  const routeRulePath = originalPath.trim()
  if (!routeRulePath) return true

  const path = routeRulePath.startsWith('/') ? routeRulePath : `/${routeRulePath}`
  if (path === '/api' || path.startsWith('/api/')) return false

  const firstSegment = path.replace(/^\/+/, '').split('/')[0] ?? ''
  return !firstSegment.startsWith('_')
}

/** The Nitro route rule for the translation payload prefix. */
export interface TranslationPayloadRouteRule {
  cors: true
  cache?: { maxAge: number; swr: true }
  headers?: { 'Cache-Control': string }
}

/** How long Nitro may answer a payload request from its own cache. */
export const PAYLOAD_ROUTE_CACHE_MAX_AGE = 60

/**
 * Build the route rule for `/{apiBaseUrl}/**`.
 *
 * Three decisions, and the reason they belong together is that they have to agree:
 *
 * - **Nothing is cached in dev.** HMR and live edits must not be answered from a cache,
 *   neither Nitro's nor the browser's.
 * - **Nitro caches only when `?v=` makes each URL unique to its content.** On a stable URL
 *   it would answer from a stale entry for up to a minute, which is exactly what the
 *   `must-revalidate` such a URL sends is there to prevent.
 * - **The header comes from `cacheControl`**, whose `null` already means "set none" — so
 *   the caller does not re-derive that condition.
 */
export function buildTranslationPayloadRouteRule(input: {
  dev: boolean
  hasCacheBuster: boolean
  cacheControl: string | null
}): TranslationPayloadRouteRule {
  if (input.dev) return { cors: true }

  return {
    cors: true,
    ...(input.hasCacheBuster ? { cache: { maxAge: PAYLOAD_ROUTE_CACHE_MAX_AGE, swr: true as const } } : {}),
    ...(input.cacheControl ? { headers: { 'Cache-Control': input.cacheControl } } : {}),
  }
}
