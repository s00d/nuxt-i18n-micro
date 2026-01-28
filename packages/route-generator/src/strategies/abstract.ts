import type { NuxtPage } from '@nuxt/schema'
import {
  buildRouteNameFromRoute,
  cloneArray,
  isInternalPath,
  isPageRedirectOnly,
  normalizePath,
  normalizeRouteKey,
  removeLeadingSlash,
} from '../utils'
import { createRoute, resolveChildPath } from '../core/builder'
import type { GeneratorContext } from '../core/context'
import { pathKeyForLocalizedPaths } from '../core/localized-paths'
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
    const isLocalizationDisabled = context.globalLocaleRoutes[pageName] === false
      || context.globalLocaleRoutes[normalizedOriginalPath] === false
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
   * Рекурсия по детям: для данной локали строит пути (parentOriginalPath для lookup в Context,
   * parentLocalizedPath для итогового path) и возвращает массив локализованных дочерних маршрутов.
   */
  protected localizeChildren(
    children: NuxtPage[],
    parentLocalizedPath: string,
    parentOriginalPath: string,
    locale: string,
    context: GeneratorContext,
    addPrefix: boolean,
  ): NuxtPage[] {
    return children.flatMap(child => this.localizeChild(child, parentLocalizedPath, parentOriginalPath, locale, context, addPrefix))
  }

  /**
   * Вариант для одного маршрута с :locale(locale1|locale2) — без кастомных путей.
   * Возвращает один маршрут на ребёнка с относительным path и рекурсией по детям.
   */
  protected localizeChildrenAllLocales(
    children: NuxtPage[],
    parentPath: string,
    parentOriginalPath: string,
    localeCodes: string[],
    context: GeneratorContext,
  ): NuxtPage[] {
    return children.flatMap(child => this.localizeChildAllLocales(child, parentPath, parentOriginalPath, localeCodes, context))
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
    const customLocalePaths = context.localizedPaths[lookupKey] ?? context.localizedPaths[pathKeyForLocalizedPaths(normalizePath(child.path ?? ''))]

    if (customLocalePaths) {
      return localeCodes.flatMap((locale) => {
        const parentLocalizedPath = customLocalePaths[locale] ?? resolveChildPath(parentPath, child.path ?? '')
        // Для lookup в Context всегда используем оригинальный путь родителя,
        // чтобы childOriginalPath считался как parentOriginalPath + child.path.
        return this.localizeChild(child, parentLocalizedPath, parentOriginalPath, locale, context, true)
      })
    }
    const routePath = normalizePath(child.path ?? '')
    const finalPathForRoute = removeLeadingSlash(routePath)
    const localizedChildren = this.localizeChildrenAllLocales(
      cloneArray(child.children ?? []),
      fullPath,
      childOriginalPath,
      localeCodes,
      context,
    )
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
    const finalPathForRoute = customPath
      ? removeLeadingSlash(normalizePath(customPath))
      : removeLeadingSlash(normalizePath(child.path ?? ''))

    const nextParentPath = customPath ?? resolveChildPath(parentLocalizedPath, child.path ?? '')
    const localizedChildren = this.localizeChildren(
      cloneArray(child.children ?? []),
      nextParentPath,
      childOriginalPath,
      locale,
      context,
      addPrefix,
    )
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
}
