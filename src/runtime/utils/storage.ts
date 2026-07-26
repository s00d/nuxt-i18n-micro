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
  /** cacheKey -> keys seeded from an SSR render set, pending completion. */
  private partialKeys = new Map<string, string[]>()

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
  private freezePlainClone(data: Record<string, unknown>): Record<string, unknown> {
    return Object.freeze(JSON.parse(JSON.stringify(data)) as Record<string, unknown>)
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
   * Seed translation cache from SSR payload (`useState('i18n-ssr-chunks')`).
   * Called on client before the first fetch.
   *
   * The payload holds only the keys the server resolved while rendering — enough to
   * hydrate, but not the whole dictionary. Entries are flagged so the loader still
   * completes them in the background, and so their keys can be dropped again once
   * the full chunk arrives.
   */
  seedFromSsrChunks(chunks: Record<string, Record<string, unknown>>): void {
    for (const [cacheKey, data] of Object.entries(chunks)) {
      this.cc.set(cacheKey, this.freezePlainClone(data))
      this.partialKeys.set(cacheKey, Object.keys(data))
    }
  }

  /** Whether this cache entry came from a render set and still lacks the rest of the chunk. */
  isPartial(cacheKey: string): boolean {
    return this.partialKeys.has(cacheKey)
  }

  /**
   * Keys that were seeded from the render set, cleared in the same call.
   *
   * The render set is stored flat (`{'nav.about': 'About'}`) and `getByPath` checks
   * own properties before splitting on dots, so a leftover flat key would shadow the
   * nested value from the full chunk — stale after an HMR edit. Completion drops them.
   */
  takePartialKeys(cacheKey: string): string[] {
    const keys = this.partialKeys.get(cacheKey)
    this.partialKeys.delete(cacheKey)
    return keys ?? []
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
    const cacheKey = this.getCacheKey(locale, routeName)

    // Fast path — synchronous from cache. A render-set seed lives in this same cache
    // but holds only the rendered keys, so it must not satisfy a load: that is the
    // request that fetches the rest of the dictionary.
    const cached = this.getFromCache(locale, routeName)
    if (cached && !this.isPartial(cacheKey)) return cached

    // Load via fetch (or, on the server, straight from the payload loader)
    const data = await this.fetchTranslations(locale, routeName, options)

    // Already a plain object — freezing is enough, and it guards the loader's own
    // cached copy against in-place mutation now that we may be sharing it.
    this.cc.set(cacheKey, Object.freeze(data))

    return { data: this.cc.get(cacheKey)!, cacheKey }
  }

  /**
   * Clear cache and metadata.
   */
  clear(): void {
    this.cc.clear()
    this.partialKeys.clear()
  }
}

// ============================================================================
// SINGLETON
// ============================================================================

export const translationStorage = new TranslationStorage()
