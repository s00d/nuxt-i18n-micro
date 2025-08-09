import path from 'node:path'
import { readFileSync } from 'node:fs'
import type { NuxtPage } from '@nuxt/schema'
import type { GlobalLocaleRoutes, Locale, Strategies } from 'nuxt-i18n-micro-types'
import { isNoPrefixStrategy, isPrefixAndDefaultStrategy, isPrefixStrategy } from 'nuxt-i18n-micro-core'
import {
  buildFullPath,
  buildFullPathNoPrefix,
  buildRouteName,
  cloneArray,
  extractLocaleRoutes,
  isInternalPath,
  isLocaleDefault,
  isPageRedirectOnly,
  normalizePath,
  removeLeadingSlash,
  shouldAddLocalePrefix,
} from './utils'

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
  noPrefixRedirect: boolean

  constructor(locales: Locale[], defaultLocaleCode: string, strategy: Strategies, globalLocaleRoutes: GlobalLocaleRoutes, noPrefixRedirect: boolean) {
    this.locales = locales
    this.defaultLocale = this.findLocaleByCode(defaultLocaleCode) || { code: defaultLocaleCode }
    this.strategy = strategy
    this.noPrefixRedirect = noPrefixRedirect
    this.activeLocaleCodes = this.computeActiveLocaleCodes()
    this.globalLocaleRoutes = globalLocaleRoutes || {}
  }

  private findLocaleByCode(code: string): Locale | undefined {
    return this.locales.find(locale => locale.code === code)
  }

  private computeActiveLocaleCodes(): string[] {
    return this.locales
      .filter(locale => locale.code !== this.defaultLocale.code || isPrefixAndDefaultStrategy(this.strategy) || isPrefixStrategy(this.strategy))
      .map(locale => locale.code)
  }

  // private isAlreadyLocalized(p: string) {
  //   const codes = this.locales.map(l => l.code).join('|') // en|de|ru…
  //   return p.startsWith('/:locale(') // динамический префикс
  //     || new RegExp(`^/(${codes})(/|$)`).test(p) // статический /de/…
  // }

  public extendPages(pages: NuxtPage[], customRegex?: string | RegExp, isCloudflarePages?: boolean) {
    this.localizedPaths = this.extractLocalizedPaths(pages)

    const additionalRoutes: NuxtPage[] = []

    for (const page of [...pages]) {
      // Skip internal paths during page processing
      if (page.path && isInternalPath(page.path)) {
        continue
      }

      // if (this.isAlreadyLocalized(page.path!)) continue
      if (!page.name && page.file?.endsWith('.vue')) {
        console.warn(`[nuxt-i18n-next] Page name is missing for the file: ${page.file}`)
      }

      const customRoute = this.globalLocaleRoutes[page.name ?? '']

      // If globalLocaleRoutes for this page is false, skip localization
      if (customRoute === false) {
        continue // Страница явно отключена в globalLocaleRoutes
      }

      // Check if the page has custom routes in globalLocaleRoutes
      if (typeof customRoute === 'object' && customRoute !== null) {
        // Add routes based on custom globalLocaleRoutes
        this.addCustomGlobalLocalizedRoutes(page, customRoute, additionalRoutes, customRegex)
      }
      else {
        // Default behavior: localize the page as usual
        this.localizePage(page, additionalRoutes, customRegex)
      }
    }

    if (isPrefixStrategy(this.strategy) && !isCloudflarePages) {
      // remove default routes
      for (let i = pages.length - 1; i >= 0; i--) {
        const page = pages[i]
        const pagePath = page.path ?? ''
        const pageName = page.name ?? ''

        // Skip removal for internal paths
        if (isInternalPath(pagePath)) continue

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
      const globalLocalePath = this.globalLocaleRoutes[pageName]

      if (!globalLocalePath) {
        // Fallback to extracting localized paths from the page file content (existing functionality)
        if (page.file) {
          const fileContent = readFileSync(page.file, 'utf-8')
          const localeRoutes = extractLocaleRoutes(fileContent, page.file)

          if (localeRoutes) {
            const normalizedFullPath = normalizePath(path.posix.join(parentPath, page.path))
            localizedPaths[normalizedFullPath] = localeRoutes
          }
        }
      }
      else if (typeof globalLocalePath === 'object') {
        // Use globalLocaleRoutes if defined
        const normalizedFullPath = normalizePath(path.posix.join(parentPath, page.path))
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
    this.locales.forEach((locale) => {
      const customPath = customRoutePaths[locale.code]

      const isDefaultLocale = isLocaleDefault(locale, this.defaultLocale, isPrefixStrategy(this.strategy) || isPrefixAndDefaultStrategy(this.strategy))

      if (customPath) {
        // Есть кастомный путь для этой локали
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
    const localeCodesWithoutCustomPaths = this.filterLocaleCodesWithoutCustomPaths(normalizedFullPath)

    if (localeCodesWithoutCustomPaths.length) {
      const newRoute = this.createLocalizedRoute(page, localeCodesWithoutCustomPaths, originalChildren, false, '', customRegex, false, true)
      if (newRoute) additionalRoutes.push(newRoute)
    }

    this.addCustomLocalizedRoutes(page, normalizedFullPath, originalChildren, additionalRoutes)
    this.adjustRouteForDefaultLocale(page, originalChildren)
  }

  private filterLocaleCodesWithoutCustomPaths(fullPath: string): string[] {
    return this.activeLocaleCodes.filter(code => !this.localizedPaths[fullPath]?.[code])
  }

  public adjustRouteForDefaultLocale(page: NuxtPage, originalChildren: NuxtPage[]) {
    if (isNoPrefixStrategy(this.strategy)) {
      return
    }

    const defaultLocalePath = this.localizedPaths[page.path]?.[this.defaultLocale.code]
    if (defaultLocalePath) {
      page.path = normalizePath(defaultLocalePath)
    }

    if (originalChildren.length) {
      const newName = normalizePath(path.posix.join('/', buildRouteNameFromRoute(page.name, page.path)))

      // Сохраняем текущих детей (если они есть)
      const currentChildren = page.children ? [...page.children] : []

      // Создаём локализованных детей
      const localizedChildren = this.createLocalizedChildren(
        originalChildren,
        newName,
        [this.defaultLocale.code],
        true,
        false,
        false,
      )

      // Мапа для поиска детей по имени
      const childrenMap = new Map(currentChildren.map(child => [child.name, child]))

      // Объединяем детей
      localizedChildren.forEach((localizedChild) => {
        if (childrenMap.has(localizedChild.name)) {
          // Обновляем существующий элемент
          const existingChild = childrenMap.get(localizedChild.name)
          if (existingChild) {
            Object.assign(existingChild, localizedChild)
          }
        }
        else {
          // Добавляем новый элемент
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
    customRegex?: string | RegExp,
  ) {
    this.locales.forEach((locale) => {
      const customPath = this.localizedPaths[fullPath]?.[locale.code]
      if (!customPath) return

      const isDefaultLocale = isLocaleDefault(locale, this.defaultLocale, isPrefixStrategy(this.strategy) || isNoPrefixStrategy(this.strategy))
      if (isDefaultLocale) {
        page.children = this.createLocalizedChildren(originalChildren, '', [locale.code], false)
      }
      else {
        const newRoute = this.createLocalizedRoute(page, [locale.code], originalChildren, true, customPath, customRegex, false, locale.code)
        if (newRoute) additionalRoutes.push(newRoute)
      }

      if (isPrefixAndDefaultStrategy(this.strategy) && locale === this.defaultLocale) {
        const newRoute = this.createLocalizedRoute(page, [locale.code], originalChildren, true, customPath, customRegex, true, locale.code)
        if (newRoute) additionalRoutes.push(newRoute)
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

    const customLocalePaths = this.localizedPaths[fullPath] ?? this.localizedPaths[normalizePath(route.path)]
    const isCustomLocalized = !!customLocalePaths

    const result: NuxtPage[] = []

    // --- 1. Обычный маршрут без кастомных путей и без локализованного родителя ---
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

    // --- 2. Кастомные локализованные маршруты ---
    for (const locale of localeCodes) {
      const parentLocalizedPath = localizedParentPaths?.[locale]
      const hasParentLocalized = !!parentLocalizedPath

      const customPath = customLocalePaths?.[locale]

      const basePath = customPath
        ? normalizePath(customPath)
        : normalizePath(route.path)

      const finalRoutePath = shouldAddLocalePrefix(
        locale,
        this.defaultLocale,
        addLocalePrefix,
        isPrefixStrategy(this.strategy),
      )
        ? buildFullPath(locale, basePath)
        : basePath

      const isChildRoute = parentPath !== ''
      const finalPathForRoute = isChildRoute && hasParentLocalized
        ? normalizePath(route.path)
        : removeLeadingSlash(finalRoutePath)

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
  ): NuxtPage | null {
    const routePath = this.buildRoutePath(localeCodes, page.path, encodeURI(customPath), isCustom, customRegex, force)
    if (!routePath || routePath == page.path) return null
    const routeName = buildRouteName(buildRouteNameFromRoute(page.name, page.path), localeCodes[0], isCustom)

    return {
      ...page,
      children: this.createLocalizedChildren(originalChildren, page.path, localeCodes, true, false, parentLocale),
      path: routePath,
      name: routeName,
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
      return (force || isPrefixStrategy(this.strategy) || !localeCodes.includes(this.defaultLocale.code))
        ? buildFullPath(localeCodes, customPath, customRegex)
        : normalizePath(customPath)
    }
    return buildFullPath(localeCodes, originalPath, customRegex)
  }
}
