import path from 'node:path'
import type { NuxtPage } from '@nuxt/schema'
import type { GlobalLocaleRoutes, Locale, Strategies } from '@i18n-micro/types'
import { isNoPrefixStrategy, isPrefixAndDefaultStrategy, isPrefixExceptDefaultStrategy, isPrefixStrategy } from '@i18n-micro/core'
import {
  buildFullPath,
  buildFullPathNoPrefix,
  buildRouteName,
  cloneArray,
  isLocaleDefault,
  isPageRedirectOnly,
  normalizePath,
  normalizeRouteKey,
  removeLeadingSlash,
  shouldAddLocalePrefix,
} from './utils'
import { isInternalPath } from './path-utils'

const buildRouteNameFromRoute = (name: string | null | undefined, path: string | null | undefined) => {
  return name ?? (path ?? '').replace(/[^a-z0-9]/gi, '-').replace(/^-+|-+$/g, '')
}

export class RouteGenerator {
  locales: Locale[]
  defaultLocale: Locale
  strategy: Strategies
  localizedPaths: { [key: string]: { [locale: string]: string } } = {}
  activeLocaleCodes: string[]
  globalLocaleRoutes: Record<string, Record<string, string> | false | boolean>
  filesLocaleRoutes: Record<string, Record<string, string> | false | boolean>
  routeLocales: Record<string, string[]>
  noPrefixRedirect: boolean
  excludePatterns: (string | RegExp)[] | undefined

  constructor(locales: Locale[], defaultLocaleCode: string, strategy: Strategies, globalLocaleRoutes: GlobalLocaleRoutes, filesLocaleRoutes: GlobalLocaleRoutes, routeLocales: Record<string, string[]>, noPrefixRedirect: boolean, excludePatterns?: (string | RegExp)[]) {
    this.locales = locales
    this.defaultLocale = this.findLocaleByCode(defaultLocaleCode) || { code: defaultLocaleCode }
    this.strategy = strategy
    this.noPrefixRedirect = noPrefixRedirect
    this.excludePatterns = excludePatterns
    this.activeLocaleCodes = this.computeActiveLocaleCodes()

    const normalizedGlobalRoutes: GlobalLocaleRoutes = {}
    for (const key in globalLocaleRoutes) {
      const newKey = normalizeRouteKey(key)
      const localePaths = globalLocaleRoutes[key]

      if (typeof localePaths === 'object') {
        const normalizedLocalePaths: { [locale: string]: string } = {}

        for (const locale in localePaths) {
          const customPath = localePaths[locale]
          if (customPath) {
            normalizedLocalePaths[locale] = normalizeRouteKey(customPath)
          }
        }

        normalizedGlobalRoutes[newKey] = normalizedLocalePaths
      }
      else {
        normalizedGlobalRoutes[newKey] = localePaths as boolean | Record<string, string>
      }
    }
    this.globalLocaleRoutes = normalizedGlobalRoutes

    this.filesLocaleRoutes = filesLocaleRoutes || {}
    this.routeLocales = routeLocales || {}
  }

  private findLocaleByCode(code: string): Locale | undefined {
    return this.locales.find(locale => locale.code === code)
  }

  private computeActiveLocaleCodes(): string[] {
    return this.locales
      .filter(locale => locale.code !== this.defaultLocale.code || isPrefixAndDefaultStrategy(this.strategy) || isPrefixStrategy(this.strategy))
      .map(locale => locale.code)
  }

  private getAllowedLocalesForPage(pagePath: string, pageName: string): string[] {
    const allowedLocales = this.routeLocales[pagePath] || this.routeLocales[pageName]

    if (allowedLocales && allowedLocales.length > 0) {
      return allowedLocales.filter(locale =>
        this.locales.some(l => l.code === locale),
      )
    }

    return this.locales.map(locale => locale.code)
  }

  private hasLocaleRestrictions(pagePath: string, pageName: string): boolean {
    return !!(this.routeLocales[pagePath] || this.routeLocales[pageName])
  }

