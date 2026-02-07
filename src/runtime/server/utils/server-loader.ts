/**
 * Server-side translation loader
 * Load translations from Nitro storage (server only)
 */
import type { ModuleOptionsExtend, Translations } from '@i18n-micro/types'
import { useStorage } from 'nitropack/runtime'
import type { Storage } from 'unstorage'
import { getI18nPrivateConfig } from '#i18n-internal/config'
import { getI18nConfig } from '#i18n-internal/strategy'

// ============================================================================
// SERVER CACHE (process-global result cache)
// ============================================================================

const CACHE_KEY = Symbol.for('__NUXT_I18N_SERVER_RESULT_CACHE__')
type CacheEntry = { data: Translations; json: string }
type ServerCache = Map<string, CacheEntry>
type GlobalWithCache = typeof globalThis & { [key: symbol]: ServerCache }

function getServerCache(): ServerCache {
  const g = globalThis as GlobalWithCache
  if (!g[CACHE_KEY]) {
    g[CACHE_KEY] = new Map()
  }
  return g[CACHE_KEY]
}

// ============================================================================
// HELPERS
// ============================================================================

function deepMerge(target: Translations, source: Translations): Translations {
  if (!target || Object.keys(target).length === 0) {
    return { ...source }
  }
  const output = { ...target }
  for (const key in source) {
    if (key === '__proto__' || key === 'constructor') continue
    const src = source[key]
    const dst = output[key]
    if (src && typeof src === 'object' && !Array.isArray(src) && dst && typeof dst === 'object' && !Array.isArray(dst)) {
      output[key] = deepMerge(dst as Translations, src as Translations)
    } else {
      output[key] = src
    }
  }
  return output
}

function toTranslations(data: unknown): Translations {
  if (!data) return {}
  if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
    return data as Translations
  }
  return {}
}

// ============================================================================
// LOADERS
// ============================================================================

async function loadFromNitroStorage(storage: Storage, locale: string, pageName?: string): Promise<Translations> {
  const privateConfig = getI18nPrivateConfig()
  const rootDirs = privateConfig.rootDirs || []
  const routesLocaleLinks = privateConfig.routesLocaleLinks || {}

  let merged: Translations = {}
  const fileLookupPage = pageName ? routesLocaleLinks[pageName] || pageName : undefined
  const normalizedPage = fileLookupPage?.replace(/\//g, ':')

  for (let i = 0; i < rootDirs.length; i++) {
    const prefix = `assets:i18n_layer_${i}`
    const key = normalizedPage ? `${prefix}:pages:${normalizedPage}:${locale}.json` : `${prefix}:${locale}.json`

    if (await storage.hasItem(key)) {
      const raw = await storage.getItem(key)
      if (raw) {
        merged = deepMerge(merged, toTranslations(raw))
      }
    }
  }
  return merged
}

async function loadMergedFromServer(locale: string, page: string | undefined): Promise<Translations> {
  const storage = useStorage()

  const general = await loadFromNitroStorage(storage, locale)
  if (!page || page === 'general') {
    return general
  }

  const pageSpecific = await loadFromNitroStorage(storage, locale, page)
  return deepMerge(general, pageSpecific)
}

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Load translations from Nitro storage with fallback locale support.
 * Used in API routes and server middleware.
 * Results are cached at the process level — loaded once, then served from memory.
 */
export async function loadTranslationsFromServer(locale: string, routeName?: string): Promise<{ data: Translations; json: string }> {
  const cache = getServerCache()
  const cacheKey = `${locale}:${routeName || 'general'}`

  // Fast path: from cache
  const cached = cache.get(cacheKey)
  if (cached) {
    return cached
  }

  // Slow path: load and merge
  const config = getI18nConfig() as ModuleOptionsExtend
  const { locales, fallbackLocale } = config

  const localeConfig = locales?.find((l) => l.code === locale)
  if (!localeConfig) {
    const empty = { data: {}, json: '{}' }
    cache.set(cacheKey, empty)
    return empty
  }

  const localesToMerge: string[] = [fallbackLocale, localeConfig.fallbackLocale, locale]
    .filter((l): l is string => !!l)
    .filter((v, i, arr) => arr.indexOf(v) === i)

  const page = routeName === 'general' ? undefined : routeName

  let result: Translations = {}
  for (const loc of localesToMerge) {
    const data = await loadMergedFromServer(loc, page)
    result = localesToMerge.length === 1 ? data : deepMerge(result, data)
  }

  const json = JSON.stringify(result).replace(/</g, '\\u003c')
  const entry = { data: result, json }

  // Store in cache
  cache.set(cacheKey, entry)

  return entry
}
