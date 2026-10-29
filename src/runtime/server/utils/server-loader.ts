/**
 * Server-side translation loader.
 * - Node: JSON from public locales dir (`#i18n-internal/payload-source` → fs)
 * - Edge: Nitro `serverAssets` (`assets:i18n`)
 * - Dev: live locale files on every read (no cache to go stale on edits)
 * `premerged` reads one file; `source` merges root+page+fallback at runtime.
 *
 * Bounded: entries live in one LRU cache, concurrent loads of a chunk share one read, and in
 * premerged mode every page without its own payload shares the root entry — so request URLs
 * with made-up page names cannot grow memory.
 */

import type { ModuleOptionsExtend, Translations } from '@i18n-micro/types'
import { isEnabledLocale } from '@i18n-micro/utils/active-locales'
import { normalizeConfiguredLocales, PREMERGED_ROOT_PAGE, toPremergedStorageKey } from '@i18n-micro/utils/merge-source'
import { fetchTranslationPayloadFromHost, type TranslationPayloadFetcher } from '@i18n-micro/utils/payload-fetch'
import { resolveTranslationPayloadPage } from '@i18n-micro/utils/payload-url'
import { resolveI18nConfigWithRuntimeOverrides } from '@i18n-micro/utils/runtime-config'
import { loadSourceTranslationsFromStorage } from '@i18n-micro/utils/source-loader'
import { toTranslations } from '@i18n-micro/utils/normalize'
import { readPayload } from '#i18n-internal/payload-source'
import { getI18nPrivateConfig } from '#i18n-internal/config'
import { getI18nConfig } from '#i18n-internal/strategy'
import { useRuntimeConfig } from '#imports'
import { loadLiveDevTranslations } from './dev-live-translations'
import { getOrCreateServerTranslationCache, type ServerTranslationCacheEntry } from './server-translation-cache'

const EMPTY: ServerTranslationCacheEntry = { data: {}, json: '{}' }
const pending = new Map<string, Promise<ServerTranslationCacheEntry>>()

const toEntry = (data: Translations): ServerTranslationCacheEntry => ({ data, json: JSON.stringify(data).replace(/</g, '\\u003c') })

export async function loadTranslationsFromServer(locale: string, routeName: string): Promise<ServerTranslationCacheEntry> {
  const config = resolveI18nConfigWithRuntimeOverrides(getI18nConfig() as ModuleOptionsExtend, useRuntimeConfig().public as Record<string, unknown>)
  if (!isEnabledLocale(config.locales, locale)) return EMPTY
  const page = resolveTranslationPayloadPage(routeName, config.routesLocaleLinks || {})
  if (import.meta.dev) return toEntry(await loadLiveDevTranslations(locale, page, config))
  return cached(`${locale}:${page}`, () => load(locale, page, config))
}

/** One cache entry per key, one in-flight load per key. A load may answer with the key of an entry to share. */
function cached(key: string, read: () => Promise<ServerTranslationCacheEntry | string>): Promise<ServerTranslationCacheEntry> {
  const cache = getOrCreateServerTranslationCache()
  const hit = cache.get(key)
  if (hit) return Promise.resolve(hit)
  const inFlight = pending.get(key)
  if (inFlight) return inFlight
  const promise = read()
    .then((result) => (typeof result === 'string' ? cached(result, () => Promise.resolve(EMPTY)) : store(key, result)))
    .finally(() => pending.delete(key))
  pending.set(key, promise)
  return promise
}

function store(key: string, entry: ServerTranslationCacheEntry): ServerTranslationCacheEntry {
  getOrCreateServerTranslationCache().set(key, entry)
  return entry
}

async function load(locale: string, page: string, config: ModuleOptionsExtend): Promise<ServerTranslationCacheEntry | string> {
  const { apiBaseServerHost } = getI18nPrivateConfig()
  if (apiBaseServerHost) {
    const data = await fetchTranslationPayloadFromHost(
      { apiBaseUrl: config.apiBaseUrl, apiBaseServerHost, dateBuild: config.dateBuild },
      locale,
      page,
      $fetch as TranslationPayloadFetcher,
    )
    return toEntry(data)
  }
  if (config.translationPayloadMode === 'source') {
    const data = await loadSourceTranslationsFromStorage(
      { getItem: (key: string) => readPayload(key) },
      {
        locale,
        pageName: page,
        locales: normalizeConfiguredLocales(config.locales),
        globalFallbackLocale: config.fallbackLocale,
        disablePageLocales: config.disablePageLocales,
      },
    )
    return toEntry(data)
  }
  // a page payload always carries the root keys: an empty one means the page has no folder
  const own = toTranslations(await readPayload(toPremergedStorageKey(page, locale)))
  if (Object.keys(own).length || page === PREMERGED_ROOT_PAGE) return toEntry(own)
  const rootKey = `${locale}:${PREMERGED_ROOT_PAGE}`
  await cached(rootKey, async () => toEntry(toTranslations(await readPayload(toPremergedStorageKey(PREMERGED_ROOT_PAGE, locale)))))
  return rootKey
}
