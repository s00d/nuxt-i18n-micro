import type { Translations } from '@i18n-micro/types'
import { type MergeSourceTranslationsInput, mergeSourceTranslations, toSourceStorageKey } from './merge-source'
import { toTranslationRecord } from './normalize'

export interface TranslationStorageReader {
  getItem(key: string): Promise<unknown>
}

export async function loadSourceTranslationsFromStorage(
  storage: TranslationStorageReader,
  input: Omit<MergeSourceTranslationsInput, 'readLocaleFile'>,
): Promise<Translations> {
  return mergeSourceTranslations({
    ...input,
    readLocaleFile: async (relativePath) => {
      const loaded = await storage.getItem(toSourceStorageKey(relativePath))
      return toTranslationRecord(loaded)
    },
  })
}
