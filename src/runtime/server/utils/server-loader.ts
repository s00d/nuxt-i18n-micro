/**
 * Server-side translation loader.
 * All merging (layers, fallback locales, global + page) is done at build time.
 * This loader simply reads a single pre-built file from Nitro storage and returns it.
 */
import type { ModuleOptionsExtend, Translations } from '@i18n-micro/types'
import { useStorage } from 'nitropack/runtime'
import { getI18nConfig } from '#i18n-internal/strategy'
import { CacheControl } from '../../utils/cache-control'

// ============================================================================
// SERVER CACHE
// ============================================================================

type CacheEntry = { data: Translations; json: string }

const CC_KEY = Symbol.for('__NUXT_I18N_SERVER_CACHE_CC__')
type GlobalWithCC = typeof globalThis & { [key: symbol]: unknown }

function getServerCacheControl(): CacheControl<CacheEntry> {
  const g = globalThis as GlobalWithCC
  if (!g[CC_KEY]) {
    const cfg = getI18nConfig() as ModuleOptionsExtend
    g[CC_KEY] = new CacheControl<CacheEntry>({ maxSize: cfg.cacheMaxSize ?? 0, ttl: cfg.cacheTtl ?? 0 })
  }
  return g[CC_KEY] as CacheControl<CacheEntry>
}

// ============================================================================
// HELPERS
// ============================================================================

const ASSETS_PREFIX = 'assets:i18n'

function toTranslations(data: unknown): Translations {
  if (!data) return {}
  if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
    return data as Translations
  }
  return {}
}

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Load translations for a given locale and page.
 * Returns a single pre-built file (global + page + fallback already baked in at build time).
 */
export async function loadTranslationsFromServer(locale: string, routeName: string): Promise<{ data: Translations; json: string }> {
  const cc = getServerCacheControl()
  const cacheKey = `${locale}:${routeName}`

  const cached = cc.get(cacheKey)
  if (cached) {
    return cached
  }

  const config = getI18nConfig() as ModuleOptionsExtend
  if (!config.locales?.find((l) => l.code === locale)) {
    const empty = { data: {}, json: '{}' }
    cc.set(cacheKey, empty)
    return empty
  }

  const storage = useStorage()
  const routesLocaleLinks = config.routesLocaleLinks || {}
  const resolvedPage = routesLocaleLinks[routeName] || routeName
  const normalizedPage = resolvedPage.replace(/\//g, ':')
  const key = `${ASSETS_PREFIX}:pages:${normalizedPage}:${locale}.json`

  const data: Translations = (await storage.hasItem(key)) ? toTranslations(await storage.getItem(key)) : {}

  const json = JSON.stringify(data).replace(/</g, '\\u003c')
  const entry = { data, json }

  cc.set(cacheKey, entry)
  return entry
}
