/**
 * Translation Storage
 * Unified translation storage for client and server.
 */
declare global {
  interface Window {
    __I18N__?: Record<string, unknown>
  }
}

export interface LoadOptions {
  apiBaseUrl: string
  baseURL: string
  dateBuild?: string | number
}

export interface LoadResult {
  data: Record<string, unknown>
  cacheKey: string
  json?: string
}

// ============================================================================
// STORAGE CLASS
// ============================================================================

const CACHE_KEY = Symbol.for('__NUXT_I18N_STORAGE_CACHE__')

type StorageCache = Map<string, Record<string, unknown>>
type GlobalWithCache = typeof globalThis & { [key: symbol]: StorageCache }

class TranslationStorage {
  private cache: StorageCache

  constructor() {
    const g = globalThis as GlobalWithCache
    if (!g[CACHE_KEY]) {
      g[CACHE_KEY] = new Map()
    }
    this.cache = g[CACHE_KEY]
  }

  // ==========================================================================
  // PRIVATE CACHE API
  // ==========================================================================

  private getCacheKey(locale: string, routeName?: string): string {
    return routeName ? `${locale}:${routeName}` : `${locale}:general`
  }

  private has(locale: string, routeName?: string): boolean {
    return this.cache.has(this.getCacheKey(locale, routeName))
  }

  private get(locale: string, routeName?: string): Record<string, unknown> | undefined {
    return this.cache.get(this.getCacheKey(locale, routeName))
  }

  private set(locale: string, routeName: string | undefined, data: Record<string, unknown>): void {
    this.cache.set(this.getCacheKey(locale, routeName), Object.freeze(data))
  }

  // ==========================================================================
  // FETCH LOADER
  // ==========================================================================

  private async fetchTranslations(locale: string, routeName: string | undefined, options: LoadOptions): Promise<Record<string, unknown>> {
    const { apiBaseUrl, baseURL, dateBuild } = options
    const path = routeName ? `/${apiBaseUrl}/${routeName}/${locale}/data.json` : `/${apiBaseUrl}/general/${locale}/data.json`

    return (await $fetch(path.replace(/\/{2,}/g, '/'), {
      baseURL,
      params: dateBuild ? { v: dateBuild } : undefined,
    })) as Record<string, unknown>
  }

  // ==========================================================================
  // PUBLIC API
  // ==========================================================================

  /**
   * Synchronous cache check and retrieval.
   * Returns data if cached, otherwise null.
   */
  getFromCache(locale: string, routeName?: string): LoadResult | null {
    const cacheKey = this.getCacheKey(locale, routeName)

    // From cache
    if (this.has(locale, routeName)) {
      return { data: this.get(locale, routeName)!, cacheKey }
    }

    // CLIENT: Check SSR injection
    if (import.meta.client && typeof window !== 'undefined' && window.__I18N__?.[cacheKey]) {
      const data = window.__I18N__[cacheKey] as Record<string, unknown>
      window.__I18N__[cacheKey] = undefined
      this.set(locale, routeName, data)
      return { data: this.get(locale, routeName)!, cacheKey }
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
    this.set(locale, routeName, data)

    // SERVER: Generate JSON for client injection
    const json = import.meta.server ? JSON.stringify(data).replace(/</g, '\\u003c') : undefined

    return { data: this.get(locale, routeName)!, cacheKey, json }
  }

  /**
   * Clear cache.
   */
  clear(): void {
    this.cache.clear()
  }
}

// ============================================================================
// SINGLETON
// ============================================================================

export const translationStorage = new TranslationStorage()
