import type { NuxtPage } from '@nuxt/schema'
import { buildFullPath, buildRouteName, buildRouteNameFromRoute, cloneArray, isInternalPath, normalizePath } from '../utils'
import { createRoute } from '../core/builder'
import type { GeneratorContext } from '../core/context'
import { BaseStrategy } from './abstract'

function getAliasRoutes(page: NuxtPage): string[] {
  const alias = (page as NuxtPage & { alias?: string[] }).alias ?? page.meta?.alias
  return Array.isArray(alias) ? alias : []
}

export class PrefixStrategy extends BaseStrategy {
  protected generateVariants(page: NuxtPage, context: GeneratorContext): NuxtPage[] {
    const originalPath = page.path ?? ''
    const pageName = buildRouteNameFromRoute(page.name, page.path)
    const allowedLocales = context.getAllowedLocales(originalPath, pageName)
    const customPaths = context.getCustomPathsForPage(originalPath, pageName)
    const originalChildren = cloneArray(page.children ?? [])
    const result: NuxtPage[] = []

    if (customPaths) {
      for (const locale of allowedLocales) {
        const customPath = customPaths[locale]
        const basePath = customPath ? normalizePath(customPath) : originalPath
        const routePath = buildFullPath(locale, basePath, context.customRegex)
        const routeName = buildRouteName(pageName, locale, !!customPath, context.localizedRouteNamePrefix)
        const parentLocalizedPath = customPath ?? originalPath
        const children = this.localizeChildren(
          originalChildren,
          parentLocalizedPath,
          originalPath,
          locale,
          context,
          true,
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
      }
    }
    else {
      const routePath = buildFullPath(allowedLocales, originalPath, context.customRegex)
      const routeName = buildRouteName(pageName, allowedLocales[0]!, false, context.localizedRouteNamePrefix)
      const children = this.localizeChildrenAllLocales(
        originalChildren,
        originalPath,
        originalPath,
        allowedLocales,
        context,
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
    }

    const aliasRoutes = getAliasRoutes(page)
    if (aliasRoutes.length) {
      for (const aliasPath of aliasRoutes) {
        const localizedAliasPath = buildFullPath(allowedLocales, aliasPath, context.customRegex)
        result.push(
          createRoute(page, {
            path: localizedAliasPath,
            name: `${context.localizedRouteNamePrefix}${page.name ?? ''}`,
            alias: undefined,
            meta: { alias: undefined },
          }),
        )
      }
    }

    return result
  }

  override postProcess(pages: NuxtPage[], context: GeneratorContext): NuxtPage[] {
    const filtered = pages.filter((p) => {
      // Remove root index so it does not catch '/' (fallback route will handle it)
      if (p.name === 'index' && p.path === '/') return false
      const pagePath = p.path ?? ''
      if (pagePath && isInternalPath(pagePath, context.excludePatterns)) return true
      if (context.globalLocaleRoutes[p.name ?? ''] === false) return true
      if (/^\/:locale/.test(pagePath) || pagePath === '/') return true
      return false
    })
    if (context.fallbackRedirectComponentPath) {
      filtered.push({
        path: '/:pathMatch(.*)*',
        name: 'custom-fallback-route',
        file: context.fallbackRedirectComponentPath,
        meta: {
          globalLocaleRoutes: context.rawGlobalLocaleRoutes ?? context.globalLocaleRoutes,
        },
      })
    }
    return filtered
  }
}
