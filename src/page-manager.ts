import path from 'node:path'
import { readFileSync } from 'node:fs'
import type { NuxtPage } from '@nuxt/schema'
import type { GlobalLocaleRoutes, Locale, Strategies } from 'nuxt-i18n-micro-types'
import { isPrefixAndDefaultStrategy, isPrefixStrategy, isNoPrefixStrategy } from 'nuxt-i18n-micro-core'
import {
  normalizePath,
  isLocaleDefault,
  isPageRedirectOnly,
  cloneArray,
  buildRouteName,
  shouldAddLocalePrefix,
  buildFullPath,
  removeLeadingSlash,
  extractLocaleRoutes,
  buildFullPathNoPrefix,
} from './utils'

const buildRouteNameFromRoute = (name: string | null | undefined, path: string | null | undefined) => {
  return name ?? (path ?? '').replace(/[^a-z0-9]/gi, '-').replace(/^-+|-+$/g, '')
}

// Класс PageManager
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

  public extendPages(pages: NuxtPage[], customRegex?: string | RegExp, isCloudflarePages?: boolean) {
    this.localizedPaths = this.extractLocalizedPaths(pages)

    const additionalRoutes: NuxtPage[] = []
    pages.forEach((page) => {
      if (!page.name) {
        console.warn(`[nuxt-i18n-next] Page name is missing for the file: ${page.file}`)
      }
      const customRoute = this.globalLocaleRoutes[page.name ?? ''] ?? null

      // If globalLocaleRoutes for this page is false, skip localization
      if (customRoute === false) {
        return
      }

      // Check if the page has custom routes in globalLocaleRoutes
      if (customRoute && typeof customRoute === 'object') {
        // Add routes based on custom globalLocaleRoutes
        this.addCustomGlobalLocalizedRoutes(page, customRoute, additionalRoutes, customRegex)
      }
      else {
        // Default behavior: localize the page as usual
        this.localizePage(page, additionalRoutes, customRegex)
      }
    })

    // remove default routes
    if (isPrefixStrategy(this.strategy) && !isCloudflarePages) {
      for (let i = pages.length - 1; i >= 0; i--) {
        const page = pages[i]
        const pagePath = page.path ?? ''
        const pageName = page.name ?? ''

        if (this.globalLocaleRoutes[pageName] === false) continue

        // Удаляем страницы, если они не начинаются с /:locale и не являются корневыми
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
      if (!customPath) return

      const isDefaultLocale = isLocaleDefault(locale, this.defaultLocale, isPrefixStrategy(this.strategy))

      if (isNoPrefixStrategy(this.strategy)) {
        // Для стратегии без префикса, создаем отдельные страницы для каждой локали без префикса
        const newRoute = this.createLocalizedRoute(page, [locale.code], page.children ?? [], true, customPath, customRegex)
        if (newRoute) {
          additionalRoutes.push(newRoute)
          if (this.noPrefixRedirect && isNoPrefixStrategy(this.strategy)) page.redirect = newRoute.path
        }
      }
      else {
        if (isDefaultLocale) {
          // Modify the page path if it's the default locale
          page.path = normalizePath(customPath)
        }
        else {
          // Create a new localized route for this locale
          const newRoute = this.createLocalizedRoute(page, [locale.code], page.children ?? [], true, customPath, customRegex)
          if (newRoute) additionalRoutes.push(newRoute)
        }

        if (isPrefixAndDefaultStrategy(this.strategy) && locale === this.defaultLocale) {
          const newRoute = this.createLocalizedRoute(page, [locale.code], page.children ?? [], true, customPath, customRegex, true)
          if (newRoute) additionalRoutes.push(newRoute)
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
      const newRoute = this.createLocalizedRoute(page, localeCodesWithoutCustomPaths, originalChildren, false, '', customRegex)
      if (newRoute) additionalRoutes.push(newRoute)
    }

    this.addCustomLocalizedRoutes(page, normalizedFullPath, originalChildren, additionalRoutes)
    this.adjustRouteForDefaultLocale(page, originalChildren)
  }

  private filterLocaleCodesWithoutCustomPaths(fullPath: string): string[] {
    return this.activeLocaleCodes.filter(code => !this.localizedPaths[fullPath]?.[code])
  }

  adjustRouteForDefaultLocale(page: NuxtPage, originalChildren: NuxtPage[]) {
    if (isNoPrefixStrategy(this.strategy)) {
      return
    }
    const defaultLocalePath = this.localizedPaths[page.path]?.[this.defaultLocale.code]
    if (defaultLocalePath) {
      page.path = normalizePath(defaultLocalePath)
    }

    // Создаем копию текущих детей
    const currentChildren = page.children ? [...page.children] : []

    if (originalChildren.length) {
      const newName = normalizePath(path.posix.join('/', buildRouteNameFromRoute(page.name, page.path)))
      const localizedChildren = this.mergeChildren(originalChildren, newName, [this.defaultLocale.code])

      // Мапа для поиска детей по имени
      const childrenMap = new Map(currentChildren.map(child => [child.name, child]))

      localizedChildren.forEach((localizedChild) => {
        if (childrenMap.has(localizedChild.name)) {
          // Обновляем существующий элемент, используя объект из Map
          const existingChild = childrenMap.get(localizedChild.name)
          if (existingChild) {
            Object.assign(existingChild, localizedChild)
          }
        }
        else {
          // Добавляем новый элемент, если его нет
          currentChildren.push(localizedChild)
        }
      })

      // Присваиваем обновленный массив детей обратно в page.children
      page.children = currentChildren
    }
  }

  private mergeChildren(
    originalChildren: NuxtPage[],
    parentPath: string,
    localeCodes: string[],
  ): NuxtPage[] {
    const localizedChildren = this.createLocalizedChildren(originalChildren, parentPath, localeCodes, false)
    return [...originalChildren, ...localizedChildren]
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
        const newRoute = this.createLocalizedRoute(page, [locale.code], originalChildren, true, customPath, customRegex)
        if (newRoute) additionalRoutes.push(newRoute)
      }

      if (isPrefixAndDefaultStrategy(this.strategy) && locale === this.defaultLocale) {
        const newRoute = this.createLocalizedRoute(page, [locale.code], originalChildren, true, customPath, customRegex, true)
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
    parentIsLocalized = false,
    localizedParentPaths: Record<string, string> = {},
  ): NuxtPage[] {
    return routes.flatMap(route =>
      this.createLocalizedVariants(
        route,
        parentPath,
        localeCodes,
        modifyName,
        addLocalePrefix,
        parentIsLocalized,
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
    parentIsLocalized: boolean,
    localizedParentPaths: Record<string, string>,
  ): NuxtPage[] {
    const routePath = normalizePath(route.path)

    const isDynamic = routePath.startsWith(':')
    const fullPath = normalizePath(path.posix.join(parentPath, routePath))
    const customLocalePaths = this.localizedPaths[fullPath]

    if (isDynamic && !customLocalePaths) {
      // Если динамический маршрут без кастомных путей — создаем один общий
      const localizedChildren = this.createLocalizedChildren(
        route.children ?? [],
        fullPath,
        localeCodes,
        modifyName,
        addLocalePrefix,
        true,
        localizedParentPaths,
      )

      const baseName = buildRouteNameFromRoute(route.name, route.path)

      return [
        {
          ...route,
          name: modifyName ? `localized-${baseName}` : baseName,
          path: removeLeadingSlash(routePath),
          children: localizedChildren,
        },
      ]
    }

    // обычный случай — размножаем по локалям
    const result: NuxtPage[] = []

    for (const locale of localeCodes) {
      const parentPathLocalized = localizedParentPaths[locale] || parentPath
      const fullPath = normalizePath(path.posix.join(parentPathLocalized, routePath))

      const localizedChildren = this.createLocalizedChildren(
        route.children ?? [],
        fullPath,
        [locale],
        modifyName,
        addLocalePrefix,
        true,
        localizedParentPaths,
      )

      const routeName = this.buildLocalizedRouteName(
        buildRouteNameFromRoute(route.name, route.path),
        locale,
        modifyName,
        parentIsLocalized || !!customLocalePaths,
      )

      const finalPath = this.buildLocalizedRoutePath(
        routePath,
        locale,
        customLocalePaths,
        addLocalePrefix,
      )

      result.push({
        ...route,
        name: routeName,
        path: removeLeadingSlash(finalPath),
        children: localizedChildren,
      })
    }

    return result
  }

  private createLocalizedRoute(
    page: NuxtPage,
    localeCodes: string[],
    originalChildren: NuxtPage[],
    isCustom: boolean,
    customPath: string = '',
    customRegex?: string | RegExp,
    force = false,
  ): NuxtPage | null {
    const routePath = this.buildRoutePath(localeCodes, page.path, encodeURI(customPath), isCustom, customRegex, force)
    if (!routePath || routePath == page.path) return null
    const routeName = buildRouteName(buildRouteNameFromRoute(page.name, page.path), localeCodes[0], isCustom)

    return {
      ...page,
      children: this.createLocalizedChildren(originalChildren, page.path, localeCodes, true, false, true),
      path: routePath,
      name: routeName,
    }
  }

  private buildLocalizedRoutePath(
    routePath: string,
    locale: string,
    customLocalePaths: { [locale: string]: string } | undefined,
    addLocalePrefix: boolean,
  ): string {
    const basePath = customLocalePaths?.[locale] || routePath
    const normalizedBasePath = encodeURI(normalizePath(basePath))

    return shouldAddLocalePrefix(locale, this.defaultLocale, addLocalePrefix, isPrefixStrategy(this.strategy))
      ? buildFullPath(locale, normalizedBasePath)
      : normalizedBasePath
  }

  private buildLocalizedRouteName(baseName: string, locale: string, modifyName: boolean, forceLocaleSuffix = false): string {
    if (!modifyName) {
      return baseName
    }

    if (forceLocaleSuffix) {
      return `localized-${baseName}-${locale}`
    }

    const shouldAddLocaleSuffix
      = locale && !isLocaleDefault(locale, this.defaultLocale, isPrefixStrategy(this.strategy) || isPrefixAndDefaultStrategy(this.strategy))

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

    // Используем стандартный метод для стратегий с префиксом
    if (isCustom) {
      return (force || isPrefixStrategy(this.strategy) || !localeCodes.includes(this.defaultLocale.code))
        ? buildFullPath(localeCodes, customPath, customRegex)
        : normalizePath(customPath)
    }
    return buildFullPath(localeCodes, originalPath, customRegex)
  }
}
