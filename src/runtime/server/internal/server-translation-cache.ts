/** The Nitro translation cache of the loader and the HMR watcher: one bundle, one instance. */
import { DEFAULT_SERVER_CACHE_SIZE } from '../../utils/cache-keys'
import type { ResolvedI18nConfig, Translations } from '@i18n-micro/types'
import { CacheControl } from '@i18n-micro/utils/cache-control'
import { getI18nConfig } from '#i18n-internal/strategy'

export type ServerTranslationCacheEntry = {
  data: Translations
  json: string
  /** Of a root read from a file: what a delta names. */
  mark?: string
}

let cache: CacheControl<ServerTranslationCacheEntry> | undefined

export function getOrCreateServerTranslationCache(): CacheControl<ServerTranslationCacheEntry> {
  if (cache) return cache
  // cache limits are build-time options: no runtime overrides to apply
  const { cacheMaxSize, cacheTtl } = getI18nConfig()
  cache = new CacheControl<ServerTranslationCacheEntry>({ maxSize: cacheMaxSize || DEFAULT_SERVER_CACHE_SIZE, ttl: cacheTtl })
  return cache
}
