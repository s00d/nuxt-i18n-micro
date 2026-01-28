import path from 'node:path'
import type { NuxtPage } from '@nuxt/schema'
import { isPrefixAndDefaultStrategy, isPrefixStrategy } from '@i18n-micro/core'
import {
  buildFullPath,
  buildRouteName,
  buildRouteNameFromRoute,
  cloneArray,
  isLocaleDefault,
  normalizePath,
  removeLeadingSlash,
  shouldAddLocalePrefix,
} from '../utils'
import { createRoute, resolveChildPath } from '../core/builder'
import { generateAliasRoutes } from '../core/alias'
import type { GeneratorContext } from '../core/context'
import { pathKeyForLocalizedPaths } from '../core/localized-paths'
import { BaseStrategy } from './abstract'

export class PrefixExceptDefaultStrategy extends BaseStrategy {
  protected generateVariants(page: NuxtPage, context: GeneratorContext): NuxtPage[] {
    const originalPath = page.path ?? ''
    const pageName = buildRouteNameFromRoute(page.name, page.path)
    const allowedLocales = context.getAllowedLocales(originalPath, pageName)
    const customPaths = context.getCustomPathsForPage(originalPath, pageName)
    const originalChildren = cloneArray(page.children ?? [])
    const result: NuxtPage[] = []

    const defaultLocaleCode = context.defaultLocale.code

    // 1. Маршрут дефолтной локали: один непрефиксный (как defaultRoute в старом RouteGenerator)
    if (allowedLocales.includes(defaultLocaleCode)) {
      const defaultCustomPath = customPaths?.[defaultLocaleCode]
      const defaultRoutePath = defaultCustomPath ? normalizePath(defaultCustomPath) : originalPath
      const localizedParentPaths = defaultCustomPath ? { [defaultLocaleCode]: defaultCustomPath } : {}
      const defaultChildren = this.createLocalizedChildren(
        originalChildren,
        originalPath,
        [defaultLocaleCode],
        false,
        false,
        false,
        localizedParentPaths,
        context,
      )

      result.push(
        createRoute(page, {
          path: defaultRoutePath,
          name: page.name,
          children: defaultChildren,
        }),
      )
    }

    // 2. Нестандартные локали: префиксные маршруты
    const nonDefaultLocales = context.locales.filter(
      locale => allowedLocales.includes(locale.code) && locale.code !== defaultLocaleCode,
    )

    if (nonDefaultLocales.length) {
      if (customPaths) {
        for (const locale of nonDefaultLocales) {
          const customPath = customPaths[locale.code]
          if (customPath) {
            const newRoute = this.createLocalizedRoute(
              page,
              [locale.code],
              originalChildren,
              true,
              customPath,
              context.customRegex,
              false,
              locale.code,
              originalPath,
              context,
            )
            if (newRoute) result.push(newRoute)
          }
          else {
            const newRoute = this.createLocalizedRoute(
              page,
              [locale.code],
              originalChildren,
              false,
              '',
              context.customRegex,
              false,
              locale.code,
              originalPath,
              context,
            )
            if (newRoute) result.push(newRoute)
          }
        }
      }
      else {
        const localeCodes = nonDefaultLocales.map(l => l.code)
        const newRoute = this.createLocalizedRoute(
          page,
          localeCodes,
          originalChildren,
          false,
          '',
          context.customRegex,
          false,
          true,
          originalPath,
          context,
        )
        if (newRoute) result.push(newRoute)
      }
    }

    // 3. Алиасы: как в старом коде — для всех разрешённых локалей (включая дефолтную)
    const aliasRoutes = generateAliasRoutes(page, allowedLocales, context.customRegex, context.localizedRouteNamePrefix)
    if (aliasRoutes.length) {
      result.push(...aliasRoutes)
    }

    return result
  }

