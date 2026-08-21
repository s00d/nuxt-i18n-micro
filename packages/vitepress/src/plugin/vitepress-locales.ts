import type { Locale } from '@i18n-micro/types'

/**
 * Minimal VitePress `locales` entry used by the default theme language menu.
 */
export interface VitePressLocaleEntry {
  label: string
  lang: string
  link?: string
}

export interface BuildVitePressLocalesOptions {
  /**
   * Map VitePress locale keys → i18n codes (`root` → default).
   * When a non-default code maps to a short VP key (`fr` → `fr-FR`), the URL
   * prefix / config key uses the VP key.
   */
  localeKeyToCode?: Record<string, string>
}

function localeKeyFromCode(code: string, defaultLocale: string, localeKeyToCode: Record<string, string>): string {
  for (const [key, mapped] of Object.entries(localeKeyToCode)) {
    if (mapped === code) return key
  }
  if (code === defaultLocale) return 'root'
  return code
}

/**
 * Build VitePress `config.locales` from i18n-micro `Locale[]`.
 * Default locale becomes `root` (no URL prefix); others get `/{key}/`.
 */
export function buildVitePressLocales(
  locales: Locale[],
  defaultLocale: string,
  options: BuildVitePressLocalesOptions = {},
): Record<string, VitePressLocaleEntry> {
  const localeKeyToCode = options.localeKeyToCode ?? {}
  const result: Record<string, VitePressLocaleEntry> = {}

  for (const loc of locales) {
    const key = localeKeyFromCode(loc.code, defaultLocale, localeKeyToCode)
    const urlKey = key === 'root' ? loc.code : key
    const entry: VitePressLocaleEntry = {
      label: loc.displayName || loc.code.toUpperCase(),
      lang: loc.iso || loc.code,
    }
    if (key !== 'root') {
      entry.link = `/${urlKey}/`
    }
    result[key] = entry
  }

  if (!result.root) {
    const fallback = locales.find((l) => l.code === defaultLocale) ?? locales[0]
    if (fallback) {
      result.root = {
        label: fallback.displayName || fallback.code.toUpperCase(),
        lang: fallback.iso || fallback.code,
      }
    }
  }

  return result
}
