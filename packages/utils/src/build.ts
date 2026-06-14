import fs, { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { globby } from 'globby'
import { deepMergeTranslations, deepMergeTranslationsRecursive } from './deep-merge'

export interface PreMergeLocaleInfo {
  code: string
  fallbackLocale?: string
}

/**
 * Pre-merge all translation files at build time.
 *
 * Output: flat directory with structure pages/{routeName}/{locale}.json
 */
export async function preMergeLocales(
  rootDirs: string[],
  translationDirName: string,
  outputDir: string,
  locales: PreMergeLocaleInfo[],
  globalFallbackLocale?: string,
  disablePageLocales?: boolean,
): Promise<void> {
  if (existsSync(outputDir)) fs.rmSync(outputDir, { recursive: true, force: true })
  mkdirSync(outputDir, { recursive: true })

  const layerPaths = rootDirs.map((dir) => join(dir, translationDirName))

  const allFiles = new Set<string>()
  for (const lp of layerPaths) {
    if (!existsSync(lp)) continue
    const files = await globby('**/*.json', { cwd: lp })
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
    for (const [locale, data] of localeMap) {
      const targetPath = join(outputDir, context, `${locale}.json`)
      mkdirSync(dirname(targetPath), { recursive: true })
      writeFileSync(targetPath, JSON.stringify(data))
    }
  }
}

/**
 * Merge translation layers at build time but keep the source directory shape.
 */
export async function buildTranslationSourceLayers(rootDirs: string[], translationDirName: string, outputDir: string): Promise<void> {
  if (existsSync(outputDir)) fs.rmSync(outputDir, { recursive: true, force: true })
  mkdirSync(outputDir, { recursive: true })

  const layerPaths = rootDirs.map((dir) => join(dir, translationDirName))
  const allFiles = new Set<string>()

  for (const layerPath of layerPaths) {
    if (!existsSync(layerPath)) continue
    const files = await globby('**/*.json', { cwd: layerPath })
    files.forEach((file) => allFiles.add(file))
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

    const targetPath = join(outputDir, file)
    mkdirSync(dirname(targetPath), { recursive: true })
    writeFileSync(targetPath, JSON.stringify(content))
  }
}
