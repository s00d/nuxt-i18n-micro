import type { NuxtPage } from '@nuxt/schema'
import type { GlobalLocaleRoutes, Locale, Strategies } from '@i18n-micro/types'
import type { LocaleRoutesConfig } from '../strategies/types'
import { isPrefixAndDefaultStrategy, isPrefixStrategy } from '@i18n-micro/core'
import { normalizeRouteKey } from '../utils'
import { extractLocalizedPaths, pathKeyForLocalizedPaths } from './localized-paths'
import type { LocalizedPathsMap } from './localized-paths'

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
  readonly isCloudflarePages: boolean
  readonly localizedRouteNamePrefix: string

  constructor(
    locales: Locale[],
    defaultLocaleCode: string,
    strategy: Strategies,
    globalLocaleRoutes: GlobalLocaleRoutes,
    filesLocaleRoutes: LocaleRoutesConfig,
    routeLocales: Record<string, string[]>,
    pages: NuxtPage[],
    options?: { excludePatterns?: (string | RegExp)[], customRegex?: string | RegExp, noPrefixRedirect?: boolean, isCloudflarePages?: boolean, localizedRouteNamePrefix?: string },
  ) {
    this.locales = locales
    this.defaultLocale = this.findLocaleByCode(defaultLocaleCode) ?? { code: defaultLocaleCode }
    this.strategy = strategy
    this.globalLocaleRoutes = normalizeGlobalLocaleRoutes(globalLocaleRoutes ?? {})
    this.filesLocaleRoutes = filesLocaleRoutes ?? {}
    this.routeLocales = routeLocales ?? {}
    this.localizedPaths = extractLocalizedPaths(
      pages,
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
    this.excludePatterns = options?.excludePatterns
    this.customRegex = options?.customRegex
    this.noPrefixRedirect = options?.noPrefixRedirect ?? false
    this.isCloudflarePages = options?.isCloudflarePages ?? false
    this.localizedRouteNamePrefix = options?.localizedRouteNamePrefix ?? 'localized-'
  }

  private findLocaleByCode(code: string): Locale | undefined {
    return this.locales.find(locale => locale.code === code)
  }

  /**
   * Возвращает список кодов локалей, разрешённых для страницы (с учётом routeLocales).
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
   * Возвращает кастомный путь для локали по оригинальному пути страницы или null.
   */
  getCustomPath(originalPath: string, localeCode: string): string | undefined {
    const key = pathKeyForLocalizedPaths(originalPath)
    const paths = this.localizedPaths[key]
    return paths?.[localeCode]
  }

  /**
   * Возвращает карту кастомных путей (locale → path) для страницы по ключу пути или имени.
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
