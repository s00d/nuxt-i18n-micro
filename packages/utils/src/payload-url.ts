import { trimSlashes } from './app-path'

export function resolveTranslationPayloadPage(routeName: string | undefined, routesLocaleLinks?: Record<string, string>): string {
  const name = routeName || 'index'
  // own keys only: the name comes from the request URL (`constructor`, `__proto__`)
  const linked = routesLocaleLinks && Object.prototype.hasOwnProperty.call(routesLocaleLinks, name) ? routesLocaleLinks[name] : undefined
  return typeof linked === 'string' ? linked : name
}

export function buildTranslationPayloadPath(apiBaseUrl: string, page: string, locale: string): string {
  const path = `/${trimSlashes(apiBaseUrl)}/${page}/${locale}/data.json`
  return path.includes('//') ? `/${path.split('/').filter(Boolean).join('/')}` : path
}

export function resolveTranslationPayloadBaseURL(options: {
  isServer: boolean
  baseURL: string
  apiBaseClientHost?: string
  apiBaseServerHost?: string
}): string {
  const external = options.isServer ? options.apiBaseServerHost : options.apiBaseClientHost
  return external ?? options.baseURL
}

export interface TranslationPayloadFetchRequestInput {
  apiBaseUrl: string
  routeName?: string
  locale: string
  isServer: boolean
  baseURL: string
  apiBaseClientHost?: string
  apiBaseServerHost?: string
  dateBuild?: string | number
  routesLocaleLinks?: Record<string, string>
}

export function buildTranslationPayloadFetchRequest(input: TranslationPayloadFetchRequestInput): {
  path: string
  baseURL: string
  params?: Record<string, string | number>
} {
  const page = resolveTranslationPayloadPage(input.routeName, input.routesLocaleLinks)
  return {
    path: buildTranslationPayloadPath(input.apiBaseUrl, page, input.locale),
    baseURL: resolveTranslationPayloadBaseURL(input),
    params: input.dateBuild ? { v: input.dateBuild } : undefined,
  }
}

/**
 * Builds `Cache-Control` for `/{apiBaseUrl}/:page/:locale/data.json`.
 *
 * `immutable` is only emitted when a cache-buster is active (`hasCacheBuster`),
 * i.e. requests carry `?v=<dateBuild>`. Without a cache-buster (`dateBuild` set
 * to `0`/`''`) the URL is stable across deploys, so we intentionally avoid
 * long-lived caching by returning a conservative `max-age=0` policy.
 *
 * Returns `null` when caching should be skipped — non-positive or non-finite
 * `duration` (guards `NaN`/`Infinity` from producing a malformed header).
 */
export function buildTranslationPayloadCacheControl(durationSeconds: number | undefined, hasCacheBuster = true): string | null {
  const duration = Math.floor(durationSeconds ?? 0)
  if (!Number.isSafeInteger(duration) || duration <= 0) return null
  if (hasCacheBuster) return `public, max-age=${duration}, immutable`
  // When URL is stable across deploys, we must not allow caches/CDNs to pin
  // stale payloads. `max-age=0` forces revalidation on every request.
  return 'public, max-age=0, must-revalidate'
}

/**
 * What a path-wide header can promise: it cannot see `?v=`, so a host's copy stays short.
 * No `stale-while-revalidate`: past `max-age`, which a CDN's `Age` reaches on a first visit, Chromium revalidates a fetch() or a
 * preload of this file with a loader that never reads the body, so that request is never reported finished and `networkidle` never comes.
 */
export const TRANSLATION_PAYLOAD_FILE_CACHE_CONTROL = 'public, max-age=60'

export interface TranslationPayloadCacheInput {
  httpCacheDuration?: number
  /** The header of a file a host answers. `false`: the policy from before `?v=` decided it: revalidate every file. */
  httpCacheControl?: string | false
  dateBuild?: string | number
  /** The dictionary can change with no build (`source`, `cacheTtl`, a payload host): `v` does not follow it, so nothing is pinned. */
  live?: boolean
}

export interface TranslationPayloadCachePolicy {
  /** Path-wide: the route rule, and with it `_headers` and a host's config. */
  file: string | null
  /** A response to the current `?v=`, where something sees the query. */
  current: string | null
  /** A response to an old `?v=`, or none. */
  stale: string | null
}

/**
 * The URL with the current `v` is the version-pinned one, like a hashed asset. `private`: a CDN that ignores the query
 * must not answer the next `v` from this response, and pin an old dictionary in a browser for a year.
 * An old `v` stays servable, as cached HTML still names it, and revalidates. A file header is path-wide, so it stays short.
 */
export function resolveTranslationPayloadCachePolicy(input: TranslationPayloadCacheInput): TranslationPayloadCachePolicy {
  const pinned = buildTranslationPayloadCacheControl(input.httpCacheDuration)
  const stale = buildTranslationPayloadCacheControl(input.httpCacheDuration, false)
  if (!pinned) return { file: null, current: null, stale: null }
  if (input.httpCacheControl === false || !input.dateBuild) return { file: stale, current: input.dateBuild ? pinned : stale, stale }
  const file = input.httpCacheControl ?? TRANSLATION_PAYLOAD_FILE_CACHE_CONTROL
  return { file, current: input.live ? file : pinned.replace('public', 'private'), stale: input.live ? file : stale }
}
