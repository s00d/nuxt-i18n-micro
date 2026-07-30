import { translationCacheKey } from '@i18n-micro/core/helpers'
import { STORAGE_CC_KEY } from '@i18n-micro/hmr/cache-keys'
import { CacheControl, type CacheControlOptions } from '@i18n-micro/utils/cache-control'
import { buildTranslationPayloadFetchRequest } from '@i18n-micro/utils/payload-url'

export interface LoadOptions {
  apiBaseUrl: string
  baseURL: string
  apiBaseClientHost?: string
  apiBaseServerHost?: string
  dateBuild?: string | number
  routesLocaleLinks?: Record<string, string>
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
   * Detach from Vue reactivity before freezing. Only the SSR payload needs this:
   * its chunks come back as reactive proxies, and freezing a proxy would freeze
   * the reactive object the app is still using.
   */
  /**
   * Freeze a chunk before it enters the cache, so a consumer cannot mutate what other
   * callers will read.
   *
   * The freeze is applied to a copy, never to the caller's object: the SSR seed arrives as
   * `nuxtApp.payload.data['i18n-ssr-chunks']`, which Nuxt still owns, and freezing that in
   * place would make the payload immutable for everything else on the page.
   *
   * A shallow copy, though — the nested values are shared, which is what makes this cheap.
   * Deep-cloning meant serialising and re-parsing the largest object on the page during
   * hydration, and it protected nothing: no caller mutates a chunk in place.
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
    const request = buildTranslationPayloadFetchRequest({
      apiBaseUrl: options.apiBaseUrl,
      routeName,
      locale,
      isServer: import.meta.server,
      baseURL: options.baseURL,
      apiBaseClientHost: options.apiBaseClientHost,
      apiBaseServerHost: options.apiBaseServerHost ?? (import.meta.server ? process.env.NUXT_I18N_APP_BASE_SERVER_HOST : undefined),
      dateBuild: options.dateBuild,
      routesLocaleLinks: options.routesLocaleLinks,
    })

    return (await $fetch(request.path, {
      baseURL: request.baseURL,
      params: request.params,
    })) as Record<string, unknown>
  }

  // ==========================================================================
  // PUBLIC API
  // ==========================================================================

  /**
   * Seed translation cache from the SSR payload (`payload.data['i18n-ssr-chunks']`).
   * Called on the client before the first fetch.
   */
  seedFromSsrChunks(chunks: Record<string, Record<string, unknown>>): void {
    for (const [cacheKey, data] of Object.entries(chunks)) {
      this.cc.set(cacheKey, this.freezeChunk(data))
    }
  }

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
    const data = await this.fetchTranslations(locale, routeName, options)

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