  public extendPages(pages: NuxtPage[], customRegex?: string | RegExp, isCloudflarePages?: boolean) {
    this.localizedPaths = this.extractLocalizedPaths(pages)

    const mainRoutes: NuxtPage[] = []
    const additionalRoutes: NuxtPage[] = []
    const originalPagePaths = new Map<NuxtPage, string>()

    for (const page of [...pages]) {
      if (isPageRedirectOnly(page)) {
        mainRoutes.push(page)
        continue
      }

      if (page.path && isInternalPath(page.path, this.excludePatterns)) {
        mainRoutes.push(page)
        continue
      }

      const originalPath = page.path ?? ''
      originalPagePaths.set(page, originalPath)

      const pageName = buildRouteNameFromRoute(page.name, page.path)
      const normalizedOriginalPath = normalizeRouteKey(originalPath)
      const customPaths = this.localizedPaths[originalPath] || this.localizedPaths[pageName]

      const isLocalizationDisabled = this.globalLocaleRoutes[pageName] === false
        || this.globalLocaleRoutes[normalizedOriginalPath] === false
      if (isLocalizationDisabled) {
        mainRoutes.push(page)
        continue
      }

      const allowedLocales = this.getAllowedLocalesForPage(originalPath, pageName)
      const originalChildren = cloneArray(page.children ?? [])

      const pageRoutes: NuxtPage[] = []

      if (isNoPrefixStrategy(this.strategy)) {
        if (customPaths) {
          this.locales.forEach((locale) => {
            const customPath = customPaths[locale.code]
            if (customPath && allowedLocales.includes(locale.code)) {
              const newRoute = this.createLocalizedRoute(page, [locale.code], originalChildren, true, customPath, customRegex, false, locale.code, originalPath)
              if (newRoute) {
                pageRoutes.push(newRoute)
                if (this.noPrefixRedirect && locale.code === this.defaultLocale.code) {
                  page.redirect = normalizePath(customPath)
                }
              }
            }
          })
        }
        this.handleAliasRoutes(page, pageRoutes, customRegex, allowedLocales)
        mainRoutes.push(page, ...pageRoutes)
        continue
      }

      const defaultLocaleCode = this.defaultLocale.code
      let defaultRoute: NuxtPage | null = null
      if (allowedLocales.includes(defaultLocaleCode)) {
        const customPath = customPaths?.[defaultLocaleCode]
        if (isPrefixExceptDefaultStrategy(this.strategy)) {
          const defaultRoutePath = customPath ? normalizePath(customPath) : originalPath
          const defaultRouteChildren = this.createLocalizedChildren(originalChildren, originalPath, [defaultLocaleCode], false, false, false, customPath ? { [defaultLocaleCode]: customPath } : {})
          defaultRoute = { ...page, path: defaultRoutePath, children: defaultRouteChildren }
        }
      }

      const localesToGenerate = this.locales.filter((l) => {
        if (!allowedLocales.includes(l.code)) return false
        if (isPrefixExceptDefaultStrategy(this.strategy) && l.code === defaultLocaleCode) return false
        return true
      })

      if (localesToGenerate.length > 0) {
        if (customPaths) {
          localesToGenerate.forEach((locale) => {
            if (customPaths[locale.code]) {
              if (isPrefixAndDefaultStrategy(this.strategy) && locale.code === defaultLocaleCode) {
                const nonPrefixedRoute = this.createLocalizedRoute(page, [locale.code], originalChildren, true, customPaths[locale.code], customRegex, false, locale.code, originalPath)
                if (nonPrefixedRoute) pageRoutes.push(nonPrefixedRoute)
                const prefixedRoute = this.createLocalizedRoute(page, [locale.code], originalChildren, true, customPaths[locale.code], customRegex, true, locale.code, originalPath)
                if (prefixedRoute) pageRoutes.push(prefixedRoute)
              }
              else {
                const shouldAddPrefix = isPrefixAndDefaultStrategy(this.strategy) && locale.code === defaultLocaleCode
                const newRoute = this.createLocalizedRoute(page, [locale.code], originalChildren, true, customPaths[locale.code], customRegex, shouldAddPrefix, locale.code, originalPath)
                if (newRoute) pageRoutes.push(newRoute)
              }
            }
            else {
              const newRoute = this.createLocalizedRoute(page, [locale.code], originalChildren, false, '', customRegex, false, locale.code, originalPath)
              if (newRoute) pageRoutes.push(newRoute)
            }
          })
        }
        else {
          const localeCodes = localesToGenerate.map(l => l.code)
          const newRoute = this.createLocalizedRoute(page, localeCodes, originalChildren, false, '', customRegex, false, true, originalPath)
          if (newRoute) pageRoutes.push(newRoute)
        }
      }
      this.handleAliasRoutes(page, pageRoutes, customRegex, allowedLocales)

      if (defaultRoute) mainRoutes.push(defaultRoute)
      if (isPrefixAndDefaultStrategy(this.strategy)) mainRoutes.push(page)
      additionalRoutes.push(...pageRoutes)
    }

    if (isPrefixStrategy(this.strategy) && !isCloudflarePages) {
      for (let i = mainRoutes.length - 1; i >= 0; i--) {
        const page = mainRoutes[i]
        if (!page) continue
        const pagePath = page.path ?? ''
        const pageName = page.name ?? ''

        if (isInternalPath(pagePath, this.excludePatterns)) continue

        if (this.globalLocaleRoutes[pageName] === false) continue

        if (!/^\/:locale/.test(pagePath) && pagePath !== '/') {
          mainRoutes.splice(i, 1)
        }
      }
    }

    pages.length = 0
    pages.push(...mainRoutes, ...additionalRoutes)
  }

