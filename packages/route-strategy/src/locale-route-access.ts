import type { Locale } from '@i18n-micro/types'
import { normalizeRouteKey, removeLeadingSlash } from './utils'

/**
 * Whether `localeCode` may serve this path given `$defineI18nRoute` / `routeLocales`.
 * When no restriction applies for the path, returns true for every locale (matches runtime path-strategy).
 */
export function isLocaleAllowedForUnlocalizedRoute(
  routeLocales: Record<string, string[]>,
  locales: Locale[],
  unlocalizedPath: string,
  localeCode: string,
): boolean {
  if (!routeLocales || Object.keys(routeLocales).length === 0) {
    return true
  }

  const normalizedPath = normalizeRouteKey(unlocalizedPath)
  const pathKey = removeLeadingSlash(normalizedPath) || '/'
  const rlKey = pathKey === '/' ? '/' : pathKey

  const allowed =
    routeLocales[normalizedPath] ??
    routeLocales[unlocalizedPath] ??
    routeLocales[pathKey] ??
    routeLocales[rlKey] ??
    (pathKey !== '/' ? routeLocales[`/${pathKey}`] : undefined)

  if (!Array.isArray(allowed) || allowed.length === 0) {
    return true
  }

  const localeCodes = locales.map((l) => l.code)
  const allowedCodes = allowed.filter((code) => localeCodes.includes(code))
  if (allowedCodes.length === 0) {
    return true
  }
  return allowedCodes.includes(localeCode)
}
