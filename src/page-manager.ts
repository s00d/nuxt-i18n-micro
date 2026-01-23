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
import { isInternalPath } from './runtime/utils/path-utils'

const buildRouteNameFromRoute = (name: string | null | undefined, path: string | null | undefined) => {
  return name ?? (path ?? '').replace(/[^a-z0-9]/gi, '-').replace(/^-+|-+$/g, '')
}

export class PageManager {
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

    // Normalize all keys and values in globalLocaleRoutes once during initialization
    const normalizedGlobalRoutes: GlobalLocaleRoutes = {}
    for (const key in globalLocaleRoutes) {
      // 1. Normalize key
      const newKey = normalizeRouteKey(key)
      const localePaths = globalLocaleRoutes[key]

      // 2. Check that value is an object with paths, not `false`
      if (typeof localePaths === 'object') {
        const normalizedLocalePaths: { [locale: string]: string } = {}

        // 3. Iterate through each custom path (en, es, etc.)
        for (const locale in localePaths) {
          const customPath = localePaths[locale]
          if (customPath) {
            // 4. NORMALIZE THE CUSTOM PATH ITSELF!
            normalizedLocalePaths[locale] = normalizeRouteKey(customPath)
          }
        }

        // 5. Save object with already normalized paths
        normalizedGlobalRoutes[newKey] = normalizedLocalePaths
      }
      else {
        // Save as is if it's `false`
        normalizedGlobalRoutes[newKey] = localePaths as boolean | Record<string, string>
      }
    }
    // Save already normalized object
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
    // Check if this page has locale restrictions from $defineI18nRoute
    const allowedLocales = this.routeLocales[pagePath] || this.routeLocales[pageName]

    if (allowedLocales && allowedLocales.length > 0) {
      // Filter to only include locales that exist in the configuration
      return allowedLocales.filter(locale =>
        this.locales.some(l => l.code === locale),
      )
    }

