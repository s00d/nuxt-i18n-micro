/**
 * Route name utilities: base name, localized name.
 */
import type { RouteLike } from '../core/types'
import type { Locale } from '@i18n-micro/types'

export interface GetRouteBaseNameOptions {
  locales: Pick<Locale, 'code'>[]
  localizedRouteNamePrefix?: string
}

/**
 * Base route name without prefix (localized-) and suffix (-{locale}).
 * Suffix is stripped only when it is a full segment (preceded by hyphen),
 * so names like product-screen are not broken when locale is en.
 */
export function getRouteBaseName(route: RouteLike, options: GetRouteBaseNameOptions): string | null {
  const name = route.name?.toString()
  if (!name) return null

  const prefix = options.localizedRouteNamePrefix || 'localized-'
  const base = name.startsWith(prefix) ? name.slice(prefix.length) : name

  // Sort by length descending: en-US before en — otherwise we strip the wrong suffix
  const sortedLocales = [...options.locales].sort((a, b) => b.code.length - a.code.length)

  for (const locale of sortedLocales) {
    const suffix = `-${locale.code}`
    if (!base.endsWith(suffix)) continue
    // Strip only when locale code is a separate segment (preceded by hyphen: ...-en, not ...screen)
    const charBeforeLocale = base.length - locale.code.length - 1
    if (charBeforeLocale >= 0 && base[charBeforeLocale] === '-') {
      return base.slice(0, -suffix.length)
    }
  }
  return base
}

/** Builds localized name: localized-{baseName}-{locale}. */
export function buildLocalizedName(baseName: string, locale: string, prefix = 'localized-'): string {
  return `${prefix}${baseName}-${locale}`
}

export interface IsIndexRouteNameOptions {
  localizedRouteNamePrefix?: string
  localeCodes?: string[]
}

/**
 * Returns true if the given route name or base name refers to the index (root) route.
 * - Base name: 'index' or ''.
 * - Full route name: 'index', or 'localized-index-{locale}' for any locale in localeCodes.
 * Use this instead of ad-hoc checks like (name === 'index' || name.endsWith('-index') || name === 'localized-index-' + defaultLocale).
 */
export function isIndexRouteName(
  name: string | null | undefined,
  options?: IsIndexRouteNameOptions,
): boolean {
  if (name == null) return false
  const s = String(name).trim()
  if (s === '' || s === 'index') return true
  const prefix = options?.localizedRouteNamePrefix ?? 'localized-'
  const localeCodes = options?.localeCodes ?? []
  const localizedIndexPrefix = `${prefix}index-`
  if (!s.startsWith(localizedIndexPrefix)) return false
  const localePart = s.slice(localizedIndexPrefix.length)
  return localeCodes.length === 0 ? localePart.length >= 2 : localeCodes.includes(localePart)
}
