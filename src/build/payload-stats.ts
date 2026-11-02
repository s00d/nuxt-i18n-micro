import { createHash } from 'node:crypto'
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { brotliCompressSync, constants as zlibConstants, gzipSync } from 'node:zlib'
import { join, relative } from 'node:path'
import type { TranslationPayloadMode, TranslationPayloadStats } from './payload-config'

/**
 * Every `.json` under `dir`, recursively.
 *
 * The two callers below walk different trees at different times — the generated
 * payload directory for the size warning, the per-layer sources for the fingerprint —
 * so they share the traversal, not the scan.
 */
function collectJsonFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = join(dir, entry.name)
    if (entry.isDirectory()) return collectJsonFiles(fullPath)
    return entry.name.endsWith('.json') ? [fullPath] : []
  })
}

export function scanTranslationPayloadDirectory(dir: string): TranslationPayloadStats {
  const stats: TranslationPayloadStats = { fileCount: 0, totalBytes: 0 }
  if (!existsSync(dir)) return stats

  const files: string[] = []
  collectJsonFiles(dir, files)
  for (const file of files) {
    stats.fileCount += 1
    stats.totalBytes += statSync(file).size
  }
  return stats
}

const MiB = 1024 * 1024

/** Bundle limits of Edge platforms, lowest plan first. Function platforms allow hundreds of MB: no entry. */
const EMBED_LIMITS: { preset: (name: string) => boolean; bytes: number; compressed: boolean; text: string }[] = [
  {
    preset: (name) => name === 'vercel-edge',
    bytes: 1_000_000,
    compressed: true,
    text: 'Vercel Edge allows 1 MB gzip on Hobby, 2 MB on Pro and 4 MB on Enterprise',
  },
  { preset: (name) => name === 'netlify-edge', bytes: 20_000_000, compressed: true, text: 'Netlify Edge allows 20 MB compressed' },
  { preset: (name) => name.startsWith('cloudflare-'), bytes: 64 * MiB, compressed: false, text: 'Cloudflare Workers allow 64 MiB uncompressed' },
]

/**
 * The size of the dictionaries an Edge bundle embeds, against that platform's limit. Dictionaries
 * only: the app comes on top. ponytail: gzip per file, close to one archive of the bundle since
 * the window is 32 KB; a build of a bigger app can pass this check and still fail at deploy.
 */
export function getEmbeddedPayloadSizeWarning(preset: string, dir: string, mode: TranslationPayloadMode): string | null {
  const limit = EMBED_LIMITS.find((entry) => entry.preset(preset))
  if (!limit) return null
  const { totalBytes } = scanTranslationPayloadDirectory(dir)
  // gzip only shrinks: most builds never pay for it
  if (totalBytes <= limit.bytes) return null
  if (limit.compressed) {
    const files: string[] = []
    collectJsonFiles(dir, files)
    const gzipBytes = files.reduce((sum, file) => sum + gzipSync(readFileSync(file)).length, 0)
    if (gzipBytes <= limit.bytes) return null
    // decimal, as these limits are: 20.5 MB must not print as 19.5 next to a limit of 20
    return embeddedSizeMessage(preset, `${(gzipBytes / 1_000_000).toFixed(1)} MB gzip`, limit.text, mode)
  }
  return embeddedSizeMessage(preset, `${(totalBytes / MiB).toFixed(1)} MiB`, limit.text, mode)
}

function embeddedSizeMessage(preset: string, size: string, limitText: string, mode: TranslationPayloadMode): string {
  const advice = mode === 'premerged' ? "Use translationPayloads.mode: 'source'" : 'Load dictionaries from apiBaseServerHost'
  return `Preset "${preset}" embeds ${size} of dictionaries in the server bundle, and ${limitText}. ${advice}, or the deploy may be refused.`
}

/**
 * Fingerprint of the translation sources, used to cache-bust `_locales` requests.
 *
 * The alternative — a build timestamp — changes on every deploy, so browsers and CDNs
 * throw away a dictionary that may not have changed at all. Hashing the sources means
 * the URL only moves when the translations actually move.
 *
 * Layer order matters (later layers override earlier ones), so paths are hashed in the
 * order given and relative to their own root: an identical tree checked out elsewhere
 * must produce the same value.
 *
 * Returns `null` when there is nothing to hash, leaving the caller to fall back.
 */
export function hashTranslationSources(
  rootDirs: string[],
  translationDirName: string,
  additionalTranslationDirs: string[] = [],
  /** What else decides a chunk's content: the fallback chain. A pinned URL must move with it too. */
  salt = '',
): string | null {
  const hash = createHash('sha256').update(salt)
  let seen = 0

  const hashFiles = (baseDir: string, files: string[]) => {
    files.sort()
    for (const file of files) {
      hash.update(relative(baseDir, file))
      hash.update('\0')
      hash.update(readFileSync(file))
      seen += 1
    }
  }

  const hashDir = (dir: string) => {
    if (!existsSync(dir)) return
    const files: string[] = []
    collectJsonFiles(dir, files)
    hashFiles(dir, files)
  }

  /** Only top-level `{locale}.json` — `pages/` under additional dirs is ignored by merge. */
  const hashAdditionalRootLocales = (dir: string) => {
    if (!existsSync(dir)) return
    const files: string[] = []
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.isFile() && entry.name.endsWith('.json')) files.push(join(dir, entry.name))
    }
    hashFiles(dir, files)
  }

  for (const rootDir of rootDirs) {
    hashDir(join(rootDir, translationDirName))
    for (const extra of additionalTranslationDirs) {
      hashAdditionalRootLocales(join(rootDir, extra))
    }
  }

  return seen > 0 ? hash.digest('hex').slice(0, 16) : null
}

/** Nitro skips public assets below this size; mirrored so both passes agree. */
const NITRO_MIN_COMPRESS_BYTES = 1024

/** Nitro's `compressPublicAssets`: `true` means both encodings, an object selects them. */
export type PublicAssetCompression = boolean | { gzip?: boolean; brotli?: boolean } | undefined

/**
 * Gzip/brotli the translation payloads copied into the public directory.
 *
 * Nitro compresses public assets before the `nitro:build:public-assets` hook where the
 * payloads are copied, so `compressPublicAssets` never reaches them — a static host
 * would serve the single largest part of the output uncompressed. This applies the
 * user's setting to those files; it does not turn compression on by itself.
 *
 * Returns the number of files actually compressed.
 */
export function compressTranslationPayloads(dir: string, compression: PublicAssetCompression): number {
  if (!compression || !existsSync(dir)) return 0

  const gzip = compression === true || compression.gzip !== false
  const brotli = compression === true || compression.brotli !== false
  if (!gzip && !brotli) return 0

  const files: string[] = []
  collectJsonFiles(dir, files)

  let compressed = 0
  for (const file of files) {
    const raw = readFileSync(file)
    // Same floor Nitro applies to public assets: below it the compressed copy is
    // often bigger than the source, and diverging from `compressPublicAssets` would
    // make this pass behave differently from the setting it is following.
    if (raw.length < NITRO_MIN_COMPRESS_BYTES) continue

    if (gzip) writeFileSync(`${file}.gz`, gzipSync(raw, { level: 9 }))
    if (brotli) {
      writeFileSync(
        `${file}.br`,
        brotliCompressSync(raw, { params: { [zlibConstants.BROTLI_PARAM_QUALITY]: 11, [zlibConstants.BROTLI_PARAM_SIZE_HINT]: raw.length } }),
      )
    }
    compressed += 1
  }

  return compressed
}
