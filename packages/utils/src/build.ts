import fs, { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { globby } from 'globby'
import { deepMergeTranslations, deepMergeTranslationsRecursive } from './deep-merge'

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
      const filePath = join(rootDir, dirName, `${locale}.json`)
      if (!existsSync(filePath)) continue
      try {
        content = deepMergeTranslationsRecursive(content, JSON.parse(readFileSync(filePath, 'utf-8')))
      } catch {
        /* skip broken JSON */
      }
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

function applyAdditionalRootsToMap(
  rootDirs: string[],
  additionalDirNames: string[] | undefined,
  rootMap: Map<string, Record<string, unknown>>,
): void {
  if (!additionalDirNames?.length) return

  const locales = new Set<string>([...rootMap.keys(), ...listAdditionalRootLocales(rootDirs, additionalDirNames)])
  for (const locale of locales) {
    rootMap.set(locale, mergeAdditionalRootLocaleFiles(rootDirs, additionalDirNames, locale, rootMap.get(locale) ?? {}))
  }
}

/**
 * Pre-merge all translation files at build time.
 *
 * Output: `{page}/{locale}/data.json` (same relative path the client fetches under `apiBaseUrl`).
 */
export async function preMergeLocales(
  rootDirs: string[],
  translationDirName: string,
  outputDir: string,
  locales: PreMergeLocaleInfo[],
  globalFallbackLocale?: string,
  disablePageLocales?: boolean,
  additionalTranslationDirs?: string[],
): Promise<void> {
  if (existsSync(outputDir)) fs.rmSync(outputDir, { recursive: true, force: true })
  mkdirSync(outputDir, { recursive: true })

  const layerPaths = rootDirs.map((dir) => join(dir, translationDirName))

  const allFiles = new Set<string>()
  const filesByLayer = await Promise.all(layerPaths.filter((lp) => existsSync(lp)).map((lp) => globby('**/*.json', { cwd: lp })))
  for (const files of filesByLayer) {
    files.forEach((f) => allFiles.add(f))
  }

  const merged = new Map<string, Record<string, unknown>>()
  for (const file of allFiles) {
    let content: Record<string, unknown> = {}
    for (const lp of layerPaths) {
      const fp = join(lp, file)
      if (existsSync(fp)) {
        try {
          content = deepMergeTranslationsRecursive(content, JSON.parse(readFileSync(fp, 'utf-8')))
        } catch {
          /* skip */
        }
      }
    }
    merged.set(file, content)
  }

  const rootMap = new Map<string, Record<string, unknown>>()
  const pageMap = new Map<string, Map<string, Record<string, unknown>>>()

  for (const [file, content] of merged) {
    const dir = dirname(file)
    const locale = file.slice(file.lastIndexOf('/') + 1).replace('.json', '')

    if (dir === '.') {
      rootMap.set(locale, content)
    } else {
      if (!pageMap.has(dir)) pageMap.set(dir, new Map())
      pageMap.get(dir)!.set(locale, content)
    }
  }

  applyAdditionalRootsToMap(rootDirs, additionalTranslationDirs, rootMap)

  const knownCodes = new Set(locales.map((l) => l.code))

  const applyFallback = (map: Map<string, Record<string, unknown>>) => {
    for (const locale of locales) {
      const chain = [globalFallbackLocale, locale.fallbackLocale, locale.code]
        .filter((l): l is string => !!l && knownCodes.has(l))
        .filter((v, i, arr) => arr.indexOf(v) === i)
      if (chain.length <= 1) continue

      let result: Record<string, unknown> = {}
      for (const code of chain) {
        const data = map.get(code)
        if (data) result = deepMergeTranslationsRecursive(result, data)
      }
      map.set(locale.code, result)
    }
  }

  applyFallback(rootMap)
  for (const localeMap of pageMap.values()) {
    applyFallback(localeMap)
  }

  if (disablePageLocales || pageMap.size === 0) {
    const indexMap = new Map<string, Record<string, unknown>>()
    for (const [locale, data] of rootMap) {
      indexMap.set(locale, { ...data })
    }
    pageMap.set('pages/index', indexMap)
  } else {
    for (const [, localeMap] of pageMap) {
      for (const [locale, rootData] of rootMap) {
        const pageData = localeMap.get(locale)
        localeMap.set(locale, pageData ? deepMergeTranslations(rootData, pageData) : { ...rootData })
      }
    }
  }

  for (const [context, localeMap] of pageMap) {
    // Source dirs are `pages/{page}`; emit client URL layout `{page}/{locale}/data.json`.
    const page = context.replace(/^pages\/?/, '') || 'index'
    for (const [locale, data] of localeMap) {
      if (!knownCodes.has(locale)) continue
      const targetPath = join(outputDir, page, locale, 'data.json')
      mkdirSync(dirname(targetPath), { recursive: true })
      writeFileSync(targetPath, JSON.stringify(data))
    }
  }
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
  if (existsSync(outputDir)) fs.rmSync(outputDir, { recursive: true, force: true })
  mkdirSync(outputDir, { recursive: true })

  const layerPaths = rootDirs.map((dir) => join(dir, translationDirName))
  const allFiles = new Set<string>()

  const filesByLayer = await Promise.all(
    layerPaths.filter((layerPath) => existsSync(layerPath)).map((layerPath) => globby('**/*.json', { cwd: layerPath })),
  )
  for (const files of filesByLayer) {
    files.forEach((file) => allFiles.add(file))
  }

  // Root locale files that exist only under additional dirs still need an output entry.
  for (const locale of listAdditionalRootLocales(rootDirs, additionalTranslationDirs ?? [])) {
    allFiles.add(`${locale}.json`)
  }

  for (const file of allFiles) {
    let content: Record<string, unknown> = {}
    for (const layerPath of layerPaths) {
      const filePath = join(layerPath, file)
      if (existsSync(filePath)) {
        try {
          content = deepMergeTranslationsRecursive(content, JSON.parse(readFileSync(filePath, 'utf-8')))
        } catch {
          /* skip */
        }
      }
    }

    if (dirname(file) === '.') {
      const locale = file.slice(0, -'.json'.length)
      content = mergeAdditionalRootLocaleFiles(rootDirs, additionalTranslationDirs ?? [], locale, content)
    }

    const targetPath = join(outputDir, file)
    mkdirSync(dirname(targetPath), { recursive: true })
    writeFileSync(targetPath, JSON.stringify(content))
  }
}
