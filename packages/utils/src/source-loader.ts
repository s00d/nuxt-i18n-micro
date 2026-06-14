import type { Translations } from '@i18n-micro/types'
import { type MergeSourceTranslationsInput, mergeSourceTranslations, toSourceStorageKey } from './merge-source'

export interface TranslationStorageReader {
  getItem(key: string): Promise<unknown>
}

function toTranslations(data: unknown): Record<string, unknown> {
  if (!data) return {}
  if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
    return data as Record<string, unknown>
  }
  return {}
}

export async function loadSourceTranslationsFromStorage(
  storage: TranslationStorageReader,
  input: Omit<MergeSourceTranslationsInput, 'readLocaleFile'>,
): Promise<Translations> {
  return mergeSourceTranslations({
    ...input,
    readLocaleFile: async (relativePath) => {
      const loaded = await storage.getItem(toSourceStorageKey(relativePath))
      return toTranslations(loaded)
    },
  })
}