  // Группируем оригинальные маршруты и локализованные: сначала базовые, затем localized-*
  override postProcess(pages: NuxtPage[], context: GeneratorContext): NuxtPage[] {
    const basePages: NuxtPage[] = []
    const localizedPages: NuxtPage[] = []

    for (const page of pages) {
      const name = page.name ?? ''
      if (typeof name === 'string' && name.startsWith(context.localizedRouteNamePrefix)) {
        localizedPages.push(page)
      }
      else {
        basePages.push(page)
      }
    }

    return [...basePages, ...localizedPages]
  }

  private createLocalizedChildren(
    routes: NuxtPage[],
    parentPath: string,
    localeCodes: string[],
    modifyName = true,
    addLocalePrefix = false,
    parentLocale: string | boolean = false,
    localizedParentPaths: Record<string, string> = {},
    context: GeneratorContext,
  ): NuxtPage[] {
    return routes.flatMap(route =>
      this.createLocalizedVariants(
        route,
        parentPath,
        localeCodes,
        modifyName,
        addLocalePrefix,
        parentLocale,
        localizedParentPaths,
        context,
      ),
    )
  }

  private createLocalizedVariants(
    route: NuxtPage,
    parentPath: string,
    localeCodes: string[],
    modifyName: boolean,
    addLocalePrefix: boolean,
    parentLocale: string | boolean = false,
    localizedParentPaths: Record<string, string>,
    context: GeneratorContext,
  ): NuxtPage[] {
    const routePath = normalizePath(route.path ?? '')
    const fullPath = resolveChildPath(parentPath, route.path ?? '')
    const lookupKey = pathKeyForLocalizedPaths(fullPath)

    let customLocalePaths = context.localizedPaths[lookupKey] ?? context.localizedPaths[pathKeyForLocalizedPaths(normalizePath(route.path ?? ''))]

    if (!customLocalePaths && Object.keys(localizedParentPaths).length > 0) {
      const hasLocalizedContext = Object.values(localizedParentPaths).some(p => p && p !== '')
      if (hasLocalizedContext) {
        const originalRoutePath = normalizePath(path.posix.join('/activity-locale', route.path ?? ''))
        customLocalePaths = context.localizedPaths[pathKeyForLocalizedPaths(originalRoutePath)]
      }
    }

    const isCustomLocalized = !!customLocalePaths

    const result: NuxtPage[] = []

    if (!isCustomLocalized) {
      const finalPathForRoute = removeLeadingSlash(routePath)

      const localizedChildren = this.createLocalizedChildren(
        cloneArray(route.children ?? []),
        resolveChildPath(parentPath, route.path ?? ''),
        localeCodes,
        modifyName,
        addLocalePrefix,
        parentLocale,
        localizedParentPaths,
        context,
      )

      const newName = this.buildChildRouteName(route.name as string, parentLocale, context)

      result.push(
        createRoute(route, {
          path: finalPathForRoute,
          name: newName,
          children: localizedChildren,
        }),
      )

      return result
    }

    for (const locale of localeCodes) {
      const parentLocalizedPath = localizedParentPaths?.[locale]
      const hasParentLocalized = !!parentLocalizedPath

      const customPath = customLocalePaths?.[locale]

      let basePath = customPath
        ? normalizePath(customPath)
        : normalizePath(route.path ?? '')

      if (hasParentLocalized && parentLocalizedPath) {
        if (customPath) {
          basePath = normalizePath(customPath)
        }
        else {
          basePath = resolveChildPath(parentLocalizedPath, route.path ?? '')
        }
      }

      const finalRoutePath = shouldAddLocalePrefix(
        locale,
        context.defaultLocale,
        addLocalePrefix,
        isPrefixStrategy(context.strategy),
      )
        ? buildFullPath(locale, basePath, context.customRegex)
        : basePath

      const finalPathForRoute = removeLeadingSlash(finalRoutePath)

      const nextParentPath = customPath
        ? normalizePath(customPath)
        : hasParentLocalized
          ? parentLocalizedPath
          : resolveChildPath(parentPath, route.path ?? '')

      const localizedChildren = this.createLocalizedChildren(
        cloneArray(route.children ?? []),
        nextParentPath,
        [locale],
        modifyName,
        addLocalePrefix,
        locale,
        {
          ...localizedParentPaths,
          [locale]: nextParentPath,
        },
        context,
      )

      const routeName = this.buildLocalizedRouteName(
        buildRouteNameFromRoute(route.name, route.path),
        locale,
        modifyName,
        !!customLocalePaths,
        context,
      )

      result.push(
        createRoute(route, {
          path: finalPathForRoute,
          name: routeName,
          children: localizedChildren,
        }),
      )
    }

    return result
  }

