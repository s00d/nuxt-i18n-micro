import type { NuxtPage } from '@nuxt/schema'
import { buildFullPath } from '../utils'
import { createRoute } from './builder'

function getAliasList(page: NuxtPage): string[] {
  const explicitAlias = (page as NuxtPage & { alias?: string[] }).alias
  const metaAlias = page.meta?.alias as string[] | undefined
  const value = explicitAlias ?? metaAlias
  return Array.isArray(value) ? value : []
}

/**
 * Generates dedicated routes for page aliases.
 * Mirrors the legacy handleAliasRoutes behavior in the original RouteGenerator.
 */
export function generateAliasRoutes(
  page: NuxtPage,
  localeCodes: string[],
  customRegex?: string | RegExp,
  localizedRouteNamePrefix = 'localized-',
): NuxtPage[] {
  const aliases = getAliasList(page)
  if (!aliases.length) return []

  const routes: NuxtPage[] = []

  for (const aliasPath of aliases) {
    const localizedAliasPath = buildFullPath(localeCodes, aliasPath, customRegex)
    routes.push(
      createRoute(page, {
        path: localizedAliasPath,
        name: `${localizedRouteNamePrefix}${page.name ?? ''}`,
        alias: undefined,
        meta: { alias: undefined },
        // Important: if the source page has children, the alias route
        // must keep the same children tree so that /alias/child does not 404.
        // createRoute takes care of cloning/adjusting children correctly.
        children: page.children,
      }),
    )
  }

  return routes
}
