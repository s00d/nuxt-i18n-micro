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
 * Генерирует отдельные маршруты для алиасов страницы.
 * Поведение соответствует старому handleAliasRoutes в RouteGenerator.
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
        // Важно: если у исходной страницы были children, алиас-маршрут
        // должен иметь такое же дерево детей, чтобы /alias/child не 404-ило.
        // createRoute позаботится о корректном clone/adjust детей.
        children: page.children,
      }),
    )
  }

  return routes
}
