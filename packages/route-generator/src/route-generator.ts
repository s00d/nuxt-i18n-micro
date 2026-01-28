import type { NuxtPage } from '@nuxt/schema'
import type { GlobalLocaleRoutes, Locale, Strategies } from '@i18n-micro/types'
import { isPrefixAndDefaultStrategy, isPrefixStrategy } from '@i18n-micro/core'
import { normalizeRouteKey } from './utils'
import { GeneratorContext } from './core/context'
import { getStrategy } from './strategies/factory'
import { extractLocalizedPaths as extractLocalizedPathsCore } from './core/localized-paths'
import type { LocaleRoutesConfig } from './strategies/types'
import type { LocalizedPathsMap } from './core/localized-paths'

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
}

export class RouteGenerator {
  locales: Locale[]
  defaultLocale: Locale
  strategy: Strategies
  localizedPaths: LocalizedPathsMap = {}
  activeLocaleCodes: string[]
  globalLocaleRoutes: LocaleRoutesConfig
  filesLocaleRoutes: LocaleRoutesConfig
  routeLocales: Record<string, string[]>
  noPrefixRedirect: boolean
  excludePatterns: (string | RegExp)[] | undefined
  localizedRouteNamePrefix: string

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
    } = options

    this.locales = locales
    this.defaultLocale = this.findLocaleByCode(defaultLocaleCode) || { code: defaultLocaleCode }
    this.strategy = strategy
    this.noPrefixRedirect = noPrefixRedirect
    this.excludePatterns = excludePatterns
    this.localizedRouteNamePrefix = localizedRouteNamePrefix
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

    this.filesLocaleRoutes = filesLocaleRoutes ?? {}
    this.routeLocales = routeLocales ?? {}
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
    const ctx = new GeneratorContext(
      this.locales,
      this.defaultLocale.code,
      this.strategy,
      this.globalLocaleRoutes,
      this.filesLocaleRoutes,
      this.routeLocales,
      pages,
      { excludePatterns: this.excludePatterns, customRegex, noPrefixRedirect: this.noPrefixRedirect, isCloudflarePages, localizedRouteNamePrefix: this.localizedRouteNamePrefix },
    )
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

  public extractLocalizedPaths(
    pages: NuxtPage[],
    parentPath = '',
  ): { [key: string]: { [locale: string]: string } } {
    return extractLocalizedPathsCore(
      pages,
      this.globalLocaleRoutes,
      this.filesLocaleRoutes,
      parentPath,
    )
  }
}
