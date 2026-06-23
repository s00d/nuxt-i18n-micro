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

  const underscoreIndex = iso.indexOf('_')
  if (underscoreIndex > 0) {
    const language = iso.slice(0, underscoreIndex)
    const territory = iso.slice(underscoreIndex + 1)
    if (language.length >= 2 && territory.length === 2) {
      return `${language.toLowerCase()}_${territory.toUpperCase()}`
    }
  }

  const hyphenIndex = iso.indexOf('-')
  if (hyphenIndex > 0) {
    const language = iso.slice(0, hyphenIndex)
    const region = iso.slice(hyphenIndex + 1)
    if (language.length >= 2 && region.length === 2 && /^[A-Za-z]{2}$/.test(region)) {
      return `${language.toLowerCase()}_${region.toUpperCase()}`
    }
  }

  return null
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
