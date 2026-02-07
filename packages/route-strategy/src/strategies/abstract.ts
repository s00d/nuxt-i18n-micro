import type { NuxtPage } from '@nuxt/schema'
import { createRoute, resolveChildPath } from '../core/builder'
import type { GeneratorContext } from '../core/context'
import { pathKeyForLocalizedPaths } from '../core/localized-paths'
import {
  buildFullPath,
  buildRouteNameFromRoute,
  cloneArray,
  isInternalPath,
  isPageRedirectOnly,
  normalizePath,
  normalizeRouteKey,
  removeLeadingSlash,
} from '../utils'
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
    const normalizedOriginalPath = normalizeRouteKey(originalPath)
    const isLocalizationDisabled = context.globalLocaleRoutes[pageName] === false || context.globalLocaleRoutes[normalizedOriginalPath] === false
    if (isLocalizationDisabled) {
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
  ): NuxtPage[] {
    const childOriginalPath = resolveChildPath(parentOriginalPath, child.path ?? '')
    const fullPath = resolveChildPath(parentPath, child.path ?? '')
    const lookupKey = pathKeyForLocalizedPaths(fullPath)
    const customLocalePaths = context.localizedPaths[lookupKey]

    if (customLocalePaths) {
      return localeCodes.flatMap((locale) => {
        const parentLocalizedPath = customLocalePaths[locale] ?? resolveChildPath(parentPath, child.path ?? '')
        // For Context lookups we always use the original parent path,
        // so that childOriginalPath is computed as parentOriginalPath + child.path.
        return this.localizeChild(child, parentLocalizedPath, parentOriginalPath, locale, context, true)
      })
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
    const customPath = context.getCustomPath(childOriginalPath, locale)
    const finalPathForRoute = customPath ? removeLeadingSlash(normalizePath(customPath)) : removeLeadingSlash(normalizePath(child.path ?? ''))

    const nextParentPath = customPath ?? resolveChildPath(parentLocalizedPath, child.path ?? '')
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
