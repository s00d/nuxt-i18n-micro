/**
 * Server-side translation loader.
 * - Node: JSON from public locales dir (`#i18n-internal/payload-source` → fs)
 * - Edge: Nitro `serverAssets` (`assets:i18n`)
 * - Dev: live locale files on every read (no cache to go stale on edits)
 * - `cacheStorage`: a storage mount shared by instances, between the LRU and the above
 * `premerged` reads one file; `source` merges root+page+fallback at runtime.
 *
 * Bounded: entries live in one LRU cache, concurrent loads of a chunk share one read, and in
 * premerged mode every page without its own payload shares the root entry — so request URLs
 * with made-up page names cannot grow memory. (With `cacheStorage` such a name keeps one LRU slot.)
 *
 * A failed read rejects: no level may keep it, the next request reads again. Only "there is no such
 * dictionary" is an answer, and it is `{}`.
 */

import type { ModuleOptionsExtend } from '@i18n-micro/types'
import { isEnabledLocale } from '@i18n-micro/utils/active-locales'
import { normalizeConfiguredLocales, PREMERGED_ROOT_PAGE, toPremergedStorageKey } from '@i18n-micro/utils/merge-source'
import { fetchTranslationPayloadFromHost, type TranslationPayloadFetcher } from '@i18n-micro/utils/payload-fetch'
import { resolveTranslationPayloadPage } from '@i18n-micro/utils/payload-url'
import { loadSourceTranslationsFromStorage } from '@i18n-micro/utils/source-loader'
import { toTranslations } from '@i18n-micro/utils/normalize'
import { embeddedPayloads, readPayload } from '#i18n-internal/payload-source'
import { getI18nPrivateConfig } from '#i18n-internal/config'
import { loadLiveDevTranslations } from './dev-live-translations'
import { getI18nServerConfig } from './locale-detector'
import { getOrCreateServerTranslationCache, type ServerTranslationCacheEntry } from './server-translation-cache'
import { readSharedChunk, sharedChunkKey, writeSharedChunk } from './shared-cache'
import { toEntry } from '../../utils/translation-entry'

const EMPTY: ServerTranslationCacheEntry = { data: {}, json: '{}' }
const pending = new Map<string, Promise<ServerTranslationCacheEntry>>()

/**
 * workerd ties I/O to the request that started it: if that request is cancelled, its promise never
 * settles, and every later request for the chunk would wait on it. Embedded reads have no I/O.
 * ponytail: each request of a cold burst on Workers then fetches for itself, which KV's reads make up for.
 */
const requestBoundIo = typeof navigator !== 'undefined' && navigator.userAgent === 'Cloudflare-Workers'

function runtimeHost(): string | undefined {
  try {
    return process.env.NUXT_I18N_APP_BASE_SERVER_HOST
  } catch {
    return undefined
  }
}

/** The host dictionaries come from: read per load, as `$fetch` in the page render does, so one artifact can run against several. */
export function resolveServerHost(): string | undefined {
  return runtimeHost() ?? getI18nPrivateConfig().apiBaseServerHost
}

export async function loadTranslationsFromServer(locale: string, routeName: string): Promise<ServerTranslationCacheEntry> {
  const config = getI18nServerConfig()
  if (!isEnabledLocale(config.locales, locale)) return EMPTY
  const page = resolveTranslationPayloadPage(routeName, config.routesLocaleLinks || {})
  // dev reads live files, unless the payloads come from an external host
  if (import.meta.dev && !resolveServerHost()) return toEntry(await loadLiveDevTranslations(locale, page, config))
  return cached(`${locale}:${page}`, () => readChunk(locale, page, config))
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
  const inFlight = requestBoundIo && !isEmbeddedRead() ? undefined : pending.get(key)
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

const isEmbeddedRead = () => embeddedPayloads && !resolveServerHost()

const rootChunk = (locale: string, config: ModuleOptionsExtend) =>
  cached(`${locale}:${PREMERGED_ROOT_PAGE}`, () => readChunk(locale, PREMERGED_ROOT_PAGE, config))

/** What the local level misses comes here: the source, behind the shared layer when one is on. */
function readChunk(locale: string, page: string, config: ModuleOptionsExtend): Promise<Loaded> {
  // embedded dictionaries are in the isolate already: a copy in the storage would be a network read for what memory holds
  const key = isEmbeddedRead() ? null : sharedChunkKey(locale, page, config, resolveServerHost())
  return key ? readThroughShared(key, locale, page, config) : load(locale, page, config)
}

async function readThroughShared(key: string, locale: string, page: string, config: ModuleOptionsExtend): Promise<Loaded> {
  const hit = await readSharedChunk(key)
  if (hit) return { entry: hit }
  const { entry, shared } = await load(locale, page, config)
  // kept locally even when it is the root entry: a page with no folder must not pay a storage round trip per request
  if (shared) return { entry }
  const json = JSON.stringify(entry.data)
  if (json === '{}') return { entry }
  if (page === PREMERGED_ROOT_PAGE) {
    await writeSharedChunk(key, json, config)
    return { entry }
  }
  // the root tells a page from a made-up name and from an error body: without one the chunk stays here
  const root = await rootChunk(locale, config).catch(() => null)
  if (!root || !Object.keys(root.data).length) return { entry }
  // no page of its own, whatever the name: `source` and a remote host answer made-up pages with
  // the root, and those names must not become keys
  if (JSON.stringify(root.data) === json) return { entry: root }
  // a 200 with a well-formed error: every chunk holds the root keys. One bad answer must not reach every instance
  if (Object.keys(root.data).every((rootKey) => Object.hasOwn(entry.data, rootKey))) await writeSharedChunk(key, json, config)
  return { entry }
}

async function load(locale: string, page: string, config: ModuleOptionsExtend): Promise<Loaded> {
  const apiBaseServerHost = resolveServerHost()
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
  return { entry: await rootChunk(locale, config), shared: true }
}
