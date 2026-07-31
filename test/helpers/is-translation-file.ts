import path from 'node:path'

/** BCP-47-ish locale file stem used by older @nuxtjs/i18n chunk layouts. */
const LOCALE_STEM = String.raw`[a-z]{2,3}(?:-[a-z0-9]+)?`

/**
 * Classify built output as translation payload vs app code (#237 feedback).
 *
 * Important: `@nuxtjs/i18n` ships messages as content-hashed files under `chunks/raw/`.
 * Counting only `en4.mjs`-style names mis-labels ~tens of MB as "code" and zeros out
 * their translations column. Everything under `chunks/raw/` is treated as translations.
 */
export function isTranslationFile(filePath: string): boolean {
  const relativePath = filePath.toLowerCase().replace(/\\/g, '/')
  const fileName = path.basename(filePath)

  // JSON locale payloads (i18n-micro: `locales/`, `/_locales/`, custom apiBaseUrl folders)
  if (filePath.endsWith('.json') && (relativePath.includes('/locales/') || relativePath.includes('/_locales/') || relativePath.includes('/translations/'))) {
    return true
  }

  // Raw message chunks — both micro (`en4.mjs`) and @nuxtjs/i18n (content-hashed `*.mjs`)
  if (relativePath.includes('/chunks/raw/')) {
    return true
  }

  // Legacy / alternate @nuxtjs/i18n layouts
  // e.g. chunks/_/en.mjs, chunks/build/en-DNSlf_yQ.mjs
  if (relativePath.includes('/chunks/_/')) {
    if (new RegExp(`^${LOCALE_STEM}\\.mjs$`, 'i').test(fileName)) return true
  }

  if (relativePath.includes('/chunks/build/')) {
    if (new RegExp(`^${LOCALE_STEM}-\\w+\\.mjs$`, 'i').test(fileName)) return true
  }

  // Nitro serverAssets (plain-nuxt stress dictionaries) and API translation routes
  if (relativePath.includes('/assets/translations/') || relativePath.includes('/routes/api/translations/')) {
    return true
  }

  return false
}