  public extractLocalizedPaths(
    pages: NuxtPage[],
    parentPath = '',
  ): { [key: string]: { [locale: string]: string } } {
    const localizedPaths: { [key: string]: { [locale: string]: string } } = {}

    pages.forEach((page) => {
      const pageName = buildRouteNameFromRoute(page.name, page.path)
      const normalizedFullPath = normalizePath(path.posix.join(parentPath, page.path))
      const normalizedKey = normalizeRouteKey(normalizedFullPath)

      const globalLocalePath = this.globalLocaleRoutes[normalizedKey] || this.globalLocaleRoutes[pageName]

      if (!globalLocalePath) {
        const filesLocalePath = this.filesLocaleRoutes[pageName]
        if (filesLocalePath && typeof filesLocalePath === 'object') {
          localizedPaths[normalizedFullPath] = filesLocalePath
        }
      }
      else if (typeof globalLocalePath === 'object') {
        localizedPaths[normalizedFullPath] = globalLocalePath
      }

      if (page.children?.length) {
        const parentFullPath = normalizePath(path.posix.join(parentPath, page.path))
        Object.assign(localizedPaths, this.extractLocalizedPaths(page.children, parentFullPath))
      }
    })

    return localizedPaths
  }

  private addCustomGlobalLocalizedRoutes(
    page: NuxtPage,
    customRoutePaths: Record<string, string>,
    additionalRoutes: NuxtPage[],
    customRegex?: string | RegExp,
  ) {
    const normalizedFullPath = normalizePath(page.path)
    const pageName = buildRouteNameFromRoute(page.name, page.path)

    const allowedLocales = this.getAllowedLocalesForPage(normalizedFullPath, pageName)
    const hasRestrictions = this.hasLocaleRestrictions(normalizedFullPath, pageName)

    const localesToUse = hasRestrictions
      ? this.locales.filter(locale => allowedLocales.includes(locale.code))
      : this.locales

    localesToUse.forEach((locale) => {
      const customPath = customRoutePaths[locale.code]

      const isDefaultLocale = isLocaleDefault(locale, this.defaultLocale, isPrefixStrategy(this.strategy) || isPrefixAndDefaultStrategy(this.strategy))

      if (customPath) {
        if (isNoPrefixStrategy(this.strategy)) {
          const newRoute = this.createLocalizedRoute(page, [locale.code], page.children ?? [], true, customPath, customRegex, false, locale.code)
          if (newRoute) {
            additionalRoutes.push(newRoute)
            if (this.noPrefixRedirect) page.redirect = newRoute.path
          }
        }
        else {
          if (isDefaultLocale) {
            page.path = normalizePath(customPath)
          }
          else {
            const newRoute = this.createLocalizedRoute(page, [locale.code], page.children ?? [], true, customPath, customRegex, false, locale.code)
            if (newRoute) additionalRoutes.push(newRoute)
          }
        }
      }
      else {
        const localeCodes = [locale.code]
        const originalChildren = cloneArray(page.children ?? [])

        const newRoute = this.createLocalizedRoute(page, localeCodes, originalChildren, false, '', customRegex, false, locale.code)
        if (newRoute) {
          additionalRoutes.push(newRoute)
        }
      }
    })
  }

