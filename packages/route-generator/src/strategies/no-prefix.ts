import type { NuxtPage } from '@nuxt/schema'
import { buildFullPathNoPrefix, buildRouteName, buildRouteNameFromRoute, cloneArray, normalizePath, removeLeadingSlash } from '../utils'
import { createRoute, resolveChildPath } from '../core/builder'
import { generateAliasRoutes } from '../core/alias'
import type { GeneratorContext } from '../core/context'
import { BaseStrategy } from './abstract'

export class NoPrefixStrategy extends BaseStrategy {
  protected generateVariants(page: NuxtPage, context: GeneratorContext): NuxtPage[] {
    const originalPath = page.path ?? ''
    const pageName = buildRouteNameFromRoute(page.name, page.path)
    const allowedLocales = context.getAllowedLocales(originalPath, pageName)
    const customPaths = context.getCustomPathsForPage(originalPath, pageName)
    const originalChildren = cloneArray(page.children ?? [])
    const result: NuxtPage[] = []

    result.push(page)

    if (customPaths) {
      for (const locale of allowedLocales) {
        const customPath = customPaths[locale]
        if (!customPath) continue

        const normalizedCustomPath = normalizePath(customPath)
        const normalizedOriginalPath = normalizePath(originalPath)

        // Если кастомный путь совпадает с оригинальным, не создаём дополнительный маршрут
        if (normalizedCustomPath === normalizedOriginalPath) {
          continue
        }

        const routePath = buildFullPathNoPrefix(customPath)
        const routeName = buildRouteName(pageName, locale, true)
        const children = this.localizeChildrenForNoPrefix(
          originalChildren,
          normalizedCustomPath,
          originalPath,
          originalPath,
          locale,
          context,
          1,
        )
        result.push(
          createRoute(page, {
            path: routePath,
            name: routeName,
            children,
            alias: [],
            meta: { alias: [] },
          }),
        )

        if (context.noPrefixRedirect && locale === context.defaultLocale.code && normalizedCustomPath !== normalizedOriginalPath) {
          page.redirect = normalizedCustomPath
        }
      }
    }

    result.push(...generateAliasRoutes(page, allowedLocales, context.customRegex, context.localizedRouteNamePrefix))
    return result
  }

  /**
   * Локализация дерева детей для стратегии no_prefix.
   * Поведение соответствует старому RouteGenerator:
   * - на первом уровне учитываются кастомные пути (globalLocaleRoutes/filesLocaleRoutes)
   * - на более глубоких уровнях path остаётся сегментом (item, detail и т.п.).
   */
  private localizeChildrenForNoPrefix(
    children: NuxtPage[],
    parentLocalizedPath: string,
    parentOriginalPath: string,
    rootOriginalPath: string,
    locale: string,
    context: GeneratorContext,
    level: number,
  ): NuxtPage[] {
    return children.map((child) => {
      const childOriginalPath = resolveChildPath(parentOriginalPath, child.path ?? '')

      let finalPathForRoute: string
      let nextParentLocalizedPath: string

      if (level === 1) {
        const customPath = context.getCustomPath(childOriginalPath, locale)
        if (customPath) {
          const normalized = normalizePath(customPath)
          finalPathForRoute = removeLeadingSlash(normalized)
          nextParentLocalizedPath = normalized
        }
        else {
          const normalizedSegment = normalizePath(child.path ?? '')
          finalPathForRoute = removeLeadingSlash(normalizedSegment)
          nextParentLocalizedPath = resolveChildPath(parentLocalizedPath, child.path ?? '')
        }
      }
      else {
        const normalizedSegment = normalizePath(child.path ?? '')
        finalPathForRoute = removeLeadingSlash(normalizedSegment)
        nextParentLocalizedPath = resolveChildPath(parentLocalizedPath, child.path ?? '')
      }

      const localizedChildren = this.localizeChildrenForNoPrefix(
        cloneArray(child.children ?? []),
        nextParentLocalizedPath,
        childOriginalPath,
        rootOriginalPath,
        locale,
        context,
        level + 1,
      )

      const baseName = buildRouteNameFromRoute(child.name, child.path)
      const routeName = buildRouteName(baseName, locale, true)

      return createRoute(child, {
        path: finalPathForRoute,
        name: routeName,
        children: localizedChildren,
      })
    })
  }
}
