import { readdir, readFile } from 'node:fs/promises'
import { join, relative, sep } from 'node:path'
import type { Translations } from '@i18n-micro/types'
import { storeLoadedTranslationFile, type TranslationFileBuckets } from '@i18n-micro/utils/parse-path'

export interface LoadedTranslations extends TranslationFileBuckets<Translations> {}

/**
 * Load translations from a directory
 * Supports both flat structure (locales/{lang}.json) and nested structure (locales/pages/{page}/{lang}.json)
 * @param dir - Directory path containing translation files
 * @param disablePageLocales - If true, ignores pages/ folder and treats all files as global translations
 * @returns Object with global and route-specific translations
 */
export async function loadTranslations(dir: string, disablePageLocales: boolean = false): Promise<LoadedTranslations> {
  const result: LoadedTranslations = {
    root: {},
    routes: {},
  }

  try {
    const files = await readdir(dir, { recursive: true, withFileTypes: true })
    const jsonFiles = files.filter((file) => file.isFile() && file.name.endsWith('.json'))

    const loaded = await Promise.all(
      jsonFiles.map(async (file) => {
        const fullPath = join(file.path, file.name)
        const relativePath = relative(dir, fullPath).split(sep).join('/')

        try {
          const content = await readFile(fullPath, 'utf-8')
          const translations = JSON.parse(content) as Translations
          return { relativePath, translations }
        } catch (error) {
          console.error(`Failed to load translation file ${fullPath}:`, error)
          return null
        }
      }),
    )

    for (const entry of loaded) {
      if (entry) {
        storeLoadedTranslationFile(result, entry.relativePath, entry.translations, disablePageLocales)
      }
    }
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code !== 'ENOENT') {
      console.error(`Failed to read directory ${dir}:`, error)
    }
  }

  return result
}

/**
 * Load only root-level translations from a directory
 * @param dir - Directory path containing translation files
 * @param disablePageLocales - If true, ignores pages/ folder and treats all files as root translations
 */
export async function loadRootTranslations(dir: string, disablePageLocales: boolean = false): Promise<Record<string, Translations>> {
  const { root } = await loadTranslations(dir, disablePageLocales)
  return root
}
