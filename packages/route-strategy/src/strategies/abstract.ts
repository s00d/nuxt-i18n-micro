import type { NuxtPage } from '@nuxt/schema'
import { childSegment, createRoute, resolveChildPath } from '../core/builder'
import type { GeneratorContext } from '../core/context'
import { pathKeyForLocalizedPaths } from '../core/localized-paths'
import { isLocalizationDisabledForPage } from '../core/localization-disabled'
import { buildFullPath, buildRouteNameFromRoute, cloneArray, isInternalPath, isPageRedirectOnly, normalizePath, removeLeadingSlash } from '../utils'
import type { RouteStrategy } from './types'

export abstract class BaseStrategy implements RouteStrategy {
  processPage(page: NuxtPage, context: GeneratorContext): NuxtPage[] {
    if (page.path === undefined) {
      throw new Error('page.path is required')
    }
    if (isPageRedirectOnly(page)) {
      return [page]
    }
    if (page.path && isInternalPath(page.path, context.excludePatterns)) {
      return [page]
    }
    const originalPath = page.path ?? ''
    const pageName = buildRouteNameFromRoute(page.name, page.path)
    if (isLocalizationDisabledForPage(context.globalLocaleRoutes, originalPath, pageName)) {
      return [page]
    }
    return this.generateVariants(page, context)
  }

  postProcess(pages: NuxtPage[], _context: GeneratorContext): NuxtPage[] {
    return pages
  }

  protected abstract generateVariants(page: NuxtPage, context: GeneratorContext): NuxtPage[]

  /**
   * Recursive localization for children: for a given locale, builds:
   * - parentOriginalPath used for Context lookups,
   * - parentLocalizedPath used for the final path,
   * and returns an array of localized child routes.
   */
  protected localizeChildren(
    children: NuxtPage[],
    parentLocalizedPath: string,
    parentOriginalPath: string,
    locale: string,
    context: GeneratorContext,
    addPrefix: boolean,
  ): NuxtPage[] {
    return children.flatMap((child) => this.localizeChild(child, parentLocalizedPath, parentOriginalPath, locale, context, addPrefix))
  }

  /**
   * Variant for a single route with :locale(locale1|locale2) — without custom paths.
   * Returns a single child route with a relative path and recursively localized children.
   */
  protected localizeChildrenAllLocales(
    children: NuxtPage[],
    parentPath: string,
    parentOriginalPath: string,
    localeCodes: string[],
    context: GeneratorContext,
  ): NuxtPage[] {
    return children.flatMap((child) => this.localizeChildAllLocales(child, parentPath, parentOriginalPath, localeCodes, context))
  }

  private localizeChildAllLocales(
    child: NuxtPage,
    parentPath: string,
    parentOriginalPath: string,
    localeCodes: string[],
    context: GeneratorContext,
    applyCustomPaths = true,
  ): NuxtPage[] {
    const childOriginalPath = resolveChildPath(parentOriginalPath, child.path ?? '')
    const childName = buildRouteNameFromRoute(child.name, child.path)
    if (isLocalizationDisabledForPage(context.globalLocaleRoutes, childOriginalPath, childName)) {
      return [child]
    }
    const fullPath = resolveChildPath(parentPath, child.path ?? '')
    // Rules are keyed by the page's original path; parentPath is the localized (:locale) one.
    const customLocalePaths = context.localizedPaths[pathKeyForLocalizedPaths(childOriginalPath)]

    if (customLocalePaths && applyCustomPaths) {
      // Under the shared parent, locales without their own value share one plain child (listed
      // first, so a URL several locales share matches it); only custom locales get their own.
      // Lookups always use the original parent path.
      const plainLocales = localeCodes.filter((locale) => !customLocalePaths[locale])
      const customLocales = localeCodes.filter((locale) => customLocalePaths[locale])
      const plain = plainLocales.length
        ? this.localizeChildAllLocales({ ...child }, parentPath, parentOriginalPath, plainLocales, context, false)
        : []
      return [...plain, ...customLocales.flatMap((locale) => this.localizeChild(child, parentPath, parentOriginalPath, locale, context, true))]
    }
    const routePath = normalizePath(child.path ?? '')
    const finalPathForRoute = removeLeadingSlash(routePath)
    const localizedChildren = this.localizeChildrenAllLocales(cloneArray(child.children ?? []), fullPath, childOriginalPath, localeCodes, context)
    const newName = `${context.localizedRouteNamePrefix}${child.name ?? ''}`
    return [
      createRoute(child, {
        path: finalPathForRoute,
        name: newName,
        children: localizedChildren,
      }),
    ]
  }

