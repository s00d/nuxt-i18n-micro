import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import type { Locale } from '@i18n-micro/types'
import { deepMergeTranslationsRecursive } from '@i18n-micro/utils/deep-merge'
import { mergeSourceTranslations, normalizeConfiguredLocales } from '@i18n-micro/utils/merge-source'
import { parseTranslationRelativePath } from '@i18n-micro/utils/parse-path'

interface TranslationWatchCache {
  set(key: string, value: TranslationWatchCacheEntry): void
  delete(key: string): boolean
}

interface TranslationWatchCacheEntry {
  data: Record<string, unknown>
  json: string
}

export interface DevTranslationMergeInput {
  locale: string
  pageName: string
  locales?: Array<string | Locale>
  fallbackLocale?: string
  disablePageLocales?: boolean
  readLocaleFile: (relativePath: string) => Record<string, unknown> | Promise<Record<string, unknown>>
}

interface ApplyTranslationWatchCacheUpdateInput {
  serverCache: TranslationWatchCache
  storageCache?: TranslationWatchCache | null
  routesLocaleLinks?: Record<string, string>
  locale: string
  pageName: string
  merged: Record<string, unknown>
}

export interface HandleTranslationWatchChangeInput {
  relativePath: string
  configuredLocales: Set<string>
  listPageNames: () => string[]
  serverCache: TranslationWatchCache
  storageCache?: TranslationWatchCache | null
  routesLocaleLinks?: Record<string, string>
  mergeInput: Omit<DevTranslationMergeInput, 'locale' | 'pageName'>
}

function buildTranslationWatchCacheEntry(data: Record<string, unknown>): TranslationWatchCacheEntry {
  const json = JSON.stringify(data).replace(/</g, '\\u003c')
  return { data, json }
}

/**
 * One translation file, or `{}` when it does not exist.
 *
 * Throws when the file exists but cannot be read or parsed, and that is the point: a
 * `change` event can arrive while the write is still in flight, and treating the
 * half-written file as an empty one merges a chunk that is missing every key the file
 * holds — then caches it as the truth. The cached chunk stays wrong until the file changes
 * again, so the page serves raw keys indefinitely. Failing here leaves the last good entry
 * in place instead.
 */
export function readTranslationFile(filePath: string): Record<string, unknown> {
  if (!existsSync(filePath)) return {}
  const contents = readFileSync(filePath, 'utf-8')
  return JSON.parse(contents) as Record<string, unknown>
}

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
  const additionalRoots: string[] = []
  for (const root of roots) {
    for (const dir of input.additionalTranslationDirs ?? []) {
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

function applyTranslationWatchCacheUpdate(input: ApplyTranslationWatchCacheUpdateInput): void {
  const entry = buildTranslationWatchCacheEntry(input.merged)
  const cacheKey = `${input.locale}:${input.pageName}`

  input.serverCache.set(cacheKey, entry)
  input.storageCache?.delete(cacheKey)

  const aliases = Object.keys(input.routesLocaleLinks ?? {}).filter((alias) => input.routesLocaleLinks?.[alias] === input.pageName)
  for (const alias of aliases) {
    const aliasKey = `${input.locale}:${alias}`
    input.serverCache.set(aliasKey, entry)
    input.storageCache?.delete(aliasKey)
  }
}

export async function handleTranslationWatchChange(input: HandleTranslationWatchChangeInput): Promise<'page' | 'root' | 'ignored'> {
  const parsed = parseTranslationRelativePath(input.relativePath)
  if (parsed.type === 'ignore') {
    return 'ignored'
  }

  const mergePage = async (locale: string, pageName: string) => {
    const merged = await mergeDevTranslations({
      ...input.mergeInput,
      locale,
      pageName,
    })
    applyTranslationWatchCacheUpdate({
      serverCache: input.serverCache,
      storageCache: input.storageCache,
      routesLocaleLinks: input.routesLocaleLinks,
      locale,
      pageName,
      merged,
    })
  }

  if (parsed.type === 'page') {
    await mergePage(parsed.locale, parsed.pageName)
    return 'page'
  }

  if (!input.configuredLocales.has(parsed.locale)) {
    return 'ignored'
  }

  // A root locale file feeds every page, so all of them have to be re-merged. The
  // merges are independent — each reads its own files and writes its own cache key
  // (`locale:pageName`, plus aliases that belong to that page alone) — so there is
  // nothing to serialize them for.
  const pageNames = [...input.listPageNames(), 'index']
  await Promise.all(pageNames.map((pageName) => mergePage(parsed.locale, pageName)))
  return 'root'
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
