import type { Locale } from '@i18n-micro/types'

export type HreflangLocaleInput = Pick<Locale, 'code' | 'iso'>

export interface ResolveHreflangAlternatesOptions {
  /**
   * Also emit a bare-language `hreflang` derived from `iso` (e.g. `es-ES` → `es`),
   * claimed by the first regional locale in the list for that language.
   * Never derived from routing `code`.
   * @default false
   */
  hreflangBaseLanguage?: boolean
}

export interface HreflangAlternate {
  /** Value for the `hreflang` attribute (BCP-47 / `iso || code`). */
  hreflang: string
  /** Locale `code` whose localized URL should back this tag. */
  localeCode: string
}

function languageTag(locale: HreflangLocaleInput): string {
  const iso = locale.iso?.trim()
  return iso || String(locale.code)
}

function splitLanguageRegion(tag: string): { language: string, region?: string } {
  const match = tag.match(/^([A-Za-z]{2,3})(?:[-_](.+))?$/)
  if (!match) return { language: tag }
  return { language: match[1]!, region: match[2] }
}

/**
 * Resolve `hreflang` values for SEO alternate links.
 * Uses `iso || code` — never emits routing `code` when `iso` is set (#243).
 */
export function resolveHreflangAlternates(
  locales: HreflangLocaleInput[],
  options: ResolveHreflangAlternatesOptions = {},
): HreflangAlternate[] {
  const { hreflangBaseLanguage = false } = options

  if (!hreflangBaseLanguage) {
    return locales.map((loc) => {
      const code = String(loc.code)
      return { hreflang: languageTag(loc), localeCode: code }
    })
  }

  // First regional locale in list claims the bare language tag.
  const localeMap = new Map<string, string>()

  for (const loc of locales) {
    const code = String(loc.code)
    const tag = languageTag(loc)
    const { language, region } = splitLanguageRegion(tag)

    if (language && region && !localeMap.has(language)) {
      localeMap.set(language, code)
    }
    localeMap.set(tag, code)
  }

  // Stable order: for each locale, bare language (if this locale owns it) then full tag.
  const seen = new Set<string>()
  const result: HreflangAlternate[] = []

  for (const loc of locales) {
    const code = String(loc.code)
    const tag = languageTag(loc)
    const { language, region } = splitLanguageRegion(tag)

    if (language && region && localeMap.get(language) === code && !seen.has(language)) {
      seen.add(language)
      result.push({ hreflang: language, localeCode: code })
    }

    if (!seen.has(tag)) {
      seen.add(tag)
      result.push({ hreflang: tag, localeCode: code })
    }
  }

  return result
}
