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
  cors?: true
  headers?: { 'Cache-Control': string }
}

/**
 * Build the route rule for `/{apiBaseUrl}/**`.
 *
 * - **No Nitro `cache`.** Its key is the full URL, query included, so any query string makes a new
 *   unbounded entry, and it holds a third copy of chunks the server loader already keeps (bounded).
 *   Turning it on also switches on `payloadExtraction` for the whole app.
 * - **Nothing is cached in dev.** HMR and live edits must not be answered from the browser cache either.
 * - **The header is the conservative policy.** A route rule matches by path, and `?v=` is a query, so
 *   this rule also answers requests without the cache-buster. The payload handler upgrades a
 *   versioned request to `immutable`; here we cannot know, so we must not promise it.
 * - **CORS only with `apiBaseClientHost`.** Otherwise the browser reads payloads from its own origin.
 *   Nitro's route rules land in `runtimeConfig`, which is cloned per request: `cors` adds its 5 expanded
 *   keys to that walk on every page render.
 */
export function buildTranslationPayloadRouteRule(input: { dev: boolean; cacheControl: string | null; crossOrigin: boolean }): TranslationPayloadRouteRule {
  const cors = input.crossOrigin ? ({ cors: true } as const) : {}
  if (input.dev || !input.cacheControl) return cors
  return { ...cors, headers: { 'Cache-Control': input.cacheControl } }
}
