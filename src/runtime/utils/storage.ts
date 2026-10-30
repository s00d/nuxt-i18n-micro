import { joinURL, withQuery } from 'ufo'
import { translationCacheKey } from '@i18n-micro/core/helpers'
import { STORAGE_CC_KEY } from './cache-keys'
import { CacheControl, type CacheControlOptions } from '@i18n-micro/utils/cache-control'
import type { TranslationPayloadFetcher } from '@i18n-micro/utils/payload-fetch'
import { buildTranslationPayloadFetchRequest } from '@i18n-micro/utils/payload-url'

export interface LoadOptions {
  apiBaseUrl: string
  baseURL: string
  apiBaseClientHost?: string
  apiBaseServerHost?: string
  dateBuild?: string | number
  routesLocaleLinks?: Record<string, string>
  /** Server only: the Nitro loader of this request (`event.context.i18n.load`), called directly. */
  serverLoad?: (locale: string, routeName: string) => Promise<Record<string, unknown>>
}

export interface LoadResult {
  data: Record<string, unknown>
  cacheKey: string
}

// ============================================================================
// STORAGE CLASS
// ============================================================================

type GlobalWithCC = typeof globalThis & { [key: symbol]: unknown }

function getStorageCacheControl(): CacheControl<Record<string, unknown>> {
  const g = globalThis as GlobalWithCC
  if (!g[STORAGE_CC_KEY]) {
    g[STORAGE_CC_KEY] = new CacheControl<Record<string, unknown>>()
  }
  return g[STORAGE_CC_KEY] as CacheControl<Record<string, unknown>>
}

class TranslationStorage {
  private cc: CacheControl<Record<string, unknown>>
  /** Bumped by `clear()`: a response requested before it may predate the edit the clear is for. */
  private clears = 0

  constructor() {
    this.cc = getStorageCacheControl()
  }

  /**
   * Configure cache limits. Call once from plugin with config values.
   */
  configure(options: CacheControlOptions): void {
    this.cc.configure(options)
  }

  // ==========================================================================
  // HELPERS
  // ==========================================================================

  /**
   * Freeze a shallow copy before it enters the cache so a consumer cannot mutate
   * what other callers will read. Nested values are shared on purpose — cheap, and
   * no caller mutates a chunk in place.
   */
  private freezeChunk(data: Record<string, unknown>): Record<string, unknown> {
    return Object.freeze({ ...data })
  }

  private getCacheKey(locale: string, routeName?: string): string {
    return translationCacheKey(locale, routeName)
  }

  // ==========================================================================
  // FETCH LOADER
  // ==========================================================================

  private async fetchTranslations(locale: string, routeName: string | undefined, options: LoadOptions): Promise<Record<string, unknown>> {
    const serverHost = options.apiBaseServerHost ?? (import.meta.server ? process.env.NUXT_I18N_APP_BASE_SERVER_HOST : undefined)
    // SSR: ask the server loader directly (its cached, shared chunk) instead of a local HTTP
    // round trip that re-parses the JSON into a new copy on every request
    if (import.meta.server && options.serverLoad && !serverHost) return await options.serverLoad(locale, routeName ?? '')
    const request = this.request(locale, routeName, options, import.meta.server, serverHost)

    // Call-site cast keeps Nuxt `$fetch` (Nitro localFetch when relative); avoids MatchedRoutes TS2321.
    return await ($fetch as TranslationPayloadFetcher)(request.path, {
      baseURL: request.baseURL,
      params: request.params,
    })
  }

  private request(locale: string, routeName: string | undefined, options: LoadOptions, isServer: boolean, apiBaseServerHost?: string) {
    return buildTranslationPayloadFetchRequest({
      apiBaseUrl: options.apiBaseUrl,
      routeName,
      locale,
      isServer,
      baseURL: options.baseURL,
      apiBaseClientHost: options.apiBaseClientHost,
      apiBaseServerHost,
      dateBuild: options.dateBuild,
      routesLocaleLinks: options.routesLocaleLinks,
    })
  }

  /** The URL the browser fetches a chunk from: what SSR preloads for the first page. */
  clientUrl(locale: string, routeName: string | undefined, options: LoadOptions): string {
    const request = this.request(locale, routeName, options, false)
    return withQuery(joinURL(request.baseURL, request.path), request.params ?? {})
  }

  /** Seed cache without fetching (e.g. `serverTranslationPreload` for index). */
  seed(locale: string, routeName: string | undefined, data: Record<string, unknown>): void {
    const cacheKey = this.getCacheKey(locale, routeName)
    this.cc.set(cacheKey, this.freezeChunk(data))
  }

  // ==========================================================================
  // PUBLIC API
  // ==========================================================================

  /**
   * Synchronous cache check and retrieval.
   * Returns data if cached (and not expired), otherwise null.
   */
  getFromCache(locale: string, routeName?: string): LoadResult | null {
    const cacheKey = this.getCacheKey(locale, routeName)

    // From cache
    const cached = this.cc.get(cacheKey)
    if (cached) {
      return { data: cached, cacheKey }
    }

    return null
  }

  /**
   * Load translations (with caching).
   * Returns data, cache key, and JSON for injection (server only).
   */
  async load(locale: string, routeName: string | undefined, options: LoadOptions): Promise<LoadResult> {
    const cached = this.getFromCache(locale, routeName)
    if (cached) return cached

    const cacheKey = this.getCacheKey(locale, routeName)
    const clears = this.clears
    const data = await this.fetchTranslations(locale, routeName, options)
    if (clears !== this.clears) return this.load(locale, routeName, options)

    // Already a plain object — freezing is enough, and it guards the loader's own
    // cached copy against in-place mutation now that we may be sharing it.
    this.cc.set(cacheKey, this.freezeChunk(data))

    return { data: this.cc.get(cacheKey)!, cacheKey }
  }

  /**
   * Clear cache and metadata.
   */
  clear(): void {
    this.clears++
    this.cc.clear()
  }
}

// ============================================================================
// SINGLETON
// ============================================================================

export const translationStorage = new TranslationStorage()
