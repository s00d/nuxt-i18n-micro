/**
 * Optional level between the process LRU and the dictionary source: a Nitro storage mount several
 * instances share (`cacheStorage`), so one of them reads the source and the others read its copy.
 *
 * Only ever an optimisation: every failure is a miss, and the source answers. The process LRU stays
 * in front because `$t` is synchronous and needs the tree in memory. No lock: two instances that
 * miss at once both read the source and write the same value.
 */
import type { ModuleOptionsExtend, Translations } from '@i18n-micro/types'
import { toTranslations } from '@i18n-micro/utils/normalize'
import { useStorage } from 'nitropack/runtime'
import { getI18nPrivateConfig } from '#i18n-internal/config'
import { toEntry } from '../../utils/translation-entry'
import type { ServerTranslationCacheEntry } from './server-translation-cache'

/** A drowned Redis answers late, and ioredis queues commands while offline: the page must not wait for it. */
const TIMEOUT_MS = 250
/** After a failure the layer is skipped for this long: cold pages must not each wait out a dead connection. */
const COOLDOWN_MS = 5_000
const WARN_EVERY_MS = 60_000
/** Used when `cacheTtl` is 0: keys carry the build, so without an expiry every old build would stay in Redis for good. */
const DEFAULT_TTL_SECONDS = 86_400
/** Keys come from request URLs: a filesystem mount refuses long names, and Cloudflare KV stops at 512 bytes. */
const MAX_KEY_LENGTH = 400

type SharedStorage = ReturnType<typeof useStorage>

let shared: SharedStorage | null | undefined
let closedUntil = 0
let warnedAt = Number.NEGATIVE_INFINITY

/** Off in dev (live files) and in prerender (a build must not need the production Redis). Resolved on first use: a Nitro plugin may mount it. */
function sharedStorage(): SharedStorage | null {
  if (shared !== undefined) return shared
  const name = getI18nPrivateConfig().cacheStorage
  if (import.meta.dev || import.meta.prerender || !name) return (shared = null)
  // Nitro does not refuse an unknown name: the keys would land in its in-process root mount
  if (useStorage().getMount(name).base) return (shared = useStorage(name))
  console.warn(`[nuxt-i18n-micro] cacheStorage: no Nitro storage is mounted as "${name}" (nitro.storage). Working without the shared cache.`)
  return (shared = null)
}

function fail(error: unknown): null {
  const now = Date.now()
  closedUntil = now + COOLDOWN_MS
  if (now - warnedAt < WARN_EVERY_MS) return null
  warnedAt = now
  console.warn(`[nuxt-i18n-micro] cacheStorage failed, reading dictionaries from their source: ${(error as Error)?.message ?? error}`)
  return null
}

/** `call`'s result, or null when the storage threw, hangs, or failed a moment ago. */
async function guarded<T>(call: () => Promise<T>): Promise<T | null> {
  if (Date.now() < closedUntil) return null
  let timer: ReturnType<typeof setTimeout> | undefined
  const deadline = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`no answer in ${TIMEOUT_MS} ms`)), TIMEOUT_MS)
  })
  try {
    return await Promise.race([call(), deadline])
  } catch (error) {
    return fail(error)
  } finally {
    clearTimeout(timer)
  }
}

/** A key segment: unstorage reads `:` `/` `?` as structure and the fs driver refuses `..`. */
const segment = (value: string | number) => String(value).replace(/[^\w-]/g, (char) => `%${char.charCodeAt(0).toString(16).padStart(4, '0')}`)

/**
 * The chunk's key, or null when it must not touch the layer. `cacheStorageBuild` keeps two builds
 * apart in a rolling deploy. `dateBuild` alone would not: it hashes only the translation files, and
 * `0`/`''` turns it off. A runtime `fallbackLocale` changes what `source` and remote chunks hold.
 */
export function sharedChunkKey(locale: string, page: string, config: ModuleOptionsExtend): string | null {
  if (!sharedStorage()) return null
  const build = `${segment(getI18nPrivateConfig().cacheStorageBuild ?? '')}-${segment(config.dateBuild)}-${segment(config.fallbackLocale ?? '')}`
  const key = `i18n-micro:${build}:${segment(locale)}:${segment(page)}`
  return key.length > MAX_KEY_LENGTH ? null : key
}

/** getItem runs destr, so the stored string comes back parsed once; a corrupt one stays a string. */
export async function readSharedChunk(key: string): Promise<ServerTranslationCacheEntry | null> {
  const data: Translations = toTranslations(await guarded(() => sharedStorage()!.getItem(key)))
  return Object.keys(data).length ? toEntry(data) : null
}

/** A string reaches the driver as is: no second serialization. Awaited: an edge runtime drops what outlives the response. */
export async function writeSharedChunk(key: string, json: string, config: ModuleOptionsExtend): Promise<void> {
  await guarded(() => sharedStorage()!.setItem(key, json, { ttl: config.cacheTtl || DEFAULT_TTL_SECONDS }))
}
