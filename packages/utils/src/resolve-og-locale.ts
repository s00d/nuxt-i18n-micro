import type { Locale } from '@i18n-micro/types'

type OgLocaleInput = Pick<Locale, 'og' | 'iso' | 'code'>

export interface WarnUnresolvedOgLocaleOptions {
  /** When false, suppresses the warning (same flag as missing translation keys). */
  missingWarn?: boolean
  tag?: 'og:locale' | 'og:locale:alternate'
}

/**
 * Resolve Open Graph locale (`language_TERRITORY`, underscore) for `og:locale` meta tags.
 * Returns null when the value cannot be determined safely — no tag should be emitted.
 */
export function resolveOgLocale(locale: OgLocaleInput): string | null {
  const explicit = locale.og?.trim()
  if (explicit) return explicit

  const iso = locale.iso?.trim()
  if (!iso) return null

  return ogPair(iso, '_') ?? ogPair(iso, '-')
}

function isAsciiLetters(text: string): boolean {
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i) | 32
    if (c < 97 || c > 122) return false
  }
  return true
}

/** `language_REGION` of a tag cut at its first `separator`: letters only, a language of 2 or more and a region of 2. */
function ogPair(iso: string, separator: string): string | null {
  const at = iso.indexOf(separator)
  const language = iso.slice(0, at)
  const region = iso.slice(at + 1)
  if (at < 2 || region.length !== 2 || !isAsciiLetters(language) || !isAsciiLetters(region)) return null
  return `${language.toLowerCase()}_${region.toUpperCase()}`
}

/**
 * Log a dev-only hint when `og:locale` / `og:locale:alternate` cannot be derived.
 */
export function warnUnresolvedOgLocale(locale: OgLocaleInput, options: WarnUnresolvedOgLocaleOptions = {}): void {
  if (resolveOgLocale(locale) !== null) return
  if (options.missingWarn === false) return
  if (process.env.NODE_ENV === 'production') return

  const tag = options.tag ?? 'og:locale'
  const code = String(locale.code ?? 'unknown')
  const isoPart = locale.iso ? `, iso: '${locale.iso}'` : ''
  console.warn(
    `[i18n] Cannot derive ${tag} for locale '${code}'${isoPart}. ` + `Set locale.og (e.g. 'en_US') or use iso with a 2-letter region (e.g. 'en-US').`,
  )
}
