import { createHash } from 'node:crypto'
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { brotliCompressSync, constants as zlibConstants, gzipSync } from 'node:zlib'
import { join, relative } from 'node:path'
import type { TranslationPayloadStats } from './payload-config'

/**
 * Every `.json` under `dir`, recursively.
 *
 * The two callers below walk different trees at different times — the generated
 * payload directory for the size warning, the per-layer sources for the fingerprint —
 * so they share the traversal, not the scan.
 */
function collectJsonFiles(dir: string, out: string[]): void {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name)
    if (entry.isDirectory()) collectJsonFiles(fullPath, out)
    else if (entry.name.endsWith('.json')) out.push(fullPath)
  }
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
export function hashTranslationSources(rootDirs: string[], translationDirName: string): string | null {
  const hash = createHash('sha256')
  let seen = 0

  for (const rootDir of rootDirs) {
    const dir = join(rootDir, translationDirName)
    if (!existsSync(dir)) continue

    const files: string[] = []
    collectJsonFiles(dir, files)
    files.sort()

    for (const file of files) {
      hash.update(relative(dir, file))
      hash.update('\0')
      hash.update(readFileSync(file))
      seen += 1
    }
  }

  return seen > 0 ? hash.digest('hex').slice(0, 16) : null
}

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
 * Returns the number of source files compressed.
 */
export function compressTranslationPayloads(dir: string, compression: PublicAssetCompression): number {
  if (!compression || !existsSync(dir)) return 0

  const gzip = compression === true || compression.gzip !== false
  const brotli = compression === true || compression.brotli !== false
  if (!gzip && !brotli) return 0

  const files: string[] = []
  collectJsonFiles(dir, files)

  for (const file of files) {
    const raw = readFileSync(file)
    if (gzip) writeFileSync(`${file}.gz`, gzipSync(raw, { level: 9 }))
    if (brotli) {
      writeFileSync(
        `${file}.br`,
        brotliCompressSync(raw, { params: { [zlibConstants.BROTLI_PARAM_QUALITY]: 11, [zlibConstants.BROTLI_PARAM_SIZE_HINT]: raw.length } }),
      )
    }
  }

  return files.length
}
