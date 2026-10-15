/**
 * Shared SERVER_CC factory for Nitro translation loader + HMR watcher.
 * Whoever creates first must apply `cacheMaxSize` / `cacheTtl` from config —
 * both call sites go through here (no bare `new CacheControl()`).
 */
import { SERVER_CC_KEY } from '@i18n-micro/hmr/cache-keys'
import type { ModuleOptionsExtend, Translations } from '@i18n-micro/types'
import { CacheControl } from '@i18n-micro/utils/cache-control'
import { resolveI18nConfigWithRuntimeOverrides } from '@i18n-micro/utils/runtime-config'
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

function resolveLimits(limits?: { maxSize: number; ttl: number }): { maxSize: number; ttl: number } {
  if (limits) return limits
  const cfg = resolveI18nConfigWithRuntimeOverrides(getI18nConfig() as ModuleOptionsExtend)
  return { maxSize: cfg.cacheMaxSize ?? 0, ttl: cfg.cacheTtl ?? 0 }
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
