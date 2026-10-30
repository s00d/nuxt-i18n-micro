/**
 * `@i18n-micro/astro/node`: reading a locales directory at runtime, for a `src/middleware.ts` of your
 * own. Node only. `i18nIntegration` bundles the directory by itself, which also works on the edge.
 */
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Translations } from '@i18n-micro/types'
import { listTranslationFiles, loadTranslationDir } from '@i18n-micro/utils/load-dir'
import type { TranslationFileBuckets } from '@i18n-micro/utils/parse-path'

export interface LoadTranslationsOptions {
  translationDir: string
  rootDir?: string
  disablePageLocales?: boolean
}

export interface LoadedTranslations extends TranslationFileBuckets<Translations> {}

/** Load all translations from a directory: flat (`en.json`) and nested (`pages/home/en.json`). */
export function loadTranslationsFromDir(options: LoadTranslationsOptions): LoadedTranslations {
  const { translationDir, rootDir = process.cwd(), disablePageLocales = false } = options
  return loadTranslationDir<Translations>(resolve(rootDir, translationDir), disablePageLocales)
}

/** The directory's dictionaries and the files they came from, for the integration's build. */
export function readTranslationDir(options: { translationDir: string; rootDir: URL; disablePageLocales?: boolean }) {
  const dir = resolve(fileURLToPath(options.rootDir), options.translationDir)
  return { messages: loadTranslationDir<Translations>(dir, options.disablePageLocales), files: listTranslationFiles(dir).map((file) => file.absolutePath) }
}

/** Load a directory into an instance, replacing the chunks it finds. */
export function loadTranslationsIntoI18n(
  i18n: {
    addTranslations: (locale: string, translations: Translations, merge?: boolean) => void
    addRouteTranslations: (locale: string, routeName: string, translations: Translations, merge?: boolean) => void
  },
  options: LoadTranslationsOptions,
): void {
  const { root, routes } = loadTranslationsFromDir(options)
  for (const [locale, translations] of Object.entries(root)) i18n.addTranslations(locale, translations, false)
  for (const [routeName, routeTranslations] of Object.entries(routes)) {
    for (const [locale, translations] of Object.entries(routeTranslations)) i18n.addRouteTranslations(locale, routeName, translations, false)
  }
}
