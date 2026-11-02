/**
 * Optional level between the process LRU and the dictionary source: a Nitro storage mount several
 * instances share (`cacheStorage`), so one of them reads the source and the others read its copy.
 *
 * Only ever an optimisation: every failure is a miss, and the source answers. The process LRU stays
 * in front because `$t` is synchronous and needs the tree in memory. No lock: two instances that
 * miss at once both read the source and write the same value.
 */
import type { ResolvedI18nConfig, Translations } from '@i18n-micro/types'
import { useStorage } from 'nitropack/runtime'
import { getI18nPrivateConfig } from '#i18n-internal/config'
import { toEntry } from '../../utils/translation-entry'
import type { ServerTranslationCacheEntry } from './server-translation-cache'

/**
 * One rule for every store: a store is trusted until it fails. A trusted read may take this long, which
 * covers a connection handshake (ioredis on the first read, TLS, AUTH) and a Cloudflare KV key that is
 * cold at this location. ponytail: a store that really takes this long costs a cold chunk that much; only
 * the LRU in front hides it. Slower stores count as failing.
 */
const TRUSTED_TIMEOUT_MS = 1_000
/** After a failure, until the next answer: a hung store must not hold every cold page for a second. */
const PROBATION_TIMEOUT_MS = 250
/** Failures in a row that close the layer: one late read on a healthy store is no reason to skip it. */
const FAILURES_TO_CLOSE = 3
/** While closed the layer is skipped: cold pages must not each wait out a dead connection. */
const COOLDOWN_MS = 5_000
const WARN_EVERY_MS = 60_000
/** Used when `cacheTtl` is 0: keys carry the build, so without an expiry every old build would stay in Redis for good. */
const DEFAULT_TTL_SECONDS = 86_400
/** Keys come from request URLs: a filesystem mount refuses long names, and Cloudflare KV stops at 512 bytes. */
const MAX_KEY_LENGTH = 400
/** One path segment of an `fs` mount, which stops at 255 bytes. */
const MAX_PAGE_LENGTH = 200

type SharedStorage = ReturnType<typeof useStorage>

let shared: SharedStorage | null | undefined
let failures = 0
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

function warn(error: unknown): void {
  const now = Date.now()
  if (now - warnedAt < WARN_EVERY_MS) return
  warnedAt = now
  console.warn(`[nuxt-i18n-micro] cacheStorage failed, reading dictionaries from their source: ${(error as Error)?.message ?? error}`)
}

async function withDeadline<T>(call: () => Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined
  const deadline = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`no answer in ${ms} ms`)), ms)
  })
  try {
    return await Promise.race([call(), deadline])
  } finally {
    clearTimeout(timer)
  }
}

/** A key segment: unstorage reads `:` `/` `?` as structure and the fs driver refuses `..`. `~` joins the parts of the build: never in a segment. */
const segment = (value: string | number) => String(value).replace(/[^\w-]/g, (char) => `%${char.charCodeAt(0).toString(16).padStart(4, '0')}`)

/**
 * The chunk's key, or null when it must not touch the layer. `cacheStorageBuild` keeps two builds
 * apart in a rolling deploy. `dateBuild` alone would not: it hashes only the translation files, and
 * `0`/`''` turns it off. A runtime `fallbackLocale` changes what `source` and remote chunks hold, and
 * a runtime host is another backend: one artifact can run against several.
 */
export function sharedChunkKey(locale: string, page: string, config: ResolvedI18nConfig, host = ''): string | null {
  if (!sharedStorage()) return null
  const pageSegment = segment(page)
  if (pageSegment.length > MAX_PAGE_LENGTH) return null
  const build = [getI18nPrivateConfig().cacheStorageBuild ?? '', config.dateBuild, config.fallbackLocale ?? '', host].map(segment).join('~')
  const key = `i18n-micro:${build}:${segment(locale)}:${pageSegment}`
  return key.length > MAX_KEY_LENGTH ? null : key
}

/**
 * Only what parses to a non-empty plain object is a chunk. That is a check on the value, not on the store:
 * unstorage's fs drivers *return* a read error (with the absolute path in it), and getItem runs destr,
 * so a corrupt string comes back as a string. Neither counts against the store: one URL must not close it.
 */
function toChunk(value: unknown): ServerTranslationCacheEntry | null {
  if (!value || Object.getPrototypeOf(value) !== Object.prototype || !Object.keys(value).length) return null
  return toEntry(value as Translations)
}

export async function readSharedChunk(key: string): Promise<ServerTranslationCacheEntry | null> {
  if (Date.now() < closedUntil) return null
  try {
    const value = await withDeadline(() => sharedStorage()!.getItem(key), failures ? PROBATION_TIMEOUT_MS : TRUSTED_TIMEOUT_MS)
    failures = 0
    return toChunk(value)
  } catch (error) {
    if (++failures >= FAILURES_TO_CLOSE) closedUntil = Date.now() + COOLDOWN_MS
    warn(error)
    return null
  }
}

/**
 * A string reaches the driver as is: no second serialization. Awaited: an edge runtime drops what outlives
 * the response. Only while the store is trusted: a write must not wait out a store whose reads just failed.
 * A failed write closes nothing: a read-only replica or a KV write limit still serves reads.
 */
export async function writeSharedChunk(key: string, json: string, config: ResolvedI18nConfig): Promise<void> {
  if (failures) return
  const { cacheTtl } = config
  const ttl = cacheTtl > 0 && Number.isFinite(cacheTtl) ? Math.ceil(cacheTtl) : DEFAULT_TTL_SECONDS
  await withDeadline(() => sharedStorage()!.setItem(key, json, { ttl }), TRUSTED_TIMEOUT_MS).catch(warn)
}
