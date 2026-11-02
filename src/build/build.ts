import { createHash } from 'node:crypto'
import fs, { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { globby } from 'globby'
import { deepMergeTranslationsRecursive } from '@i18n-micro/utils/deep-merge'
import { mergeOverRoot, mergeSourceTranslations, PREMERGED_ROOT_MARK, PREMERGED_ROOT_PAGE } from '@i18n-micro/utils/merge-source'
import { readTranslationFile } from '../runtime/server/internal/translation-watcher'

export interface PreMergeLocaleInfo {
  code: string
  fallbackLocale?: string
}

/**
 * Deep-merge top-level `{locale}.json` from `additionalDirNames` (array order × layer order),
 * then overlay `primaryContent` from `translationDir` (primary wins on conflicts).
 */
export function mergeAdditionalRootLocaleFiles(
  rootDirs: string[],
  additionalDirNames: string[],
  locale: string,
  primaryContent: Record<string, unknown> = {},
): Record<string, unknown> {
  if (!additionalDirNames.length) return primaryContent

  let content: Record<string, unknown> = {}
  for (const dirName of additionalDirNames) {
    for (const rootDir of rootDirs) {
      content = deepMergeTranslationsRecursive(content, readTranslationFile(join(rootDir, dirName, `${locale}.json`)))
    }
  }

  return deepMergeTranslationsRecursive(content, primaryContent)
}

/** Discover locale codes that only exist under additional root dirs (`{locale}.json`). */
export function listAdditionalRootLocales(rootDirs: string[], additionalDirNames: string[]): string[] {
  const locales = new Set<string>()
  for (const dirName of additionalDirNames) {
    for (const rootDir of rootDirs) {
      const dir = join(rootDir, dirName)
      if (!existsSync(dir)) continue
      for (const name of readdirSync(dir)) {
        if (!name.endsWith('.json')) continue
        // Only top-level files (readdir is non-recursive here)
        locales.add(name.slice(0, -'.json'.length))
      }
    }
  }
  return [...locales]
}

type Tree = Record<string, unknown>

const isTree = (value: unknown): value is Tree => value !== null && typeof value === 'object' && !Array.isArray(value)

/** The paths of `page` that `root` does not hold as they are. Arrays and scalars are whole values, as in a merge. */
function diffTree(page: Tree, root: Tree): Tree {
  const delta: Tree = {}
  for (const key of Object.keys(page)) {
    const value = page[key]
    const base = root[key]
    if (isTree(value) && isTree(base)) {
      const nested = diffTree(value, base)
      if (Object.keys(nested).length) delta[key] = nested
    } else if (!Object.hasOwn(root, key) || JSON.stringify(value) !== JSON.stringify(base)) delta[key] = value
  }
  return delta
}

/**
 * The file of a page: its delta, or the whole chunk when no merge gives that page back. A fallback chain can do both:
 * a page file that replaced an object drops root keys under it, and a delta has no way to delete; a nested key can end
 * up in another order, which a `v-for` over the object would show. Top-level order is no one's to read but a dump.
 */
export function pageFileOverRoot(page: Tree, root: Tree, mark: string): Tree {
  const delta = diffTree(page, root)
  const merged = mergeOverRoot(root, delta)
  const whole = Object.keys(merged).length !== Object.keys(page).length
  if (whole || Object.keys(page).some((key) => JSON.stringify(merged[key]) !== JSON.stringify(page[key]))) return page
  return { ...delta, [PREMERGED_ROOT_MARK]: mark }
}

/**
 * Empties `outputDir` and returns every translation file by relative path, its layers merged
 * (later layers win) and additional root dirs under the root files.
 */
async function mergedFiles(rootDirs: string[], translationDirName: string, outputDir: string, additionalTranslationDirs: string[] = []) {
  if (existsSync(outputDir)) fs.rmSync(outputDir, { recursive: true, force: true })
  mkdirSync(outputDir, { recursive: true })

  const layerPaths = rootDirs.map((dir) => join(dir, translationDirName))
  const filesByLayer = await Promise.all(layerPaths.filter((lp) => existsSync(lp)).map((lp) => globby('**/*.json', { cwd: lp })))

  const merged = new Map<string, Tree>()
  for (const file of new Set(filesByLayer.flat())) {
    let content: Tree = {}
    for (const lp of layerPaths) content = deepMergeTranslationsRecursive(content, readTranslationFile(join(lp, file)))
    merged.set(file, content)
  }
  // a root locale file that exists only under additional dirs still needs an entry
  for (const locale of listAdditionalRootLocales(rootDirs, additionalTranslationDirs))
    if (!merged.has(`${locale}.json`)) merged.set(`${locale}.json`, {})
  for (const file of [...merged.keys()].filter((f) => dirname(f) === '.'))
    merged.set(file, mergeAdditionalRootLocaleFiles(rootDirs, additionalTranslationDirs, file.slice(0, -'.json'.length), merged.get(file)))
  return merged
}

export interface PreMergeOptions {
  rootDirs: string[]
  translationDirName: string
  outputDir: string
  locales: PreMergeLocaleInfo[]
  globalFallbackLocale?: string
  disablePageLocales?: boolean
  additionalTranslationDirs?: string[]
  routeNames?: string[]
  rootDelta?: boolean
}

/**
 * Pre-merge all translation files at build time.
 *
 * Output: `{page}/{locale}/data.json` (same relative path the client fetches under `apiBaseUrl`).
 * With `rootDelta`, `__root/{locale}/data.json` holds the locale's root and every page file only what differs from it.
 */
export async function preMergeLocales(options: PreMergeOptions): Promise<void> {
  const { rootDirs, translationDirName, outputDir, locales, globalFallbackLocale, disablePageLocales, additionalTranslationDirs } = options
  const { routeNames = [], rootDelta = false } = options
  const merged = await mergedFiles(rootDirs, translationDirName, outputDir, additionalTranslationDirs)

  // the same read source mode and dev do (fallback chain, root under page): one model, three modes
  // a route with no folder has a file too: a static host has no server route to answer it with the root dictionary
  const pages = new Set([...[...merged.keys()].filter((f) => f.startsWith('pages/')).map((f) => dirname(f).slice('pages/'.length)), ...routeNames])
  const targets = disablePageLocales || pages.size === 0 ? ['index'] : [...pages, ...(pages.has('index') ? [] : ['index'])]
  const chunk = (page: string, locale: string) =>
    mergeSourceTranslations({
      locale,
      pageName: page,
      locales,
      globalFallbackLocale,
      disablePageLocales,
      readLocaleFile: (relativePath) => merged.get(relativePath) ?? {},
    })
  const write = (page: string, locale: string, data: Tree) => {
    const targetPath = join(outputDir, page, locale, 'data.json')
    mkdirSync(dirname(targetPath), { recursive: true })
    writeFileSync(targetPath, JSON.stringify(data))
  }
  const split = rootDelta && !disablePageLocales
  await Promise.all(
    locales.map(async ({ code: locale }) => {
      const root = await chunk(PREMERGED_ROOT_PAGE, locale)
      const mark = createHash('sha256').update(JSON.stringify(root)).digest('hex').slice(0, 8)
      // the mark last: it is deleted on load, and that keeps a parsed object's fast shape
      write(PREMERGED_ROOT_PAGE, locale, split ? { ...root, [PREMERGED_ROOT_MARK]: mark } : root)
      await Promise.all(
        targets.map(async (page) => {
          const data = await chunk(page, locale)
          write(page, locale, split ? pageFileOverRoot(data, root, mark) : data)
        }),
      )
    }),
  )
}

/**
 * Merge translation layers at build time but keep the source directory shape.
 */
export async function buildTranslationSourceLayers(
  rootDirs: string[],
  translationDirName: string,
  outputDir: string,
  additionalTranslationDirs?: string[],
): Promise<void> {
  for (const [file, content] of await mergedFiles(rootDirs, translationDirName, outputDir, additionalTranslationDirs)) {
    const targetPath = join(outputDir, file)
    mkdirSync(dirname(targetPath), { recursive: true })
    writeFileSync(targetPath, JSON.stringify(content))
  }
}
