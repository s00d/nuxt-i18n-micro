/**
 * Translation Storage
 * Unified translation storage for client and server.
 * Cache control (TTL, maxSize) delegated to CacheControl.
 */
import { CacheControl, type CacheControlOptions } from './cache-control'

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

const CC_KEY = Symbol.for('__NUXT_I18N_STORAGE_CC__')
type GlobalWithCC = typeof globalThis & { [key: symbol]: unknown }

function getStorageCacheControl(): CacheControl<Record<string, unknown>> {
  const g = globalThis as GlobalWithCC
  if (!g[CC_KEY]) {
    g[CC_KEY] = new CacheControl<Record<string, unknown>>()
  }
  return g[CC_KEY] as CacheControl<Record<string, unknown>>
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

  private getCacheKey(locale: string, routeName?: string): string {
    return `${locale}:${routeName || 'index'}`
  }

  // ==========================================================================
  // FETCH LOADER
  // ==========================================================================

  private async fetchTranslations(locale: string, routeName: string | undefined, options: LoadOptions): Promise<Record<string, unknown>> {
    const { apiBaseUrl, baseURL, dateBuild } = options
    const page = routeName || 'index'
    const path = `/${apiBaseUrl}/${page}/${locale}/data.json`

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
   * Returns data if cached (and not expired), otherwise null.
   */
  getFromCache(locale: string, routeName?: string): LoadResult | null {
    const cacheKey = this.getCacheKey(locale, routeName)

    // From cache
    const cached = this.cc.get(cacheKey)
    if (cached) {
      return { data: cached, cacheKey }
    }

    // CLIENT: Check SSR injection
    if (import.meta.client && typeof window !== 'undefined' && window.__I18N__?.[cacheKey]) {
      const data = window.__I18N__[cacheKey] as Record<string, unknown>
      window.__I18N__[cacheKey] = undefined
      this.cc.set(cacheKey, Object.freeze(data))
      return { data: this.cc.get(cacheKey)!, cacheKey }
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
    this.cc.set(cacheKey, Object.freeze(data))

    // SERVER: Generate JSON for client injection
    const json = import.meta.server ? JSON.stringify(data).replace(/</g, '\\u003c') : undefined

    return { data: this.cc.get(cacheKey)!, cacheKey, json }
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
