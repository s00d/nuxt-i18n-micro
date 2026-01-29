import type { NuxtPage } from '@nuxt/schema'
import type { GlobalLocaleRoutes, Locale, Strategies } from '@i18n-micro/types'
import type { LocaleRoutesConfig } from '../strategies/types'
import { isPrefixAndDefaultStrategy, isPrefixStrategy } from '@i18n-micro/core'
import { normalizeRouteKey } from '../utils'
import { extractLocalizedPaths, pathKeyForLocalizedPaths } from './localized-paths'
import type { LocalizedPathsMap } from './localized-paths'

export interface GeneratorContextOptions {
  locales: Locale[]
  defaultLocaleCode: string
  strategy: Strategies
  globalLocaleRoutes: GlobalLocaleRoutes
  filesLocaleRoutes: LocaleRoutesConfig
  routeLocales: Record<string, string[]>
  pages: NuxtPage[]
  excludePatterns?: (string | RegExp)[]
  customRegex?: string | RegExp
  noPrefixRedirect?: boolean
  localizedRouteNamePrefix?: string
  /** Resolved path to the locale-redirect component for prefix strategy fallback route. */
  fallbackRedirectComponentPath?: string
  /** Raw globalLocaleRoutes for fallback route meta (locale-redirect component). */
  rawGlobalLocaleRoutes?: GlobalLocaleRoutes
}

function normalizeGlobalLocaleRoutes(globalLocaleRoutes: GlobalLocaleRoutes): LocaleRoutesConfig {
  const normalized: LocaleRoutesConfig = {}
  if (!globalLocaleRoutes) return normalized

  for (const key in globalLocaleRoutes) {
    const newKey = normalizeRouteKey(key)
    const localePaths = globalLocaleRoutes[key]

    if (typeof localePaths === 'object') {
      const normalizedLocalePaths: Record<string, string> = {}
      for (const locale in localePaths) {
        const customPath = localePaths[locale]
        if (customPath) {
          normalizedLocalePaths[locale] = normalizeRouteKey(customPath)
        }
      }
      normalized[newKey] = normalizedLocalePaths
    }
    else {
      normalized[newKey] = localePaths as false | boolean
    }
  }
  return normalized
}

export class GeneratorContext {
  readonly locales: Locale[]
  readonly defaultLocale: Locale
  readonly strategy: Strategies
  readonly globalLocaleRoutes: LocaleRoutesConfig
  readonly filesLocaleRoutes: LocaleRoutesConfig
  readonly routeLocales: Record<string, string[]>
  readonly localizedPaths: LocalizedPathsMap
  readonly activeLocaleCodes: string[]
  readonly excludePatterns: (string | RegExp)[] | undefined
  readonly customRegex: string | RegExp | undefined
  readonly noPrefixRedirect: boolean
  readonly localizedRouteNamePrefix: string
  readonly fallbackRedirectComponentPath: string | undefined
  readonly rawGlobalLocaleRoutes: GlobalLocaleRoutes | undefined

  constructor(options: GeneratorContextOptions) {
    this.locales = options.locales
    this.defaultLocale = this.findLocaleByCode(options.locales, options.defaultLocaleCode) ?? { code: options.defaultLocaleCode }
    this.strategy = options.strategy
    this.globalLocaleRoutes = normalizeGlobalLocaleRoutes(options.globalLocaleRoutes ?? {})
    this.filesLocaleRoutes = options.filesLocaleRoutes ?? {}
    this.routeLocales = options.routeLocales ?? {}
    this.localizedPaths = extractLocalizedPaths(
      options.pages,
      this.globalLocaleRoutes,
      this.filesLocaleRoutes,
    )
    this.activeLocaleCodes = this.locales
      .filter(
        locale =>
          locale.code !== this.defaultLocale.code
          || isPrefixAndDefaultStrategy(this.strategy)
          || isPrefixStrategy(this.strategy),
      )
      .map(locale => locale.code)
    this.excludePatterns = options.excludePatterns
    this.customRegex = options.customRegex
    this.noPrefixRedirect = options.noPrefixRedirect ?? false
    this.localizedRouteNamePrefix = options.localizedRouteNamePrefix ?? 'localized-'
    this.fallbackRedirectComponentPath = options.fallbackRedirectComponentPath
    this.rawGlobalLocaleRoutes = options.rawGlobalLocaleRoutes
  }

  private findLocaleByCode(locales: Locale[], code: string): Locale | undefined {
    return locales.find(locale => locale.code === code)
  }

  /**
   * Returns the list of locale codes allowed for a page (respecting routeLocales).
   */
  getAllowedLocales(pagePath: string, pageName: string): string[] {
    const allowedLocales = this.routeLocales[pagePath] ?? this.routeLocales[pageName]
    if (allowedLocales?.length) {
      return allowedLocales.filter(locale =>
        this.locales.some(l => l.code === locale),
      )
    }
    return this.locales.map(locale => locale.code)
  }

  /**
   * Returns a custom path for a given locale by original page path, if any.
   */
  getCustomPath(originalPath: string, localeCode: string): string | undefined {
    const key = pathKeyForLocalizedPaths(originalPath)
    const paths = this.localizedPaths[key]
    return paths?.[localeCode]
  }

  /**
   * Returns a map of custom paths (locale → path) for a page by path key or name.
   */
  getCustomPathsForPage(originalPath: string, pageName: string): Record<string, string> | undefined {
    const key = pathKeyForLocalizedPaths(originalPath)
    return this.localizedPaths[key] ?? this.localizedPaths[pageName]
  }

  hasLocaleRestrictions(pagePath: string, pageName: string): boolean {
    return !!(this.routeLocales[pagePath] ?? this.routeLocales[pageName])
  }

  filterLocaleCodesWithoutCustomPaths(fullPath: string): string[] {
    const key = pathKeyForLocalizedPaths(fullPath)
    return this.activeLocaleCodes.filter(code => !this.localizedPaths[key]?.[code])
  }
}
