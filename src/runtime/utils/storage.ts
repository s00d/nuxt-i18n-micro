import { joinURL, withQuery } from 'ufo'
import { translationCacheKey } from '@i18n-micro/core/helpers'
import { STORAGE_CC_KEY } from './cache-keys'
import { CacheControl, type CacheControlOptions } from '@i18n-micro/utils/cache-control'
import { PREMERGED_ROOT_PAGE } from '@i18n-micro/utils/merge-source'
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
  /** Server only: `serverLoad` also covers a remote host, because `cacheStorage` sits in front of it. */
  serverLoadsRemote?: boolean
}

export interface LoadResult {
  data: Record<string, unknown>
  cacheKey: string
}

// ============================================================================
// STORAGE CLASS
// ============================================================================

type GlobalWithCC = typeof globalThis & { [key: symbol]: unknown }

/** The process-wide chunk cache. `clears` lives with it: the HMR watcher empties it without this module. */
class ChunkCache extends CacheControl<Record<string, unknown>> {
  /** A response requested before a clear may predate the edit the clear is for. */
  clears = 0

  override clear(): void {
    this.clears++
    super.clear()
  }
}

function getStorageCacheControl(): ChunkCache {
  const g = globalThis as GlobalWithCC
  if (!g[STORAGE_CC_KEY]) {
    g[STORAGE_CC_KEY] = new ChunkCache()
  }
  return g[STORAGE_CC_KEY] as ChunkCache
}

/** A render with a runtime host fetches it itself, unless the loader covers the host (`cacheStorage`). */
export function readsThroughServerLoader(options: Pick<LoadOptions, 'serverLoad' | 'serverLoadsRemote'>, serverHost: string | undefined): boolean {
  return Boolean(options.serverLoad && (!serverHost || options.serverLoadsRemote))
}

class TranslationStorage {
  private cc: ChunkCache

  constructor() {
    this.cc = getStorageCacheControl()
  }

  /**
   * Configure cache limits: the plugin's config values, on every request on the server, where this copy is process-wide.
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
    if (import.meta.server && readsThroughServerLoader(options, serverHost)) return await options.serverLoad!(locale, routeName ?? '')
    const request = this.request(locale, routeName, options, import.meta.server, serverHost)

    // Call-site cast keeps Nuxt `$fetch` (Nitro localFetch when relative); avoids MatchedRoutes TS2321.
    return await ($fetch as TranslationPayloadFetcher)(request.path, {
      baseURL: request.baseURL,
      params: request.params,
    })
  }

  /**
   * A chunk, or `null` when the host has no file for it: a 404, or a static host's SPA shell in a page's place.
   * Anything else is a failed load, and the next try can work.
   */
  private async fetchChunk(locale: string, routeName: string | undefined, options: LoadOptions): Promise<Record<string, unknown> | null> {
    const data = await this.fetchTranslations(locale, routeName, options).catch((error) => {
      if ((error as { status?: number }).status === 404) return null
      throw error
    })
    if (data === null || (typeof data === 'object' && !Array.isArray(data))) return data
    if (routeName !== PREMERGED_ROOT_PAGE) return null
    // a 200 with another body on the root file too: a portal or a proxy, not this site's files
    throw new TypeError(`[i18n] Invalid translation payload: ${this.getCacheKey(locale, routeName)}`)
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
    const clears = this.cc.clears
    const data = await this.fetchChunk(locale, routeName, options)
    if (clears !== this.cc.clears) return this.load(locale, routeName, options)
    // No file: the page shows the root dictionary, as the server route answers it, and no root file either (`source` mode on
    // a file host, which the build warns about) is an empty one, as a missing file must not stop a switch. Neither is kept
    // under this key: during a deploy the file can appear, and the next page load gets it.
    // ponytail: an open tab keeps the stand-in in the i18n instance until a reload, a chunk added under it is that rare
    if (data === null) {
      const stand = routeName === PREMERGED_ROOT_PAGE ? Object.freeze({}) : (await this.load(locale, PREMERGED_ROOT_PAGE, options)).data
      return { data: stand, cacheKey }
    }

    // Already a plain object — freezing is enough, and it guards the loader's own
    // cached copy against in-place mutation now that we may be sharing it.
    this.cc.set(cacheKey, this.freezeChunk(data))

    return { data: this.cc.get(cacheKey)!, cacheKey }
  }

  /**
   * Clear cache and metadata.
   */
  clear(): void {
    this.cc.clear()
  }
}

// ============================================================================
// SINGLETON
// ============================================================================

export const translationStorage = new TranslationStorage()
