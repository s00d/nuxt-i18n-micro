import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import type { GlobalLocaleRoutes, Locale, Strategies } from '@i18n-micro/types'
import type { NuxtPage } from '@nuxt/schema'
import { generateRoutes, type LocalizedPaths } from './generate'
import { absolute, removeLeadingSlash, routeKey } from './paths'
import { Rules } from './rules'

export interface RouteGeneratorOptions {
  locales: Locale[]
  defaultLocaleCode: string
  strategy: Strategies
  /** Custom paths by page path or route name, `$defineI18nRoute` ones merged in (config wins). */
  globalLocaleRoutes: GlobalLocaleRoutes
  routeLocales?: Record<string, string[]>
  noPrefixRedirect: boolean
  excludePatterns?: (string | RegExp)[]
  localizedRouteNamePrefix?: string
  customRegexMatcher?: string | RegExp
}

/** Merges locales by code (later entries override) and drops disabled ones. */
function resolveLocales(locales: Locale[], defaultLocaleCode: string): { locales: Locale[]; defaultLocale: Locale } {
  const byCode = new Map<string, Locale>()
  for (const locale of locales) byCode.set(locale.code, { ...byCode.get(locale.code), ...locale })
  const active = [...byCode.values()].filter((locale) => !locale.disabled)
  return { locales: active, defaultLocale: active.find((l) => l.code === defaultLocaleCode) ?? { code: defaultLocaleCode } }
}

export class RouteGenerator {
  readonly locales: Locale[]
  readonly defaultLocale: Locale
  readonly strategy: Strategies
  readonly routeLocales: Record<string, string[]>
  private readonly rules: Rules
  private readonly options: RouteGeneratorOptions
  /** Localized paths of the pages seen by the last extendPages call. */
  private localizedPaths: LocalizedPaths = new Map()

  constructor(options: RouteGeneratorOptions) {
    const resolved = resolveLocales(options.locales, options.defaultLocaleCode)
    this.locales = resolved.locales
    this.defaultLocale = resolved.defaultLocale
    this.strategy = options.strategy
    this.routeLocales = options.routeLocales ?? {}
    this.rules = new Rules(options.globalLocaleRoutes, this.routeLocales, this.locales)
    this.options = options
  }

  /** Replaces `pages` (in place, as Nuxt's `pages:resolved` hook expects) with the localized routes. */
  extendPages(pages: NuxtPage[]): void {
    this.localizedPaths = new Map()
    const routes = generateRoutes(
      pages,
      {
        strategy: this.strategy,
        locales: this.locales.map((l) => l.code),
        defaultLocale: this.defaultLocale.code,
        rules: this.rules,
        namePrefix: this.options.localizedRouteNamePrefix ?? 'localized-',
        customRegex: this.options.customRegexMatcher,
        excludePatterns: this.options.excludePatterns,
        noPrefixRedirect: this.options.noPrefixRedirect,
      },
      this.localizedPaths,
    )
    pages.splice(0, pages.length, ...routes)
  }

  /**
   * URL of a page path in a locale (custom path and prefix applied), for nitro routeRules and
   * prerender: `/about` + `de` -> `/de/ueber-uns`. Paths the pages do not have (wildcards, API
   * routes) only get the prefix.
   */
  resolveLocalizedPath(originalPath: string, localeCode: string): string {
    const key = routeKey(originalPath)
    const localized = this.localizedPaths.get(key)?.[localeCode] ?? this.rules.customPath(originalPath, localeCode) ?? absolute(originalPath)
    const prefixed =
      this.strategy === 'prefix' ||
      this.strategy === 'prefix_and_default' ||
      (this.strategy === 'prefix_except_default' && localeCode !== this.defaultLocale.code)
    if (!prefixed) return absolute(localized)
    const rest = removeLeadingSlash(absolute(localized))
    return rest ? `/${localeCode}/${rest}` : `/${localeCode}`
  }

  /** Creates the global and per-page translation JSON files that do not exist yet. */
  ensureTranslationFilesExist(pagesNames: string[], translationDir: string, rootDir: string, disablePageLocales?: boolean): void {
    for (const locale of this.locales) {
      ensureFile(path.join(rootDir, translationDir, `${locale.code}.json`))
      if (disablePageLocales) continue
      for (const name of pagesNames) ensureFile(path.join(rootDir, translationDir, 'pages', `${name}/${locale.code}.json`))
    }
  }

  /** data.json routes to prerender: index per locale, plus one per named page unless disablePageLocales. */
  generateDataRoutes(pages: NuxtPage[], apiBaseUrl: string, disablePageLocales: boolean): string[] {
    const names = new Set<string>()
    const visit = (list: NuxtPage[]) => {
      for (const page of list) {
        if (page.name) names.add(page.name)
        if (page.children) visit(page.children)
      }
    }
    visit(pages)
    const routes: string[] = []
    for (const locale of this.locales) {
      routes.push(`/${apiBaseUrl}/index/${locale.code}/data.json`)
      if (!disablePageLocales) for (const name of names) routes.push(`/${apiBaseUrl}/${name}/${locale.code}/data.json`)
    }
    return routes
  }
}

function ensureFile(filePath: string): void {
  try {
    mkdirSync(path.dirname(filePath), { recursive: true })
    if (!existsSync(filePath)) writeFileSync(filePath, '{}', 'utf-8')
  } catch {
    // read-only file systems (Docker, serverless): skip
  }
}