  private localizePage(
    page: NuxtPage,
    additionalRoutes: NuxtPage[],
    customRegex?: string | RegExp,
  ) {
    if (isPageRedirectOnly(page)) return

    const originalChildren = cloneArray(page.children ?? [])
    const normalizedFullPath = normalizePath(page.path)
    const pageName = buildRouteNameFromRoute(page.name, page.path)

    const allowedLocales = this.getAllowedLocalesForPage(normalizedFullPath, pageName)
    const hasRestrictions = this.hasLocaleRestrictions(normalizedFullPath, pageName)

    const localeCodesWithoutCustomPaths = this.filterLocaleCodesWithoutCustomPaths(normalizedFullPath)
      .filter(locale => hasRestrictions ? allowedLocales.includes(locale) : true)

    if (localeCodesWithoutCustomPaths.length) {
      const newRoute = this.createLocalizedRoute(page, localeCodesWithoutCustomPaths, originalChildren, false, '', customRegex, false, true)
      if (newRoute) additionalRoutes.push(newRoute)
    }

    this.addCustomLocalizedRoutes(page, normalizedFullPath, originalChildren, additionalRoutes, hasRestrictions ? allowedLocales : undefined)
    this.adjustRouteForDefaultLocale(page, originalChildren)

    this.handleAliasRoutes(page, additionalRoutes, customRegex, hasRestrictions ? allowedLocales : undefined)
  }

  private filterLocaleCodesWithoutCustomPaths(fullPath: string): string[] {
    return this.activeLocaleCodes.filter(code => !this.localizedPaths[fullPath]?.[code])
  }

  private handleAliasRoutes(
    page: NuxtPage,
    additionalRoutes: NuxtPage[],
    customRegex?: string | RegExp,
    allowedLocales?: string[],
  ) {
    const aliasRoutes = (page as NuxtPage & { alias?: string[] }).alias || page.meta?.alias as string[] | undefined
    if (!aliasRoutes || !Array.isArray(aliasRoutes)) {
      return
    }

    const localesToUse = allowedLocales || this.activeLocaleCodes

    aliasRoutes.forEach((aliasPath) => {
      const localizedAliasPath = buildFullPath(localesToUse, aliasPath, customRegex)

      const aliasRoute: NuxtPage = {
        ...page,
        path: localizedAliasPath,
        name: `localized-${page.name ?? ''}`,
        meta: {
          ...page.meta,
          alias: undefined,
        },
        alias: undefined,
      }

      additionalRoutes.push(aliasRoute)
    })
  }

  public adjustRouteForDefaultLocale(page: NuxtPage, originalChildren: NuxtPage[]) {
    if (isNoPrefixStrategy(this.strategy)) {
      return
    }

    if (isPrefixAndDefaultStrategy(this.strategy)) {
      return
    }

    const defaultLocalePath = this.localizedPaths[page.path]?.[this.defaultLocale.code]
    if (defaultLocalePath) {
      page.path = normalizePath(defaultLocalePath)
    }

    if (originalChildren.length) {
      const newName = normalizePath(path.posix.join('/', buildRouteNameFromRoute(page.name, page.path)))

      const currentChildren = page.children ? [...page.children] : []

      const localizedChildren = this.createLocalizedChildren(
        originalChildren,
        newName,
        [this.defaultLocale.code],
        true,
        false,
        false,
      )

      const childrenMap = new Map(currentChildren.map(child => [child.name, child]))

      localizedChildren.forEach((localizedChild) => {
        if (childrenMap.has(localizedChild.name)) {
          const existingChild = childrenMap.get(localizedChild.name)
          if (existingChild) {
            Object.assign(existingChild, localizedChild)
          }
        }
        else {
          currentChildren.push(localizedChild)
        }
      })

      page.children = currentChildren
    }
  }

