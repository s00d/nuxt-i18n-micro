import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, resolve, sep } from 'node:path'
import type { Translations } from '@i18n-micro/types'
import { storeLoadedTranslationFile, type TranslationFileBuckets } from '@i18n-micro/utils/parse-path'

/** Sync FS walk for the Vite plugin — prefer `@i18n-micro/node` in scripts. */
export interface LoadMessagesOptions {
  translationDir: string
  rootDir?: string
  disablePageLocales?: boolean
}

export type LoadedTranslations = TranslationFileBuckets<Translations>

export interface TranslationFileRef {
  relativePath: string
  absolutePath: string
}

function walkTranslationFiles(dir: string, onFile: (fullPath: string) => void): void {
  if (!existsSync(dir)) return

  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry)
    const stat = statSync(fullPath)
    if (stat.isDirectory()) {
      walkTranslationFiles(fullPath, onFile)
      continue
    }
    if (entry.endsWith('.json')) onFile(fullPath)
  }
}

export function listTranslationFiles(options: LoadMessagesOptions): TranslationFileRef[] {
  const rootDir = options.rootDir ?? process.cwd()
  const dir = resolve(rootDir, options.translationDir)
  const files: TranslationFileRef[] = []

  walkTranslationFiles(dir, (fullPath) => {
    files.push({
      absolutePath: fullPath,
      relativePath: relative(dir, fullPath).split(sep).join('/'),
    })
  })

  return files.sort((a, b) => a.relativePath.localeCompare(b.relativePath))
}

export function loadTranslationBuckets(options: LoadMessagesOptions): LoadedTranslations {
  const rootDir = options.rootDir ?? process.cwd()
  const dir = resolve(rootDir, options.translationDir)
  const buckets: LoadedTranslations = { root: {}, routes: {} }
  const disablePageLocales = options.disablePageLocales === true

  if (!existsSync(dir)) return buckets

  walkTranslationFiles(dir, (fullPath) => {
    const relativePath = relative(dir, fullPath).split(sep).join('/')
    try {
      const parsed: unknown = JSON.parse(readFileSync(fullPath, 'utf-8'))
      if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
        console.error(
          `[i18n-micro/vitepress] Skipping ${relativePath}: expected a JSON object, got ${Array.isArray(parsed) ? 'array' : typeof parsed}`,
        )
        return
      }
      storeLoadedTranslationFile(buckets, relativePath, parsed as Translations, disablePageLocales)
    } catch (error) {
      console.error(`[i18n-micro/vitepress] Failed to load ${relativePath}:`, error)
    }
  })

  return buckets
}