  private localizeChild(
    child: NuxtPage,
    parentLocalizedPath: string,
    parentOriginalPath: string,
    locale: string,
    context: GeneratorContext,
    addPrefix: boolean,
  ): NuxtPage[] {
    const childOriginalPath = resolveChildPath(parentOriginalPath, child.path ?? '')
    const childName = buildRouteNameFromRoute(child.name, child.path)
    if (isLocalizationDisabledForPage(context.globalLocaleRoutes, childOriginalPath, childName)) {
      return [child]
    }
    const customPath = context.getCustomPath(childOriginalPath, locale)
    const finalPathForRoute = customPath ? childSegment(parentLocalizedPath, customPath) : removeLeadingSlash(normalizePath(child.path ?? ''))

    const nextParentPath = resolveChildPath(parentLocalizedPath, finalPathForRoute)
    const localizedChildren = this.localizeChildren(cloneArray(child.children ?? []), nextParentPath, childOriginalPath, locale, context, addPrefix)
    const baseName = buildRouteNameFromRoute(child.name, child.path)
    const routeName = `${context.localizedRouteNamePrefix}${baseName}-${locale}`
    return [
      createRoute(child, {
        path: finalPathForRoute,
        name: routeName,
        children: localizedChildren,
      }),
    ]
  }

  /**
   * Children of an unprefixed route with `locale`'s custom paths applied, keeping their own
   * names (the localized names belong to the prefixed variant). Unchanged when no descendant
   * has a custom path.
   */
  protected localizeChildPathsKeepNames(
    children: NuxtPage[],
    parentLocalizedPath: string,
    parentOriginalPath: string,
    locale: string,
    context: GeneratorContext,
  ): NuxtPage[] {
    return children.map((child) => {
      const childOriginalPath = resolveChildPath(parentOriginalPath, child.path ?? '')
      if (isLocalizationDisabledForPage(context.globalLocaleRoutes, childOriginalPath, buildRouteNameFromRoute(child.name, child.path))) return child
      const customPath = context.getCustomPath(childOriginalPath, locale)
      const segment = customPath ? childSegment(parentLocalizedPath, customPath) : (child.path ?? '')
      const grandChildren = child.children?.length
        ? this.localizeChildPathsKeepNames(child.children, resolveChildPath(parentLocalizedPath, segment), childOriginalPath, locale, context)
        : child.children
      return customPath || grandChildren !== child.children ? createRoute(child, { path: segment, children: grandChildren }) : child
    })
  }

  /**
   * Shared helper for strategies that build prefix-based paths (:locale(...)):
   * - for custom paths, decides whether a prefix is required,
   * - for regular paths, always uses buildFullPath.
   *
   * The logic matches what used to be duplicated in each strategy's buildRoutePath.
   */
  protected buildRoutePathForLocales(
    localeCodes: string[],
    originalPath: string,
    customPath: string,
    isCustom: boolean,
    customRegex: string | RegExp | undefined,
    force: boolean,
    defaultLocaleCode: string,
  ): string {
    if (isCustom) {
      const hasDefault = localeCodes.includes(defaultLocaleCode)
      const shouldAddPrefix = force || !hasDefault

      return shouldAddPrefix ? buildFullPath(localeCodes, customPath, customRegex) : normalizePath(customPath)
    }
    return buildFullPath(localeCodes, originalPath, customRegex)
  }
}
