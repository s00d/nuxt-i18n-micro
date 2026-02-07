import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { isPrefixAndDefaultStrategy, isPrefixStrategy } from '@i18n-micro/core'
import type { GlobalLocaleRoutes, Locale, Strategies } from '@i18n-micro/types'
import type { NuxtPage } from '@nuxt/schema'
import { GeneratorContext } from './core/context'
import type { LocalizedPathsMap } from './core/localized-paths'
import { extractLocalizedPaths as getLocalizedPathsMap } from './core/localized-paths'
import { getStrategy } from './strategies/factory'
import type { LocaleRoutesConfig } from './strategies/types'
import { normalizePath, normalizeRouteKey, removeLeadingSlash, resolveLocales } from './utils'

export interface RouteGeneratorOptions {
  locales: Locale[]
  defaultLocaleCode: string
  strategy: Strategies
  globalLocaleRoutes: GlobalLocaleRoutes
  filesLocaleRoutes?: GlobalLocaleRoutes
  routeLocales?: Record<string, string[]>
  noPrefixRedirect: boolean
  excludePatterns?: (string | RegExp)[]
  localizedRouteNamePrefix?: string
  customRegexMatcher?: string | RegExp
  fallbackRedirectComponentPath?: string
}

export class RouteGenerator {
  locales: Locale[]
  defaultLocale: Locale
  strategy: Strategies
  localizedPaths: LocalizedPathsMap = {}
  activeLocaleCodes: string[]
  globalLocaleRoutes: LocaleRoutesConfig
  rawGlobalLocaleRoutes: GlobalLocaleRoutes
  filesLocaleRoutes: LocaleRoutesConfig
  routeLocales: Record<string, string[]>
  noPrefixRedirect: boolean
  excludePatterns: (string | RegExp)[] | undefined
  localizedRouteNamePrefix: string
  customRegex: string | RegExp | undefined
  fallbackRedirectComponentPath: string | undefined

