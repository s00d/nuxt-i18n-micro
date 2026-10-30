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

import type { ModuleOptionsExtend } from '@i18n-micro/types'
import { isEnabledLocale } from '@i18n-micro/utils/active-locales'
import { normalizeConfiguredLocales, PREMERGED_ROOT_PAGE, toPremergedStorageKey } from '@i18n-micro/utils/merge-source'
import { fetchTranslationPayloadFromHost, type TranslationPayloadFetcher } from '@i18n-micro/utils/payload-fetch'
import { resolveTranslationPayloadPage } from '@i18n-micro/utils/payload-url'
import { loadSourceTranslationsFromStorage } from '@i18n-micro/utils/source-loader'
import { toTranslations } from '@i18n-micro/utils/normalize'
import { readPayload } from '#i18n-internal/payload-source'
import { getI18nPrivateConfig } from '#i18n-internal/config'
import { loadLiveDevTranslations } from './dev-live-translations'
import { getI18nServerConfig } from './locale-detector'
import { getOrCreateServerTranslationCache, type ServerTranslationCacheEntry } from './server-translation-cache'
import { toEntry } from '../../utils/translation-entry'

const EMPTY: ServerTranslationCacheEntry = { data: {}, json: '{}' }
const pending = new Map<string, Promise<ServerTranslationCacheEntry>>()

export async function loadTranslationsFromServer(locale: string, routeName: string): Promise<ServerTranslationCacheEntry> {
  const config = getI18nServerConfig()
  if (!isEnabledLocale(config.locales, locale)) return EMPTY
  const page = resolveTranslationPayloadPage(routeName, config.routesLocaleLinks || {})
  // dev reads live files, unless the payloads come from an external host
  if (import.meta.dev && !getI18nPrivateConfig().apiBaseServerHost) return toEntry(await loadLiveDevTranslations(locale, page, config))
  return cached(`${locale}:${page}`, () => load(locale, page, config))
}

/** A loaded chunk, or one shared with another key (then not stored under this one). */
interface Loaded {
  entry: ServerTranslationCacheEntry
  shared?: true
}

/** One cache entry per key, one in-flight load per key. */
function cached(key: string, read: () => Promise<Loaded>): Promise<ServerTranslationCacheEntry> {
  const cache = getOrCreateServerTranslationCache()
  const hit = cache.get(key)
  if (hit) return Promise.resolve(hit)
  const inFlight = pending.get(key)
  if (inFlight) return inFlight
  const promise = read()
    .then(({ entry, shared }) => {
      if (!shared) cache.set(key, entry)
      return entry
    })
    .finally(() => pending.delete(key))
  pending.set(key, promise)
  return promise
}

async function load(locale: string, page: string, config: ModuleOptionsExtend): Promise<Loaded> {
  const { apiBaseServerHost } = getI18nPrivateConfig()
  if (apiBaseServerHost) {
    const data = await fetchTranslationPayloadFromHost(
      { apiBaseUrl: config.apiBaseUrl, apiBaseServerHost, dateBuild: config.dateBuild },
      locale,
      page,
      $fetch as TranslationPayloadFetcher,
    )
    return { entry: toEntry(data) }
  }
  if (config.translationPayloadMode === 'source') {
    const data = await loadSourceTranslationsFromStorage(
      { getItem: (key: string) => readPayload(key) },
      {
        locale,
        pageName: page,
        // a fallback may live on another domain: its file is still this build's
        locales: normalizeConfiguredLocales(config.linkLocales ?? config.locales),
        globalFallbackLocale: config.fallbackLocale,
        disablePageLocales: config.disablePageLocales,
      },
    )
    return { entry: toEntry(data) }
  }
  // a page payload always carries the root keys: an empty one means the page has no folder,
  // and it shares the root entry (made-up page names cannot add entries)
  const own = toTranslations(await readPayload(toPremergedStorageKey(page, locale)))
  if (Object.keys(own).length || page === PREMERGED_ROOT_PAGE) return { entry: toEntry(own) }
  const root = await cached(`${locale}:${PREMERGED_ROOT_PAGE}`, async () => ({
    entry: toEntry(toTranslations(await readPayload(toPremergedStorageKey(PREMERGED_ROOT_PAGE, locale)))),
  }))
  return { entry: root, shared: true }
}
