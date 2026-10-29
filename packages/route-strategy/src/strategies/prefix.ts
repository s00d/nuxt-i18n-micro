import type { NuxtPage } from '@nuxt/schema'
import { createRoute } from '../core/builder'
import type { GeneratorContext } from '../core/context'
import { isLocalizationDisabledForPage } from '../core/localization-disabled'
import { buildEncodedPathAliases, buildFullPath, buildRouteName, buildRouteNameFromRoute, cloneArray, isInternalPath, normalizePath } from '../utils'
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
      // Locales without their own custom path share one :locale(a|b) route, so that
      // `localized-<name>` stays unique (vue-router drops all but the last duplicate name).
      const plainLocales = allowedLocales.filter((locale) => !customPaths[locale])
      if (plainLocales.length) {
        const routePath = buildFullPath(plainLocales, originalPath, context.customRegex)
        const aliases = buildEncodedPathAliases(routePath)
        result.push(
          createRoute(page, {
            path: routePath,
            name: buildRouteName(pageName, plainLocales[0]!, false, context.localizedRouteNamePrefix),
            children: this.localizeChildrenAllLocales(originalChildren, originalPath, originalPath, plainLocales, context),
            alias: aliases.length ? aliases : undefined,
            meta: { alias: aliases.length ? aliases : [] },
          }),
        )
      }
      for (const locale of allowedLocales) {
        const customPath = customPaths[locale]
        if (!customPath) continue
        const basePath = normalizePath(customPath)
        const routePath = buildFullPath(locale, basePath, context.customRegex)
        const routeName = buildRouteName(pageName, locale, !!customPath, context.localizedRouteNamePrefix)
        const parentLocalizedPath = customPath ?? originalPath
        const children = this.localizeChildren(originalChildren, parentLocalizedPath, originalPath, locale, context, true)
        const aliases = buildEncodedPathAliases(routePath)
        result.push(
          createRoute(page, {
            path: routePath,
            name: routeName,
            children,
            alias: aliases.length ? aliases : undefined,
            meta: { alias: aliases.length ? aliases : [] },
          }),
        )
      }
    } else {
      const routePath = buildFullPath(allowedLocales, originalPath, context.customRegex)
      const routeName = buildRouteName(pageName, allowedLocales[0]!, false, context.localizedRouteNamePrefix)
      const children = this.localizeChildrenAllLocales(originalChildren, originalPath, originalPath, allowedLocales, context)
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
      // Keep pages disabled for localization (by name OR path-style key) as-is —
      // matching processPage's predicate so they stay unlocalized instead of vanishing.
      if (isLocalizationDisabledForPage(context.globalLocaleRoutes, pagePath, p.name ?? '')) return true
      if (/^\/:locale/.test(pagePath) || pagePath === '/') return true
      return false
    })

    // Add redirect routes for custom paths (e.g., /page2 → /en/custom-page2-en)
    const defaultLocale = context.defaultLocale.code
    for (const [routeKey, localePaths] of Object.entries(context.globalLocaleRoutes)) {
      if (localePaths === false || typeof localePaths !== 'object') continue

      const customPath = (localePaths as Record<string, string>)[defaultLocale]
      if (!customPath) continue

      // Original path (e.g., /page2)
      const originalPath = routeKey.startsWith('/') ? routeKey : `/${routeKey}`
      // Target path with locale prefix (e.g., /en/custom-page2-en)
      const targetPath = `/${defaultLocale}${customPath.startsWith('/') ? customPath : `/${customPath}`}`

      // Only add redirect if paths differ
      if (originalPath !== targetPath) {
        filtered.push({
          path: originalPath,
          // the raw key keeps `about-team` and `about/team` apart (dashes would collide)
          name: `redirect-${routeKey}`,
          redirect: targetPath,
        } as NuxtPage)
      }
    }

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
