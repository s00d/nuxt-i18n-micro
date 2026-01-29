import type { NuxtPage } from '@nuxt/schema'
import type { LocaleRoutesConfig } from '../strategies/types'
import { joinPath, normalizePath, normalizeRouteKey, removeLeadingSlash } from '../utils'

const buildRouteNameFromRoute = (name: string | null | undefined, routePath: string | null | undefined): string =>
  name ?? (routePath ?? '').replace(/[^a-z0-9]/gi, '-').replace(/^-+|-+$/g, '')

export type LocalizedPathsMap = Record<string, Record<string, string>>

/**
 * Single key format for localizedPaths: without a leading slash so that it
 * matches:
 * - keys from the Nuxt module (routePath from page files),
 * - and lookups from strategies (resolveChildPath results).
 */
export function pathKeyForLocalizedPaths(fullPath: string): string {
  return removeLeadingSlash(fullPath) || '/'
}

/**
 * Extracts a map of custom paths (path key → locale → path) from:
 * - pages,
 * - globalLocaleRoutes,
 * - filesLocaleRoutes.
 *
 * Walks children recursively. Keys are stored without a leading slash for
 * compatibility with the Nuxt module and strategies.
 */
export function extractLocalizedPaths(
  pages: NuxtPage[],
  globalLocaleRoutes: LocaleRoutesConfig,
  filesLocaleRoutes: LocaleRoutesConfig,
  parentPath = '',
): LocalizedPathsMap {
  const localizedPaths: LocalizedPathsMap = {}

  pages.forEach((page) => {
    const pageName = buildRouteNameFromRoute(page.name, page.path)
    const normalizedFullPath = normalizePath(joinPath(parentPath, page.path ?? ''))
    const pathKey = pathKeyForLocalizedPaths(normalizedFullPath)
    const normalizedKey = normalizeRouteKey(normalizedFullPath)

    const globalLocalePath = globalLocaleRoutes[pathKey] || globalLocaleRoutes[normalizedKey] || globalLocaleRoutes[pageName]

    if (!globalLocalePath) {
      const filesLocalePath = filesLocaleRoutes[pageName]
      if (filesLocalePath && typeof filesLocalePath === 'object' && !Array.isArray(filesLocalePath)) {
        localizedPaths[pathKey] = filesLocalePath as Record<string, string>
      }
    }
    else if (typeof globalLocalePath === 'object') {
      localizedPaths[pathKey] = globalLocalePath
    }

    if (page.children?.length) {
      const parentFullPath = normalizePath(joinPath(parentPath, page.path ?? ''))
      Object.assign(localizedPaths, extractLocalizedPaths(page.children, globalLocaleRoutes, filesLocaleRoutes, parentFullPath))
    }
  })

  return localizedPaths
}
