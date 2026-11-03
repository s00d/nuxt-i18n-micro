import type { Translations } from '@i18n-micro/types'
import { loadTranslationDirAsync } from '@i18n-micro/utils/load-dir'
import type { TranslationFileBuckets } from '@i18n-micro/utils/parse-path'

export interface LoadedTranslations extends TranslationFileBuckets<Translations> {}

/**
 * Load translations from a directory
 * Supports both flat structure (locales/{lang}.json) and nested structure (locales/pages/{page}/{lang}.json)
 * @param dir - Directory path containing translation files
 * @param disablePageLocales - If true, ignores pages/ folder and treats all files as global translations
 * @returns Object with global and route-specific translations
 */
export function loadTranslations(dir: string, disablePageLocales: boolean = false): Promise<LoadedTranslations> {
  return loadTranslationDirAsync<Translations>(dir, disablePageLocales)
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