    // If no restrictions, return all locale codes (not just active ones)
    // This is important for strategies like 'no_prefix' where we need all locales
    return this.locales.map(locale => locale.code)
  }

  private hasLocaleRestrictions(pagePath: string, pageName: string): boolean {
    // Check if this page has any locale restrictions from $defineI18nRoute
    return !!(this.routeLocales[pagePath] || this.routeLocales[pageName])
  }

  // private isAlreadyLocalized(p: string) {
  //   const codes = this.locales.map(l => l.code).join('|') // en|de|ru…
  //   return p.startsWith('/:locale(') // dynamic prefix
  //     || new RegExp(`^/(${codes})(/|$)`).test(p) // static /de/…
  // }

  public extendPages(pages: NuxtPage[], customRegex?: string | RegExp, isCloudflarePages?: boolean) {
    // Step 1: Merge all custom paths into one object. Global ones have priority
    this.localizedPaths = this.extractLocalizedPaths(pages)

    const additionalRoutes: NuxtPage[] = []
    const originalPagePaths = new Map<NuxtPage, string>()

    for (const page of [...pages]) {
      // Check redirect-only pages at the very beginning
      if (isPageRedirectOnly(page)) {
        continue
      }

      if (page.path && isInternalPath(page.path, this.excludePatterns)) {
        continue
      }

      const originalPath = page.path ?? ''
      originalPagePaths.set(page, originalPath)

      const pageName = buildRouteNameFromRoute(page.name, page.path)
      const normalizedOriginalPath = normalizeRouteKey(originalPath)
      const customPaths = this.localizedPaths[originalPath] || this.localizedPaths[pageName]

      // ======================= FIXED LOGIC =======================

      // Determine if localization is allowed for this page
      // All keys in globalLocaleRoutes are already normalized, normalize page path for lookup
      const isLocalizationDisabled = this.globalLocaleRoutes[pageName] === false
        || this.globalLocaleRoutes[normalizedOriginalPath] === false
      if (isLocalizationDisabled) {
        continue
      }

      const allowedLocales = this.getAllowedLocalesForPage(originalPath, pageName)
      const originalChildren = cloneArray(page.children ?? [])

      // --- Logic for NO_PREFIX ---
      if (isNoPrefixStrategy(this.strategy)) {
        // 1. Original route `page` remains untouched. We don't do anything with it
        // 2. Create ADDITIONAL routes for EACH locale that has a custom path
        if (customPaths) {
          this.locales.forEach((locale) => {
            const customPath = customPaths[locale.code]
            if (customPath && allowedLocales.includes(locale.code)) {
              const newRoute = this.createLocalizedRoute(page, [locale.code], originalChildren, true, customPath, customRegex, false, locale.code, originalPath)
              if (newRoute) {
                additionalRoutes.push(newRoute)
                // If noPrefixRedirect is enabled, set redirect on original page
                if (this.noPrefixRedirect && locale.code === this.defaultLocale.code) {
                  page.redirect = normalizePath(customPath)
                }
              }
            }
          })
        }
        // 3. After this we don't do anything else with this page, as `no_prefix` doesn't create :locale routes
        // We just leave the original route and add custom ones
        // Handle alias routes
        this.handleAliasRoutes(page, additionalRoutes, customRegex, allowedLocales)
        continue // Important! Skip the rest of generation logic for this page
      }

      // --- Old logic for other strategies ---

      // Handle default locale
      const defaultLocaleCode = this.defaultLocale.code
      if (allowedLocales.includes(defaultLocaleCode)) {
        const customPath = customPaths?.[defaultLocaleCode]
        if (isPrefixExceptDefaultStrategy(this.strategy)) {
          if (customPath) {
            page.path = normalizePath(customPath) // Replace path as before
          }
          // Create children for default locale WITHOUT prefix
          page.children = this.createLocalizedChildren(originalChildren, originalPath, [defaultLocaleCode], false, false, false, customPath ? { [defaultLocaleCode]: customPath } : {})
        }
        // For prefix_and_default strategy, don't update the original page path
        // The original page remains with its original path, and we create separate routes for custom paths
      }

      // Create localized routes for ALL other cases
      const localesToGenerate = this.locales.filter((l) => {
        if (!allowedLocales.includes(l.code)) return false // Filter by $defineI18nRoute.locales
        if (isPrefixExceptDefaultStrategy(this.strategy) && l.code === defaultLocaleCode) return false // Exclude default for prefix_except_default
        return true
      })

      if (localesToGenerate.length > 0) {
        // If there are custom paths, create separate routes for each locale
        if (customPaths) {
          localesToGenerate.forEach((locale) => {
            if (customPaths[locale.code]) {
              // For prefix_and_default strategy with default locale, create both prefixed and non-prefixed routes
              if (isPrefixAndDefaultStrategy(this.strategy) && locale.code === defaultLocaleCode) {
                // Create non-prefixed route
                const nonPrefixedRoute = this.createLocalizedRoute(page, [locale.code], originalChildren, true, customPaths[locale.code], customRegex, false, locale.code, originalPath)
                if (nonPrefixedRoute) additionalRoutes.push(nonPrefixedRoute)
                // Create prefixed route
                const prefixedRoute = this.createLocalizedRoute(page, [locale.code], originalChildren, true, customPaths[locale.code], customRegex, true, locale.code, originalPath)
                if (prefixedRoute) additionalRoutes.push(prefixedRoute)
              }
              else {
                // For other locales or strategies
                const shouldAddPrefix = isPrefixAndDefaultStrategy(this.strategy) && locale.code === defaultLocaleCode
                const newRoute = this.createLocalizedRoute(page, [locale.code], originalChildren, true, customPaths[locale.code], customRegex, shouldAddPrefix, locale.code, originalPath)
                if (newRoute) additionalRoutes.push(newRoute)
              }
            }
            else {
              // Fallback if there's no custom path for some locale
              const newRoute = this.createLocalizedRoute(page, [locale.code], originalChildren, false, '', customRegex, false, locale.code, originalPath)
              if (newRoute) additionalRoutes.push(newRoute)
            }
          })
        }
        else {
          // If there are no custom paths, create one multi-locale route
          const localeCodes = localesToGenerate.map(l => l.code)
          const newRoute = this.createLocalizedRoute(page, localeCodes, originalChildren, false, '', customRegex, false, true, originalPath)
          if (newRoute) additionalRoutes.push(newRoute)
        }
      }
      this.handleAliasRoutes(page, additionalRoutes, customRegex, allowedLocales)
    }

    if (isPrefixStrategy(this.strategy) && !isCloudflarePages) {
      // remove default routes
      for (let i = pages.length - 1; i >= 0; i--) {
        const page = pages[i]
        if (!page) continue
        const pagePath = page.path ?? ''
        const pageName = page.name ?? ''

        // Skip removal for internal paths
        if (isInternalPath(pagePath, this.excludePatterns)) continue

        if (this.globalLocaleRoutes[pageName] === false) continue

        if (!/^\/:locale/.test(pagePath) && pagePath !== '/') {
          pages.splice(i, 1)
        }
      }
    }

    pages.push(...additionalRoutes)
  }

  public extractLocalizedPaths(
    pages: NuxtPage[],
    parentPath = '',
  ): { [key: string]: { [locale: string]: string } } {
    const localizedPaths: { [key: string]: { [locale: string]: string } } = {}

    pages.forEach((page) => {
      const pageName = buildRouteNameFromRoute(page.name, page.path)
      const normalizedFullPath = normalizePath(path.posix.join(parentPath, page.path))
      // Normalize path for lookup in already normalized globalLocaleRoutes
      const normalizedKey = normalizeRouteKey(normalizedFullPath)

      // Now all keys in globalLocaleRoutes are already normalized, just search by normalized path
      const globalLocalePath = this.globalLocaleRoutes[normalizedKey] || this.globalLocaleRoutes[pageName]

      if (!globalLocalePath) {
        // Fallback to filesLocaleRoutes
        const filesLocalePath = this.filesLocaleRoutes[pageName]
        if (filesLocalePath && typeof filesLocalePath === 'object') {
          localizedPaths[normalizedFullPath] = filesLocalePath
        }
      }
      else if (typeof globalLocalePath === 'object') {
        // Use globalLocaleRoutes if defined
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

    // Get allowed locales for this page from $defineI18nRoute
    const allowedLocales = this.getAllowedLocalesForPage(normalizedFullPath, pageName)
    const hasRestrictions = this.hasLocaleRestrictions(normalizedFullPath, pageName)

    // For globalLocaleRoutes, we need to check if there are any locale restrictions
    // If there are restrictions, filter locales; otherwise use all locales
    const localesToUse = hasRestrictions
      ? this.locales.filter(locale => allowedLocales.includes(locale.code))
      : this.locales

    localesToUse.forEach((locale) => {
      const customPath = customRoutePaths[locale.code]

      const isDefaultLocale = isLocaleDefault(locale, this.defaultLocale, isPrefixStrategy(this.strategy) || isPrefixAndDefaultStrategy(this.strategy))

      if (customPath) {
        // There's a custom path for this locale
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

    // Get allowed locales for this page from $defineI18nRoute
    const allowedLocales = this.getAllowedLocalesForPage(normalizedFullPath, pageName)
    const hasRestrictions = this.hasLocaleRestrictions(normalizedFullPath, pageName)

    // Filter locale codes to only include allowed ones if there are restrictions
    const localeCodesWithoutCustomPaths = this.filterLocaleCodesWithoutCustomPaths(normalizedFullPath)
      .filter(locale => hasRestrictions ? allowedLocales.includes(locale) : true)

    if (localeCodesWithoutCustomPaths.length) {
      const newRoute = this.createLocalizedRoute(page, localeCodesWithoutCustomPaths, originalChildren, false, '', customRegex, false, true)
      if (newRoute) additionalRoutes.push(newRoute)
    }

    this.addCustomLocalizedRoutes(page, normalizedFullPath, originalChildren, additionalRoutes, hasRestrictions ? allowedLocales : undefined)
    this.adjustRouteForDefaultLocale(page, originalChildren)

    // Handle alias routes - create localized versions for each alias
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
    // Check if the page has alias routes defined in page.alias or page.meta.alias
    const aliasRoutes = (page as NuxtPage & { alias?: string[] }).alias || page.meta?.alias as string[] | undefined
    if (!aliasRoutes || !Array.isArray(aliasRoutes)) {
      return
    }

    // Use allowed locales if provided, otherwise use all active locale codes
    const localesToUse = allowedLocales || this.activeLocaleCodes

    // Create localized versions for each alias route using a single route with locale parameter
    aliasRoutes.forEach((aliasPath) => {
      // Build the localized alias path with locale parameter using buildFullPath
      const localizedAliasPath = buildFullPath(localesToUse, aliasPath, customRegex)

      // Create a single route for all locales
      const aliasRoute: NuxtPage = {
        ...page,
        path: localizedAliasPath,
        name: `localized-${page.name ?? ''}`,
        meta: {
          ...page.meta,
          alias: undefined, // Remove alias to prevent infinite recursion
        },
        alias: undefined, // Remove alias from root to prevent infinite recursion
      }

      // Add the localized alias route
      additionalRoutes.push(aliasRoute)
    })
  }

  public adjustRouteForDefaultLocale(page: NuxtPage, originalChildren: NuxtPage[]) {
    if (isNoPrefixStrategy(this.strategy)) {
      return
    }

    // For prefix_and_default strategy, don't adjust the original page path
    // because we create separate routes for default locale in addCustomLocalizedRoutes
    if (isPrefixAndDefaultStrategy(this.strategy)) {
      return
    }

    const defaultLocalePath = this.localizedPaths[page.path]?.[this.defaultLocale.code]
    if (defaultLocalePath) {
      page.path = normalizePath(defaultLocalePath)
    }

    if (originalChildren.length) {
      const newName = normalizePath(path.posix.join('/', buildRouteNameFromRoute(page.name, page.path)))

      // Save current children (if they exist)
      const currentChildren = page.children ? [...page.children] : []

      // Create localized children
      const localizedChildren = this.createLocalizedChildren(
        originalChildren,
        newName,
        [this.defaultLocale.code],
        true,
        false,
        false,
      )

      // Map for finding children by name
      const childrenMap = new Map(currentChildren.map(child => [child.name, child]))

      // Merge children
      localizedChildren.forEach((localizedChild) => {
        if (childrenMap.has(localizedChild.name)) {
          // Update existing element
          const existingChild = childrenMap.get(localizedChild.name)
          if (existingChild) {
            Object.assign(existingChild, localizedChild)
          }
        }
        else {
          // Add new element
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
    // Use allowed locales if provided, otherwise use all locales
    const localesToUse = allowedLocales
      ? this.locales.filter(locale => allowedLocales.includes(locale.code))
      : this.locales

    localesToUse.forEach((locale) => {
      const customPath = this.localizedPaths[fullPath]?.[locale.code]

      if (!customPath) return

      const isDefaultLocale = isLocaleDefault(locale, this.defaultLocale, isPrefixStrategy(this.strategy) || isNoPrefixStrategy(this.strategy))

      // For custom paths from $defineI18nRoute, we need to handle them differently
      if (isDefaultLocale && isPrefixExceptDefaultStrategy(this.strategy)) {
        // For default locale with custom path in prefix_except_default strategy, update the page path directly
        page.path = normalizePath(customPath)
        page.children = this.createLocalizedChildren(originalChildren, '', [locale.code], false, false, false, { [locale.code]: customPath })
      }
      else if (isPrefixAndDefaultStrategy(this.strategy) && locale === this.defaultLocale) {
        // For prefix_and_default strategy with default locale, create both prefixed and non-prefixed routes
        // First, create non-prefixed route
        const nonPrefixedRoute = this.createLocalizedRoute(page, [locale.code], originalChildren, true, customPath, customRegex, false, locale.code)
        if (nonPrefixedRoute) {
          additionalRoutes.push(nonPrefixedRoute)
        }
        // Then, create prefixed route
        const prefixedRoute = this.createLocalizedRoute(page, [locale.code], originalChildren, true, customPath, customRegex, true, locale.code)
        if (prefixedRoute) {
          additionalRoutes.push(prefixedRoute)
        }
      }
      else {
        // For non-default locales or other strategies, create a new route with locale prefix
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

    // Try to find custom locale paths for this route
    let customLocalePaths = this.localizedPaths[fullPath] ?? this.localizedPaths[normalizePath(route.path)]

    // If we have localized parent paths, try to find custom paths for child routes
    // But only if the parent path indicates we're in a localized context
    if (!customLocalePaths && Object.keys(localizedParentPaths).length > 0) {
      // Check if we're in a localized context (parent path contains localized paths)
      const hasLocalizedContext = Object.values(localizedParentPaths).some(path => path && path !== '')
      if (hasLocalizedContext) {
        // Try to find custom paths for the original route path
        const originalRoutePath = normalizePath(path.posix.join('/activity-locale', route.path))
        customLocalePaths = this.localizedPaths[originalRoutePath]
      }
    }

    const isCustomLocalized = !!customLocalePaths

    const result: NuxtPage[] = []

    // --- 1. Regular route without custom paths and without localized parent ---
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

    // --- 2. Custom localized routes ---
    for (const locale of localeCodes) {
      const parentLocalizedPath = localizedParentPaths?.[locale]
      const hasParentLocalized = !!parentLocalizedPath

      const customPath = customLocalePaths?.[locale]

      let basePath = customPath
        ? normalizePath(customPath)
        : normalizePath(route.path)

      // If we have a parent localized path, we need to combine it with the custom path
      if (hasParentLocalized && parentLocalizedPath) {
        if (customPath) {
          // If we have both parent and custom paths, use the custom path as is
          // The custom path should already be the full localized path
          basePath = normalizePath(customPath)
        }
        else {
          // If we only have parent path, use it as base
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
    // For prefix_and_default strategy, allow creating routes even if path matches original page path
    // because we need both prefixed and non-prefixed routes for default locale
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
      alias: [], // remove alias to prevent infinite recursion
      meta: {
        ...page.meta,
        alias: [], // remove alias to prevent infinite recursion
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
      // For prefix_and_default strategy, non-default locales should always have prefix
      // For default locale in prefix_and_default, prefix is added only when force=true
      // For other strategies, add prefix if force is true, or if it's prefix strategy, or if locale is not default
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