  private addCustomLocalizedRoutes(
    page: NuxtPage,
    fullPath: string,
    originalChildren: NuxtPage[],
    additionalRoutes: NuxtPage[],
    allowedLocales?: string[],
    customRegex?: string | RegExp,
  ) {
    const localesToUse = allowedLocales
      ? this.locales.filter(locale => allowedLocales.includes(locale.code))
      : this.locales

    localesToUse.forEach((locale) => {
      const customPath = this.localizedPaths[fullPath]?.[locale.code]

      if (!customPath) return

      const isDefaultLocale = isLocaleDefault(locale, this.defaultLocale, isPrefixStrategy(this.strategy) || isNoPrefixStrategy(this.strategy))

      if (isDefaultLocale && isPrefixExceptDefaultStrategy(this.strategy)) {
        page.path = normalizePath(customPath)
        page.children = this.createLocalizedChildren(originalChildren, '', [locale.code], false, false, false, { [locale.code]: customPath })
      }
      else if (isPrefixAndDefaultStrategy(this.strategy) && locale === this.defaultLocale) {
        const nonPrefixedRoute = this.createLocalizedRoute(page, [locale.code], originalChildren, true, customPath, customRegex, false, locale.code)
        if (nonPrefixedRoute) {
          additionalRoutes.push(nonPrefixedRoute)
        }
        const prefixedRoute = this.createLocalizedRoute(page, [locale.code], originalChildren, true, customPath, customRegex, true, locale.code)
        if (prefixedRoute) {
          additionalRoutes.push(prefixedRoute)
        }
      }
      else {
        const shouldAddPrefix = !isDefaultLocale
        const newRoute = this.createLocalizedRoute(page, [locale.code], originalChildren, true, customPath, customRegex, shouldAddPrefix, locale.code)
        if (newRoute) {
          additionalRoutes.push(newRoute)
        }
      }
    })
  }

  private createLocalizedChildren(
    routes: NuxtPage[],
    parentPath: string,
    localeCodes: string[],
    modifyName = true,
    addLocalePrefix = false,
    parentLocale: string | boolean = false,
    localizedParentPaths: Record<string, string> = {},
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
  ): NuxtPage[] {
    const routePath = normalizePath(route.path)
    const fullPath = normalizePath(path.posix.join(parentPath, routePath))

    let customLocalePaths = this.localizedPaths[fullPath] ?? this.localizedPaths[normalizePath(route.path)]

    if (!customLocalePaths && Object.keys(localizedParentPaths).length > 0) {
      const hasLocalizedContext = Object.values(localizedParentPaths).some(path => path && path !== '')
      if (hasLocalizedContext) {
        const originalRoutePath = normalizePath(path.posix.join('/activity-locale', route.path))
        customLocalePaths = this.localizedPaths[originalRoutePath]
      }
    }

    const isCustomLocalized = !!customLocalePaths

    const result: NuxtPage[] = []

    if (!isCustomLocalized) {
      const finalPathForRoute = removeLeadingSlash(routePath)

      const localizedChildren = this.createLocalizedChildren(
        cloneArray(route.children ?? []),
        path.posix.join(parentPath, routePath),
        localeCodes,
        modifyName,
        addLocalePrefix,
        parentLocale,
        localizedParentPaths,
      )

      const newName = this.buildChildRouteName(route.name!, parentLocale)

      result.push({
        ...route,
        name: newName,
        path: finalPathForRoute,
        children: localizedChildren,
      })

      return result
    }

    for (const locale of localeCodes) {
      const parentLocalizedPath = localizedParentPaths?.[locale]
      const hasParentLocalized = !!parentLocalizedPath

      const customPath = customLocalePaths?.[locale]

      let basePath = customPath
        ? normalizePath(customPath)
        : normalizePath(route.path)

      if (hasParentLocalized && parentLocalizedPath) {
        if (customPath) {
          basePath = normalizePath(customPath)
        }
        else {
          basePath = normalizePath(path.posix.join(parentLocalizedPath, route.path))
        }
      }

      const finalRoutePath = shouldAddLocalePrefix(
        locale,
        this.defaultLocale,
        addLocalePrefix,
        isPrefixStrategy(this.strategy),
      )
        ? buildFullPath(locale, basePath)
        : basePath

      const finalPathForRoute = removeLeadingSlash(finalRoutePath)

      const nextParentPath = customPath
        ? normalizePath(customPath)
        : hasParentLocalized
          ? parentLocalizedPath
          : normalizePath(path.posix.join(parentPath, routePath))

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
      )

      const routeName = this.buildLocalizedRouteName(
        buildRouteNameFromRoute(route.name, route.path),
        locale,
        modifyName,
        !!customLocalePaths,
      )

      result.push({
        ...route,
        name: routeName,
        path: finalPathForRoute,
        children: localizedChildren,
      })
    }

