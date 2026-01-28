import path from 'node:path'
import type { NuxtPage } from '@nuxt/schema'
import type { LocaleRoutesConfig } from '../strategies/types'
import { normalizePath, normalizeRouteKey, removeLeadingSlash } from '../utils'

const buildRouteNameFromRoute = (name: string | null | undefined, routePath: string | null | undefined): string =>
  name ?? (routePath ?? '').replace(/[^a-z0-9]/gi, '-').replace(/^-+|-+$/g, '')

export type LocalizedPathsMap = Record<string, Record<string, string>>

/**
 * Единый ключ для localizedPaths: без ведущего слэша, чтобы совпадать с ключами
 * из модуля (routePath из pageFile) и с lookup из стратегий (resolveChildPath).
 */
export function pathKeyForLocalizedPaths(fullPath: string): string {
  return removeLeadingSlash(fullPath) || '/'
}

/**
 * Извлекает карту кастомных путей (ключ пути → locale → path) из страниц,
 * globalLocaleRoutes и filesLocaleRoutes. Рекурсивно обходит children.
 * Ключи хранятся без ведущего слэша для совместимости с модулем и стратегиями.
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
    const normalizedFullPath = normalizePath(path.posix.join(parentPath, page.path ?? ''))
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
      const parentFullPath = normalizePath(path.posix.join(parentPath, page.path ?? ''))
      Object.assign(localizedPaths, extractLocalizedPaths(page.children, globalLocaleRoutes, filesLocaleRoutes, parentFullPath))
    }
  })

  return localizedPaths
}
