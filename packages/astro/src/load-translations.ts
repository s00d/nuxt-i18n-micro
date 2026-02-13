import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'
import type { Translations } from '@i18n-micro/types'

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

export interface LoadedTranslations {
  root: Record<string, Translations>
  routes: Record<string, Record<string, Translations>>
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

  const root: Record<string, Translations> = {}
  const routes: Record<string, Record<string, Translations>> = {}

  /**
   * Recursively load translation files
   */
  const loadFiles = (dir: string, routePrefix = ''): void => {
    if (!existsSync(dir)) return

    const entries = readdirSync(dir)
    for (const entry of entries) {
      const fullPath = join(dir, entry)
      const stat = statSync(fullPath)

      if (stat.isDirectory()) {
        // If it's a 'pages' directory and page locales are enabled, treat as route-specific
        if (entry === 'pages' && !disablePageLocales) {
          loadFiles(fullPath, '')
        } else if (routePrefix || disablePageLocales) {
          // Continue in general translations
          loadFiles(fullPath, routePrefix)
        } else {
          // This is a route directory (e.g., pages/home/)
          loadFiles(fullPath, entry)
        }
      } else if (entry.endsWith('.json')) {
        const locale = entry.replace('.json', '')
        try {
          const content = readFileSync(fullPath, 'utf-8')
          const translations = JSON.parse(content) as Translations

          if (routePrefix && !disablePageLocales) {
            // Route-specific translation
            if (!routes[routePrefix]) {
              routes[routePrefix] = {}
            }
            routes[routePrefix][locale] = translations
          } else {
            // Root-level translation
            root[locale] = translations
          }
        } catch (error) {
          console.error(`[i18n] Failed to load translation file: ${fullPath}`, error)
        }
      }
    }
  }

  loadFiles(fullTranslationDir)

  return { root, routes }
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

  // Load root-level translations as index
  for (const [locale, translations] of Object.entries(root)) {
    i18n.addTranslations(locale, translations, false)
  }

  // Load route-specific translations (with root baked in)
  for (const [routeName, routeTranslations] of Object.entries(routes)) {
    for (const [locale, translations] of Object.entries(routeTranslations)) {
      const base = root[locale] || {}
      i18n.addRouteTranslations(locale, routeName, { ...base, ...translations }, false)
    }
  }
}