  private buildChildRouteName(baseName: string, parentLocale: string | boolean, context: GeneratorContext): string {
    if (parentLocale === true) {
      return `${context.localizedRouteNamePrefix}${baseName}`
    }
    if (typeof parentLocale === 'string') {
      return `${context.localizedRouteNamePrefix}${baseName}-${parentLocale}`
    }
    return baseName
  }

  private createLocalizedRoute(
    page: NuxtPage,
    localeCodes: string[],
    originalChildren: NuxtPage[],
    isCustom: boolean,
    customPath: string = '',
    customRegex: string | RegExp | undefined,
    force = false,
    parentLocale: string | boolean = false,
    originalPagePath: string | undefined,
    context: GeneratorContext,
  ): NuxtPage | null {
    const routePath = this.buildRoutePath(localeCodes, page.path ?? '', encodeURI(customPath), isCustom, customRegex, force, context)
    const isPrefixAndDefaultWithCustomPath = isPrefixAndDefaultStrategy(context.strategy) && isCustom && customPath
    if (!routePath || (!isPrefixAndDefaultWithCustomPath && routePath === page.path)) return null
    if (localeCodes.length === 0) return null
    const firstLocale = localeCodes[0]
    if (!firstLocale) return null
    const parentPathForChildren = originalPagePath ?? page.path ?? ''
    const routeName = buildRouteName(buildRouteNameFromRoute(page.name ?? '', parentPathForChildren), firstLocale, isCustom, context.localizedRouteNamePrefix)

    return createRoute(page, {
      path: routePath,
      name: routeName,
      children: this.createLocalizedChildren(
        originalChildren,
        parentPathForChildren,
        localeCodes,
        true,
        false,
        parentLocale,
        { [firstLocale]: customPath },
        context,
      ),
      alias: [],
      meta: { alias: [] },
    })
  }

  private buildLocalizedRouteName(
    baseName: string,
    locale: string,
    modifyName: boolean,
    forceLocaleSuffixOrCustom = false,
    context: GeneratorContext,
  ): string {
    if (!modifyName) return baseName

    if (forceLocaleSuffixOrCustom) {
      return `${context.localizedRouteNamePrefix}${baseName}-${locale}`
    }

    const shouldAddLocaleSuffix = locale
      && !isLocaleDefault(locale, context.defaultLocale, isPrefixAndDefaultStrategy(context.strategy))

    return shouldAddLocaleSuffix
      ? `${context.localizedRouteNamePrefix}${baseName}-${locale}`
      : `${context.localizedRouteNamePrefix}${baseName}`
  }

  private buildRoutePath(
    localeCodes: string[],
    originalPath: string,
    customPath: string,
    isCustom: boolean,
    customRegex: string | RegExp | undefined,
    force = false,
    context: GeneratorContext,
  ): string {
    if (isCustom) {
      const shouldAddPrefix = force
        || isPrefixStrategy(context.strategy)
        || (isPrefixAndDefaultStrategy(context.strategy) && !localeCodes.includes(context.defaultLocale.code))
        || !localeCodes.includes(context.defaultLocale.code)

      return shouldAddPrefix
        ? buildFullPath(localeCodes, customPath, customRegex)
        : normalizePath(customPath)
    }
    return buildFullPath(localeCodes, originalPath, customRegex)
  }
}
