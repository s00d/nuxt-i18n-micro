export function resolveTranslationPayloadPage(routeName: string | undefined, routesLocaleLinks?: Record<string, string>): string {
  const name = routeName || 'index'
  return routesLocaleLinks?.[name] ?? name
}

export function buildTranslationPayloadPath(apiBaseUrl: string, page: string, locale: string): string {
  const normalizedBase = apiBaseUrl.replace(/^\/+|\/+$/g, '')
  return `/${normalizedBase}/${page}/${locale}/data.json`.replace(/\/{2,}/g, '/')
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
 * to `0`/`''`) the URL is stable across deploys, so we fall back to a plain
 * `max-age` that revalidates instead of pinning stale payloads forever.
 *
 * Returns `null` when caching should be skipped — non-positive or non-finite
 * `duration` (guards `NaN`/`Infinity` from producing a malformed header).
 */
export function buildTranslationPayloadCacheControl(durationSeconds: number | undefined, hasCacheBuster = true): string | null {
  const duration = Math.floor(durationSeconds ?? 0)
  if (!Number.isFinite(duration) || duration <= 0) return null
  return hasCacheBuster ? `public, max-age=${duration}, immutable` : `public, max-age=${duration}`
}