    return result
  }

  private buildChildRouteName(baseName: string, parentLocale: string | boolean): string {
    if (parentLocale === true) {
      return `localized-${baseName}`
    }
    if (typeof parentLocale === 'string') {
      return `localized-${baseName}-${parentLocale}`
    }
    return baseName
  }

  private createLocalizedRoute(
    page: NuxtPage,
    localeCodes: string[],
    originalChildren: NuxtPage[],
    isCustom: boolean,
    customPath: string = '',
    customRegex?: string | RegExp,
    force = false,
    parentLocale: string | boolean = false,
    originalPagePath?: string,
  ): NuxtPage | null {
    const routePath = this.buildRoutePath(localeCodes, page.path, encodeURI(customPath), isCustom, customRegex, force)
    const isPrefixAndDefaultWithCustomPath = isPrefixAndDefaultStrategy(this.strategy) && isCustom && customPath
    if (!routePath || (!isPrefixAndDefaultWithCustomPath && routePath === page.path)) return null
    if (localeCodes.length === 0) return null
    const firstLocale = localeCodes[0]
    if (!firstLocale) return null
    const parentPathForChildren = originalPagePath ?? page.path ?? ''
    const routeName = buildRouteName(buildRouteNameFromRoute(page.name ?? '', parentPathForChildren), firstLocale, isCustom)

    return {
      ...page,
      children: this.createLocalizedChildren(originalChildren, parentPathForChildren, localeCodes, true, false, parentLocale, { [firstLocale]: customPath }),
      path: routePath,
      name: routeName,
      alias: [],
      meta: {
        ...page.meta,
        alias: [],
      },
    }
  }

  private buildLocalizedRouteName(baseName: string, locale: string, modifyName: boolean, forceLocaleSuffixOrCustom = false): string {
    if (!modifyName) return baseName

    if (forceLocaleSuffixOrCustom) {
      return `localized-${baseName}-${locale}`
    }

    const shouldAddLocaleSuffix = locale && !isLocaleDefault(locale, this.defaultLocale, isPrefixAndDefaultStrategy(this.strategy))

    return shouldAddLocaleSuffix
      ? `localized-${baseName}-${locale}`
      : `localized-${baseName}`
  }

  private buildRoutePath(
    localeCodes: string[],
    originalPath: string,
    customPath: string,
    isCustom: boolean,
    customRegex?: string | RegExp,
    force = false,
  ): string {
    if (isNoPrefixStrategy(this.strategy)) {
      return buildFullPathNoPrefix(isCustom ? customPath : originalPath)
    }

    if (isCustom) {
      const shouldAddPrefix = force
        || isPrefixStrategy(this.strategy)
        || (isPrefixAndDefaultStrategy(this.strategy) && !localeCodes.includes(this.defaultLocale.code))
        || !localeCodes.includes(this.defaultLocale.code)

      return shouldAddPrefix
        ? buildFullPath(localeCodes, customPath, customRegex)
        : normalizePath(customPath)
    }
    return buildFullPath(localeCodes, originalPath, customRegex)
  }
}
