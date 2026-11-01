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
  dateBuild?: string | number
  routesLocaleLinks?: Record<string, string>
  /**
   * Server only: the Nitro loader of this request (`event.context.i18n.load`), called directly. It reads a host too, named at
   * build time or in the environment, so a render has one source. `null` is a host's "no such file", as a 404 is for a browser.
   */
  serverLoad?: (locale: string, routeName: string) => Promise<Record<string, unknown> | null>
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
   * On the server the cache is shared by every request, so its root is frozen, once, in place: nested values are shared
   * on purpose, and no caller mutates a chunk. A browser fetched this object for itself and has one reader: nothing to guard.
   */
  private shared(data: Record<string, unknown>): Record<string, unknown> {
    return import.meta.server ? Object.freeze(data) : data
  }

  private getCacheKey(locale: string, routeName?: string): string {
    return translationCacheKey(locale, routeName)
  }

  // ==========================================================================
  // FETCH LOADER
  // ==========================================================================

  private async fetchTranslations(locale: string, routeName: string | undefined, options: LoadOptions): Promise<Record<string, unknown> | null> {
    // SSR: ask the server loader directly (its cached, shared chunk) instead of a local HTTP
    // round trip that re-parses the JSON into a new copy on every request
    if (import.meta.server && options.serverLoad) return await options.serverLoad(locale, routeName ?? '')
    const request = this.request(locale, routeName, options, import.meta.server)

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

  private request(locale: string, routeName: string | undefined, options: LoadOptions, isServer: boolean) {
    return buildTranslationPayloadFetchRequest({
      apiBaseUrl: options.apiBaseUrl,
      routeName,
      locale,
      isServer,
      baseURL: options.baseURL,
      apiBaseClientHost: options.apiBaseClientHost,
      dateBuild: options.dateBuild,
      routesLocaleLinks: options.routesLocaleLinks,
    })
  }

  /** The URL the browser fetches a chunk from: what SSR preloads for the first page. */
  clientUrl(locale: string, routeName: string | undefined, options: LoadOptions): string {
    const request = this.request(locale, routeName, options, false)
    return withQuery(joinURL(request.baseURL, request.path), request.params ?? {})
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
    // the render reads the server's own cache, which counts `cacheTtl`: a copy here would count it a second time
    const direct = import.meta.server && Boolean(options.serverLoad)
    const cached = direct ? null : this.getFromCache(locale, routeName)
    if (cached) return cached

    const cacheKey = this.getCacheKey(locale, routeName)
    const clears = this.cc.clears
    const data = await this.fetchChunk(locale, routeName, options)
    if (clears !== this.cc.clears) return this.load(locale, routeName, options)
    // No file: the page shows the root dictionary, as the server route does for a build's own pages, and no root file either
    // (`source` mode on a file host, which the build warns about) is an empty one, as a missing file must not stop a switch.
    // Neither is kept under this key: during a deploy the file can appear, and the next page load gets it.
    // ponytail: an open tab keeps the stand-in in the i18n instance until a reload, a chunk added under it is that rare
    if (data === null && routeName === PREMERGED_ROOT_PAGE) {
      // a request can show raw keys and retry; a written file keeps them, so this counts as a failed load
      if (import.meta.server && import.meta.prerender) throw new Error('[i18n] The host has no dictionary for this page')
      return { data: Object.freeze({}), cacheKey }
    }
    if (data === null) return { ...(await this.load(locale, PREMERGED_ROOT_PAGE, options)), cacheKey }

    if (!direct) this.cc.set(cacheKey, this.shared(data))

    return { data, cacheKey }
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