  constructor(options: RouteGeneratorOptions) {
    const {
      locales,
      defaultLocaleCode,
      strategy,
      globalLocaleRoutes,
      filesLocaleRoutes = {},
      routeLocales = {},
      noPrefixRedirect,
      excludePatterns,
      localizedRouteNamePrefix = 'localized-',
      customRegexMatcher,
      fallbackRedirectComponentPath,
    } = options

    const resolved = resolveLocales(locales, defaultLocaleCode)
    this.locales = resolved.locales
    this.defaultLocale = resolved.defaultLocale
    this.strategy = strategy
    this.noPrefixRedirect = noPrefixRedirect
    this.excludePatterns = excludePatterns
    this.localizedRouteNamePrefix = localizedRouteNamePrefix
    this.customRegex = customRegexMatcher
    this.fallbackRedirectComponentPath = fallbackRedirectComponentPath
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
      } else {
        normalizedGlobalRoutes[newKey] = localePaths as boolean | Record<string, string>
      }
    }
    this.globalLocaleRoutes = normalizedGlobalRoutes
    this.rawGlobalLocaleRoutes = globalLocaleRoutes ?? {}

    this.filesLocaleRoutes = filesLocaleRoutes ?? {}
    this.routeLocales = routeLocales ?? {}
  }

  private computeActiveLocaleCodes(): string[] {
    return this.locales
      .filter((locale) => locale.code !== this.defaultLocale.code || isPrefixAndDefaultStrategy(this.strategy) || isPrefixStrategy(this.strategy))
      .map((locale) => locale.code)
  }

  public extendPages(pages: NuxtPage[]) {
    const ctx = new GeneratorContext({
      locales: this.locales,
      defaultLocaleCode: this.defaultLocale.code,
      strategy: this.strategy,
      globalLocaleRoutes: this.globalLocaleRoutes,
      filesLocaleRoutes: this.filesLocaleRoutes,
      routeLocales: this.routeLocales,
      pages,
      excludePatterns: this.excludePatterns,
      customRegex: this.customRegex,
      noPrefixRedirect: this.noPrefixRedirect,
      localizedRouteNamePrefix: this.localizedRouteNamePrefix,
      fallbackRedirectComponentPath: this.fallbackRedirectComponentPath,
      rawGlobalLocaleRoutes: this.rawGlobalLocaleRoutes,
    })
    this.localizedPaths = ctx.localizedPaths

    const strategyHandler = getStrategy(this.strategy)
    const originalPages = [...pages]
    const newRoutes: NuxtPage[] = []
    for (const page of originalPages) {
      newRoutes.push(...strategyHandler.processPage(page, ctx))
    }
    const finalRoutes = strategyHandler.postProcess(newRoutes, ctx)
    pages.length = 0
    pages.push(...finalRoutes)
  }

  public extractLocalizedPaths(pages: NuxtPage[], parentPath = ''): { [key: string]: { [locale: string]: string } } {
    return getLocalizedPathsMap(pages, this.globalLocaleRoutes, this.filesLocaleRoutes, parentPath)
  }

  /**
   * Creates global and per-page translation JSON files for the current resolved locales.
   */
  public ensureTranslationFilesExist(pagesNames: string[], translationDir: string, rootDir: string, disablePageLocales?: boolean): void {
    this.locales.forEach((locale) => {
      const globalFilePath = path.join(rootDir, translationDir, `${locale.code}.json`)
      this.ensureFileExists(globalFilePath)
      if (!disablePageLocales) {
        pagesNames.forEach((name) => {
          const pageFilePath = path.join(rootDir, translationDir, 'pages', `${name}/${locale.code}.json`)
          this.ensureFileExists(pageFilePath)
        })
      }
    })
  }

  private ensureFileExists(filePath: string): void {
    const fileDir = path.dirname(filePath)
    if (!existsSync(fileDir)) {
      mkdirSync(fileDir, { recursive: true })
    }
    if (!existsSync(filePath)) {
      writeFileSync(filePath, JSON.stringify({}), 'utf-8')
    }
  }

  /**
   * Returns the localized path for a given URL and locale,
   * respecting strategy and globalLocaleRoutes (custom paths).
   * Used by nitro:config and prerender so route rules work with custom paths (e.g. /de/ueber-uns).
   */
  public resolveLocalizedPath(originalPath: string, localeCode: string): string {
    const normalizedPath = normalizeRouteKey(originalPath)
    const pathKey = removeLeadingSlash(normalizedPath) || '/'

    let customPath: string | undefined
    const pathRules = this.globalLocaleRoutes[pathKey]
    const normalizedRules = this.globalLocaleRoutes[normalizedPath]
    if (pathRules && typeof pathRules === 'object' && !Array.isArray(pathRules)) {
      customPath = (pathRules as Record<string, string>)[localeCode]
    } else if (normalizedRules && typeof normalizedRules === 'object' && !Array.isArray(normalizedRules)) {
      customPath = (normalizedRules as Record<string, string>)[localeCode]
    }

    const isCustom = !!customPath
    const basePath = customPath ? normalizePath(customPath) : normalizePath(normalizedPath) || ''

    let shouldPrefix = false
    if (this.strategy === 'no_prefix') {
      shouldPrefix = false
    } else if (this.strategy === 'prefix') {
      shouldPrefix = true
    } else if (this.strategy === 'prefix_and_default') {
      shouldPrefix = true
    } else if (this.strategy === 'prefix_except_default') {
      shouldPrefix = localeCode !== this.defaultLocale.code
    }

    if (localeCode === this.defaultLocale.code && !isCustom && (this.strategy === 'prefix_except_default' || this.strategy === 'no_prefix')) {
      shouldPrefix = false
    }

    if (!shouldPrefix) {
      return normalizePath(basePath) || '/'
    }

    const base = removeLeadingSlash(basePath)
    return base ? normalizePath(`/${localeCode}/${base}`) : `/${localeCode}`
  }

  /**
   * Generates the list of data.json routes for prerender (general + per-page per locale).
   */
  public generateDataRoutes(pages: NuxtPage[], apiBaseUrl: string, disablePageLocales: boolean): string[] {
    const routes: string[] = []
    const pagesNames = pages.map((page) => page.name).filter((name): name is string => typeof name === 'string' && name.length > 0)

    for (const locale of this.locales) {
      routes.push(`/${apiBaseUrl}/general/${locale.code}/data.json`)
      if (!disablePageLocales) {
        for (const name of pagesNames) {
          routes.push(`/${apiBaseUrl}/${name}/${locale.code}/data.json`)
        }
      }
    }
    return routes
  }
}
