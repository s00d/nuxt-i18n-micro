/**
 * Shared SERVER_CC factory for Nitro translation loader + HMR watcher.
 * Whoever creates first must apply `cacheMaxSize` / `cacheTtl` from config —
 * both call sites go through here (no bare `new CacheControl()`).
 */
import { SERVER_CC_KEY } from '../../utils/cache-keys'
import type { ModuleOptionsExtend, Translations } from '@i18n-micro/types'
import { CacheControl } from '@i18n-micro/utils/cache-control'
import { getI18nConfig } from '#i18n-internal/strategy'

export type ServerTranslationCacheEntry = { data: Translations; json: string }

type GlobalWithCC = typeof globalThis & { [key: symbol]: unknown }

function isServerTranslationCache(value: unknown): value is CacheControl<ServerTranslationCacheEntry> {
  // Duck-type: Vite/Nitro can load two copies of CacheControl → `instanceof` fails.
  return (
    !!value &&
    typeof value === 'object' &&
    typeof (value as CacheControl<ServerTranslationCacheEntry>).get === 'function' &&
    typeof (value as CacheControl<ServerTranslationCacheEntry>).set === 'function' &&
    typeof (value as CacheControl<ServerTranslationCacheEntry>).configure === 'function'
  )
}

/**
 * Entries the server keeps when `cacheMaxSize` is not set. Never unbounded: every distinct
 * `locale:page` a request names would otherwise stay in memory for the life of the process.
 */
export const DEFAULT_SERVER_CACHE_SIZE = 1000

function resolveLimits(limits?: { maxSize: number; ttl: number }): { maxSize: number; ttl: number } {
  if (limits) return limits
  // cache limits are build-time options: no runtime overrides to apply
  const cfg = getI18nConfig() as ModuleOptionsExtend
  return { maxSize: cfg.cacheMaxSize || DEFAULT_SERVER_CACHE_SIZE, ttl: cfg.cacheTtl ?? 0 }
}

/** Get or create the process-wide server translation cache (limits applied once at create). */
export function getOrCreateServerTranslationCache(limits?: { maxSize: number; ttl: number }): CacheControl<ServerTranslationCacheEntry> {
  const g = globalThis as GlobalWithCC
  const existing = g[SERVER_CC_KEY]
  if (isServerTranslationCache(existing)) return existing

  const created = new CacheControl<ServerTranslationCacheEntry>(resolveLimits(limits))
  g[SERVER_CC_KEY] = created
  return created
}
