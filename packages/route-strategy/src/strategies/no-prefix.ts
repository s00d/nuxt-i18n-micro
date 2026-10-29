import type { NuxtPage } from '@nuxt/schema'
import { childSegment, createRoute, resolveChildPath } from '../core/builder'
import type { GeneratorContext } from '../core/context'
import { buildFullPathNoPrefix, buildRouteName, buildRouteNameFromRoute, cloneArray, normalizePath, removeLeadingSlash } from '../utils'
import { BaseStrategy } from './abstract'

export class NoPrefixStrategy extends BaseStrategy {
  protected generateVariants(page: NuxtPage, context: GeneratorContext): NuxtPage[] {
    const originalPath = page.path ?? ''
    const pageName = buildRouteNameFromRoute(page.name, page.path)
    const allowedLocales = context.getAllowedLocales(originalPath, pageName)
    const customPaths = context.getCustomPathsForPage(originalPath, pageName)
    const originalChildren = cloneArray(page.children ?? [])
    const result: NuxtPage[] = []

    // The base page serves the default URL: give it its aliases plus the encoded variants of a
    // non-ASCII path (in place: noPrefixRedirect below sets `redirect` on this same object).
    const baseAliases = this.routeAliases(page, normalizePath(originalPath), null, context)
    const declared = (page as NuxtPage & { alias?: string[] }).alias ?? (page.meta?.alias as string[] | undefined) ?? []
    if (baseAliases.length && baseAliases.join('\n') !== declared.join('\n')) {
      page.alias = baseAliases
      page.meta = { ...page.meta, alias: baseAliases }
    }
    result.push(page)
    const localizedLocales = new Set<string>()

    if (customPaths) {
      for (const locale of allowedLocales) {
        const customPath = customPaths[locale]
        if (!customPath) continue

        const normalizedCustomPath = normalizePath(customPath)
        const normalizedOriginalPath = normalizePath(originalPath)

        // If the custom path equals the original one, do not create an additional route
        if (normalizedCustomPath === normalizedOriginalPath) {
          continue
        }
        localizedLocales.add(locale)

        const routePath = buildFullPathNoPrefix(customPath)
        const routeName = buildRouteName(pageName, locale, true)
        const children = this.localizeChildrenForNoPrefix(originalChildren, normalizedCustomPath, originalPath, locale, context)
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

    // A locale without its own parent path still needs localized children when a descendant
    // has a different custom path for it: a copy of the parent at its own path carries them.
    for (const locale of allowedLocales) {
      if (localizedLocales.has(locale)) continue
      if (!this.hasChangedChildPath(originalChildren, originalPath, locale, context)) continue
      result.push(
        createRoute(page, {
          path: buildFullPathNoPrefix(originalPath),
          name: buildRouteName(pageName, locale, true),
          children: this.localizeChildrenForNoPrefix(originalChildren, normalizePath(originalPath), originalPath, locale, context),
          alias: [],
          meta: { alias: [] },
        }),
      )
    }

    // Aliases stay on the base page (unprefixed, as Nuxt registers them): no extra alias routes.
    return result
  }

  /** Whether a descendant has a custom path for `locale` that differs from its own path. */
  private hasChangedChildPath(children: NuxtPage[], parentOriginalPath: string, locale: string, context: GeneratorContext): boolean {
    return children.some((child) => {
      const childOriginalPath = resolveChildPath(parentOriginalPath, child.path ?? '')
      const customPath = context.getCustomPath(childOriginalPath, locale)
      if (customPath && childSegment(parentOriginalPath, customPath) !== removeLeadingSlash(normalizePath(child.path ?? ''))) return true
      return this.hasChangedChildPath(child.children ?? [], childOriginalPath, locale, context)
    })
  }

  /**
   * Localizes the children tree for the no_prefix strategy: custom paths
   * (globalLocaleRoutes/filesLocaleRoutes) apply at every level.
   */
  private localizeChildrenForNoPrefix(
    children: NuxtPage[],
    parentLocalizedPath: string,
    parentOriginalPath: string,
    locale: string,
    context: GeneratorContext,
  ): NuxtPage[] {
    return children.map((child) => {
      const childOriginalPath = resolveChildPath(parentOriginalPath, child.path ?? '')

      // Custom paths apply at every level, relative to the localized parent (or as a full URL).
      const customPath = context.getCustomPath(childOriginalPath, locale)
      const finalPathForRoute = customPath ? childSegment(parentLocalizedPath, customPath) : removeLeadingSlash(normalizePath(child.path ?? ''))
      const nextParentLocalizedPath = resolveChildPath(parentLocalizedPath, finalPathForRoute)

      const localizedChildren = this.localizeChildrenForNoPrefix(
        cloneArray(child.children ?? []),
        nextParentLocalizedPath,
        childOriginalPath,
        locale,
        context,
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
