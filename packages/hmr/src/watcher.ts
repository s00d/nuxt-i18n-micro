import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import type { Locale } from '@i18n-micro/types'
import { deepMergeTranslationsRecursive } from '@i18n-micro/utils/deep-merge'
import { mergeSourceTranslations, normalizeConfiguredLocales } from '@i18n-micro/utils/merge-source'
import { parseTranslationRelativePath } from '@i18n-micro/utils/parse-path'

/** A cache the watcher drops on change (the server cache, the SSR storage cache). */
interface TranslationWatchCache {
  clear(): void
}

export interface DevTranslationMergeInput {
  locale: string
  pageName: string
  locales?: Array<string | Locale>
  fallbackLocale?: string
  disablePageLocales?: boolean
  readLocaleFile: (relativePath: string) => Record<string, unknown> | Promise<Record<string, unknown>>
}

export interface HandleTranslationWatchChangeInput {
  relativePath: string
  configuredLocales: Set<string>
  serverCache: TranslationWatchCache
  storageCache?: TranslationWatchCache | null
}

/**
 * A locale file as an object: `{}` when missing; broken JSON warns with the path and is `{}`,
 * like `readTranslationJsonFile` in the build (not imported: that module pulls in globby).
 */
export function readTranslationFile(filePath: string): Record<string, unknown> {
  if (!existsSync(filePath)) return {}
  try {
    return JSON.parse(readFileSync(filePath, 'utf-8')) as Record<string, unknown>
  } catch (error) {
    if (!WARNED.has(filePath)) console.warn(`[nuxt-i18n-micro] Skipping invalid JSON in ${filePath}: ${(error as Error).message}`)
    WARNED.add(filePath)
    return {}
  }
}

/** Broken files already reported: once per path, not once per read. */
const WARNED = new Set<string>()

/**
 * Absolute translation + additional roots for live/HMR reads.
 * `rootDirs` order matches build: extends first, project last (last wins).
 */
export function resolveLiveTranslationDirs(input: { rootDirs: string[]; translationDir: string; additionalTranslationDirs?: string[] }): {
  translationRoots: string[]
  additionalRoots: string[]
} {
  const roots = input.rootDirs.length > 0 ? input.rootDirs : ['.']
  const translationRoots = roots.map((root) => resolve(root, input.translationDir))
  // Same nest order as `mergeAdditionalRootLocaleFiles`: dir outer, layer root inner.
  const additionalRoots: string[] = []
  for (const dir of input.additionalTranslationDirs ?? []) {
    for (const root of roots) {
      additionalRoots.push(resolve(root, dir))
    }
  }
  return { translationRoots, additionalRoots }
}

/**
 * Reader for live translation dirs (Nuxt layers + optional additional roots).
 * Matches build merge: additional first (all layers), then `translationDir` layers (last wins).
 */
export function createTranslationDirReader(
  translationsRoot: string | string[],
  additionalRoots: string[] = [],
): (relativeFilePath: string) => Record<string, unknown> {
  const translationRoots = Array.isArray(translationsRoot) ? translationsRoot : [translationsRoot]
  return (relativeFilePath: string): Record<string, unknown> => {
    let content: Record<string, unknown> = {}
    if (!relativeFilePath.includes('/') && relativeFilePath.endsWith('.json')) {
      const locale = relativeFilePath.slice(0, -'.json'.length)
      for (const extraRoot of additionalRoots) {
        content = deepMergeTranslationsRecursive(content, readTranslationFile(join(extraRoot, `${locale}.json`)))
      }
    }
    for (const root of translationRoots) {
      content = deepMergeTranslationsRecursive(content, readTranslationFile(join(root, relativeFilePath)))
    }
    return content
  }
}

/**
 * Merge live locale files for HMR + `import.meta.dev` cache misses.
 * Always source-style fallback (buildDir snapshots bake fallback; live files do not).
 */
export async function mergeDevTranslations(input: DevTranslationMergeInput): Promise<Record<string, unknown>> {
  const locales = normalizeConfiguredLocales(input.locales)
  const effectiveLocales = locales.length > 0 ? locales : [{ code: input.locale }]
  return mergeSourceTranslations({
    locale: input.locale,
    pageName: input.pageName,
    locales: effectiveLocales,
    globalFallbackLocale: input.fallbackLocale,
    disablePageLocales: input.disablePageLocales,
    readLocaleFile: input.readLocaleFile,
  })
}

/**
 * A translation file changed: drop every cached dictionary. A root file feeds every page, and
 * through fallback chains other locales too, so any narrower invalidation leaves stale chunks
 * (pages it did not list, `disablePageLocales` keys, fallback locales). Dev reads are live
 * merges, so the next request rebuilds only what is asked for.
 */
export async function handleTranslationWatchChange(input: HandleTranslationWatchChangeInput): Promise<'page' | 'root' | 'ignored'> {
  const parsed = parseTranslationRelativePath(input.relativePath)
  if (parsed.type === 'ignore' || (parsed.type === 'root' && !input.configuredLocales.has(parsed.locale))) return 'ignored'
  input.serverCache.clear()
  input.storageCache?.clear()
  return parsed.type
}

/**
 * Tracks translation file contents so a write that changes nothing is not acted on.
 *
 * Editors save on focus loss and formatters rewrite files byte-for-byte; a root locale
 * change re-merges every page for that locale, which is far too much to spend on a
 * file identical to the one already merged.
 */
export class TranslationContentTracker {
  private readonly hashes = new Map<string, string>()

  /** `true` when the file should be processed: new content, or unreadable so assume changed. */
  shouldProcess(filePath: string): boolean {
    let hash: string
    try {
      hash = createHash('sha256').update(readFileSync(filePath)).digest('hex')
    } catch {
      return true
    }

    if (this.hashes.get(filePath) === hash) return false
    this.hashes.set(filePath, hash)
    return true
  }

  forget(filePath: string): void {
    this.hashes.delete(filePath)
  }
}
