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

  /** Plain clone before freeze — SSR payload chunks may be Vue reactive proxies. */
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
   */
  seedFromSsrChunks(chunks: Record<string, Record<string, unknown>>): void {
    for (const [cacheKey, data] of Object.entries(chunks)) {
      this.cc.set(cacheKey, this.freezePlainClone(data))
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
    // Fast path — synchronous from cache
    const cached = this.getFromCache(locale, routeName)
    if (cached) return cached

    const cacheKey = this.getCacheKey(locale, routeName)

    // Load via fetch
    const data = await this.fetchTranslations(locale, routeName, options)

    // Store in cache
    this.cc.set(cacheKey, this.freezePlainClone(data))

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
