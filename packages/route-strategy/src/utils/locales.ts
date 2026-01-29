import type { Locale } from '@i18n-micro/types'

export interface ResolvedLocales {
  locales: Locale[]
  defaultLocale: Locale
}

/**
 * Merges locale list (dedupe by code, merge props) and filters out disabled locales.
 */
export function resolveLocales(locales: Locale[], defaultLocaleCode: string): ResolvedLocales {
  const merged = locales.reduce((acc, locale) => {
    const existing = acc.find(l => l.code === locale.code)
    if (existing) {
      Object.assign(existing, locale)
    }
    else {
      acc.push(locale)
    }
    return acc
  }, [] as Locale[]).filter(locale => !locale.disabled)

  const defaultLocale = merged.find(l => l.code === defaultLocaleCode)
    ?? { code: defaultLocaleCode }

  return { locales: merged, defaultLocale }
}
