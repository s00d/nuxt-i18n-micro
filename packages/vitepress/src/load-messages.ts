import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, resolve, sep } from 'node:path'
import type { Translations } from '@i18n-micro/types'
import { deepMergeTranslations } from '@i18n-micro/utils/deep-merge'
import {
  classifyTranslationRelativePath,
  mergeRouteTranslationsWithRoot,
  type TranslationFileBuckets,
} from '@i18n-micro/utils/parse-path'

export interface LoadMessagesOptions {
  /** Directory with locale JSON (`en.json`, `pages/guide/demo/en.json`, …). */
  translationDir: string
  rootDir?: string
  /**
   * When true, treat `pages/**` files as root-level dictionaries.
   * @default false
   */
  disablePageLocales?: boolean
}

export type LoadedTranslations = TranslationFileBuckets<Translations>

export interface TranslationFileRef {
  /** Path relative to `translationDir` using `/` separators. */
  relativePath: string
  absolutePath: string
}

function isTranslationsObject(value: unknown): value is Translations {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
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
    if (entry.endsWith('.json')) {
      onFile(fullPath)
    }
  }
}

/**
 * List JSON translation files under `translationDir` (absolute + relative paths).
 */
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

/**
 * Load root + page-scoped dictionaries (`pages/** /xx.json`).
 * Node.js-only (`node:fs`).
 */
export function loadTranslationBuckets(options: LoadMessagesOptions): LoadedTranslations {
  const rootDir = options.rootDir ?? process.cwd()
  const dir = resolve(rootDir, options.translationDir)
  const buckets: LoadedTranslations = { root: {}, routes: {} }
  const disablePageLocales = options.disablePageLocales === true

  if (!existsSync(dir)) {
    return buckets
  }

  walkTranslationFiles(dir, (fullPath) => {
    const relativePath = relative(dir, fullPath).split(sep).join('/')
    try {
      const parsed: unknown = JSON.parse(readFileSync(fullPath, 'utf-8'))
      if (!isTranslationsObject(parsed)) {
        console.error(
          `[i18n-micro/vitepress] Skipping ${relativePath}: expected a JSON object, got ${Array.isArray(parsed) ? 'array' : typeof parsed}`,
        )
        return
      }
      const translations = parsed
      const classified = classifyTranslationRelativePath(relativePath, disablePageLocales)

      if (classified.type === 'page') {
        const routeBucket = buckets.routes[classified.pageName]
          ?? (buckets.routes[classified.pageName] = {})
        routeBucket[classified.locale] = translations
        return
      }

      if (classified.type === 'root') {
        const existing = buckets.root[classified.locale]
        buckets.root[classified.locale] = existing
          ? deepMergeTranslations(existing as Record<string, unknown>, translations as Record<string, unknown>) as Translations
          : translations
      }
    }
    catch (error) {
      console.error(`[i18n-micro/vitepress] Failed to load ${relativePath}:`, error)
    }
  })

  return buckets
}

/**
 * Load root-level locale JSON only (`en.json`, `fr.json`, …).
 * Prefer `loadTranslationBuckets` when page locales are needed.
 *
 * Node.js-only (`node:fs`). For bundler-friendly loading prefer
 * `withI18nMicro` virtual modules or `messagesFromGlob` in the theme.
 */
export function loadMessages(options: LoadMessagesOptions): Record<string, Translations> {
  return loadTranslationBuckets(options).root
}

/**
 * Apply page dictionaries onto an i18n instance (merged with root).
 */
export function applyLoadedTranslations(
  i18n: {
    addTranslations: (locale: string, translations: Translations, merge?: boolean) => void
    addRouteTranslations: (locale: string, routeName: string, translations: Translations, merge?: boolean) => void
  },
  loaded: LoadedTranslations,
): void {
  for (const [locale, translations] of Object.entries(loaded.root)) {
    i18n.addTranslations(locale, translations, false)
  }
  for (const [routeName, byLocale] of Object.entries(loaded.routes)) {
    for (const [locale, translations] of Object.entries(byLocale)) {
      i18n.addRouteTranslations(
        locale,
        routeName,
        mergeRouteTranslationsWithRoot(loaded.root[locale], translations),
        false,
      )
    }
  }
}
