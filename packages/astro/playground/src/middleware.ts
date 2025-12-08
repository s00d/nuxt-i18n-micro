import { createI18nMiddleware, createI18n } from '@i18n-micro/astro'
import type { MiddlewareHandler } from 'astro'
import { readFileSync, existsSync } from 'node:fs'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

// Get the directory of the current file (middleware.ts)
const currentFile = fileURLToPath(import.meta.url)
const currentDir = dirname(currentFile)

// Try to find locales directory - works in both dev and production
function findLocalesDir(): string {
  // Check if we're in dist/server (production build)
  if (currentDir.includes('dist/server') || currentDir.includes('dist\\server')) {
    const distLocales = join(currentDir, 'locales')
    if (existsSync(distLocales)) return distLocales

    const projectRoot = resolve(currentDir, '../../..')
    const srcLocales = join(projectRoot, 'src', 'locales')
    if (existsSync(srcLocales)) return srcLocales
  }

  // Try relative to current directory (for dev)
  const relativePath = join(dirname(currentDir), 'locales')
  if (existsSync(relativePath)) return relativePath

  // Fallback: try from process.cwd()
  const rootPath = join(process.cwd(), 'src', 'locales')
  if (existsSync(rootPath)) return rootPath

  return relativePath
}

const localesDir = findLocalesDir()

// Load translations from JSON files
async function loadTranslations(locale: string) {
  try {
    const filePath = join(localesDir, `${locale}.json`)
    if (!existsSync(filePath)) {
      console.warn(`Translation file not found: ${filePath}`)
      return {}
    }
    const content = readFileSync(filePath, 'utf-8')
    return JSON.parse(content)
  }
  catch (error) {
    console.error(`Failed to load translations for locale: ${locale}`, error)
    return {}
  }
}

const i18n = createI18n({
  locale: 'en',
  fallbackLocale: 'en',
  messages: {},
})

// Promise to track initialization
let initPromise: Promise<void> | null = null

async function initTranslations() {
  const [en, fr, de] = await Promise.all([
    loadTranslations('en'),
    loadTranslations('fr'),
    loadTranslations('de'),
  ])

  i18n.addTranslations('en', en, false)
  i18n.addTranslations('fr', fr, false)
  i18n.addTranslations('de', de, false)
  console.log('Translations loaded')
}

const localesConfig = [
  { code: 'en', iso: 'en-US', displayName: 'English' },
  { code: 'fr', iso: 'fr-FR', displayName: 'Français' },
  { code: 'de', iso: 'de-DE', displayName: 'Deutsch' },
]

const i18nMiddleware = createI18nMiddleware({
  i18n,
  defaultLocale: 'en',
  locales: ['en', 'fr', 'de'],
  localeObjects: localesConfig,
  autoDetect: true,
})

export const onRequest = async (context: Parameters<MiddlewareHandler>[0], next: Parameters<MiddlewareHandler>[1]) => {
  // Ensure translations are loaded before processing request
  if (!initPromise) {
    initPromise = initTranslations()
  }
  await initPromise

  return i18nMiddleware(context, next)
}
