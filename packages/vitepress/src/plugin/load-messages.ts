import { resolve } from 'node:path'
import type { Translations } from '@i18n-micro/types'
import { listTranslationFiles as listDir, loadTranslationDir, type TranslationFile } from '@i18n-micro/utils/load-dir'
import type { TranslationFileBuckets } from '@i18n-micro/utils/parse-path'

export interface LoadMessagesOptions {
  translationDir: string
  rootDir?: string
  disablePageLocales?: boolean
}

export type LoadedTranslations = TranslationFileBuckets<Translations>

export type TranslationFileRef = TranslationFile

const dirOf = (options: LoadMessagesOptions) => resolve(options.rootDir ?? process.cwd(), options.translationDir)

export function listTranslationFiles(options: LoadMessagesOptions): TranslationFileRef[] {
  return listDir(dirOf(options))
}

export function loadTranslationBuckets(options: LoadMessagesOptions): LoadedTranslations {
  return loadTranslationDir<Translations>(dirOf(options), options.disablePageLocales === true)
}
