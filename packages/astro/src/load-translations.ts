import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, resolve, sep } from 'node:path'
import type { Translations } from '@i18n-micro/types'
import { mergeRouteTranslationsWithRoot, storeLoadedTranslationFile, type TranslationFileBuckets } from '@i18n-micro/utils/parse-path'

/**
 * WARNING: Node.js-only functions
 *
 * The functions in this file use Node.js filesystem APIs (node:fs) and will NOT work
 * in Edge runtime environments (Cloudflare Workers, Vercel Edge, Deno Deploy, etc.).
 *
 * If you import this module in an Edge environment, the bundler will fail at build time
 * because node:fs is not available. This is the intended behavior (Fail Fast).
 *
 * For Edge-compatible translation loading, use import.meta.glob in your middleware:
 * const translations = import.meta.glob('/src/locales/*.json', { eager: true })
 */

/**
 * Load translations from a directory structure
 * Supports both flat structure (en.json, fr.json) and nested structure (pages/home/en.json)
 */
export interface LoadTranslationsOptions {
  translationDir: string
  rootDir?: string
  disablePageLocales?: boolean
}

export interface LoadedTranslations extends TranslationFileBuckets<Translations> {}

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
 * Load all translations from a directory
 *
 * WARNING: Node.js-only - This function uses node:fs and will NOT work in Edge runtime.
 * If imported in Edge environment, bundler will fail at build time (Fail Fast).
 * Use import.meta.glob for Edge-compatible loading.
 */
export function loadTranslationsFromDir(options: LoadTranslationsOptions): LoadedTranslations {
  const { translationDir, rootDir = process.cwd(), disablePageLocales = false } = options
  const fullTranslationDir = resolve(rootDir, translationDir)

  if (!existsSync(fullTranslationDir)) {
    console.warn(`[i18n] Translation directory not found: ${fullTranslationDir}`)
    return { root: {}, routes: {} }
  }

  const buckets: LoadedTranslations = { root: {}, routes: {} }

  walkTranslationFiles(fullTranslationDir, (fullPath) => {
    const relativePath = relative(fullTranslationDir, fullPath).split(sep).join('/')

    try {
      const content = readFileSync(fullPath, 'utf-8')
      const translations = JSON.parse(content) as Translations
      storeLoadedTranslationFile(buckets, relativePath, translations, disablePageLocales)
    } catch (error) {
      console.error(`[i18n] Failed to load translation file: ${fullPath}`, error)
    }
  })

  return buckets
}

/**
 * Load translations and add them to an AstroI18n instance
 *
 * WARNING: Node.js-only - This function uses node:fs and will NOT work in Edge runtime.
 * For Edge environments, use import.meta.glob to load translations at build time.
 */
export function loadTranslationsIntoI18n(
  i18n: {
    addTranslations: (locale: string, translations: Translations, merge?: boolean) => void
    addRouteTranslations: (locale: string, routeName: string, translations: Translations, merge?: boolean) => void
  },
  options: LoadTranslationsOptions,
): void {
  const { root, routes } = loadTranslationsFromDir(options)

  for (const [locale, translations] of Object.entries(root)) {
    i18n.addTranslations(locale, translations, false)
  }

  for (const [routeName, routeTranslations] of Object.entries(routes)) {
    for (const [locale, translations] of Object.entries(routeTranslations)) {
      i18n.addRouteTranslations(locale, routeName, mergeRouteTranslationsWithRoot(root[locale], translations), false)
    }
  }
}
