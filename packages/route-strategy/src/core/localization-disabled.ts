import type { LocaleRoutesConfig } from '../strategies/types'
import { normalizeRouteKey, removeLeadingSlash } from '../utils'
import { pathKeyForLocalizedPaths } from './localized-paths'

/** True when localization is disabled via `globalLocaleRoutes[key] === false`. */
export function isLocalizationDisabledForPage(globalLocaleRoutes: LocaleRoutesConfig, originalPath: string, pageName: string): boolean {
  const normalizedOriginalPath = normalizeRouteKey(originalPath)
  const pathKey = pathKeyForLocalizedPaths(originalPath)
  return (
    globalLocaleRoutes[pageName] === false ||
    globalLocaleRoutes[normalizedOriginalPath] === false ||
    globalLocaleRoutes[pathKey] === false ||
    globalLocaleRoutes[removeLeadingSlash(normalizedOriginalPath)] === false
  )
}
