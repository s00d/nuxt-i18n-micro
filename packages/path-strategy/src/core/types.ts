import type { Strategies, Locale, I18nRouteParams } from '@i18n-micro/types'

/** Custom path rules: route key -> locale -> path segment. false = unlocalized route. */
export type GlobalLocaleRoutes = Record<string, Record<string, string> | false>

/** Input for localeRoute: path string or route-like object. */
export type RouteInput = string | RouteLike

/** Route-like shape (compatible with vue-router). */
export interface RouteLike {
  name?: string | null
  path?: string
  params?: Record<string, unknown>
  query?: Record<string, unknown>
  hash?: string
  fullPath?: string
}

/** Resolved route (path and fullPath required). */
export interface ResolvedRouteLike extends RouteLike {
  name: string | null
  path: string
  fullPath: string
}

/** Normalized input for resolveLocaleRoute (template method). */
export type NormalizedRouteInput
  = | { kind: 'path', path: string }
    | { kind: 'route', inputName: string | null, sourceRoute: RouteLike, resolved: ResolvedRouteLike }

export interface RouterAdapter {
  hasRoute: (name: string) => boolean
  resolve: (to: RouteLike | string) => ResolvedRouteLike
  getRoutes?: () => unknown[]
}

export interface PathStrategyContext {
  strategy: Strategies
  defaultLocale: string
  locales: Locale[]
  localizedRouteNamePrefix: string
  globalLocaleRoutes?: GlobalLocaleRoutes
  routeLocales?: Record<string, string[]>
  routesLocaleLinks?: Record<string, string>
  includeDefaultLocaleRoute?: boolean
  noPrefixRedirect?: boolean
  debug?: boolean
  router: RouterAdapter
}

export interface SwitchLocaleOptions {
  i18nRouteParams?: I18nRouteParams
}

export interface HreflangTag {
  rel: 'alternate'
  href: string
  hreflang: string
}

export interface SeoAttributes {
  canonical?: string
  hreflangs?: HreflangTag[]
}

export interface PathStrategy {
  /**
   * Returns a route object to navigate to another locale from the current page.
   */
  switchLocaleRoute(
    fromLocale: string,
    toLocale: string,
    route: ResolvedRouteLike,
    options: SwitchLocaleOptions,
  ): RouteLike | string

  /**
   * Localizes the given route (object or string) for the target locale.
   * Always returns RouteLike (path and fullPath set). Analogue of $localeRoute / resolveLocalizedRoute.
   */
  localeRoute(
    targetLocale: string,
    routeOrPath: RouteLike | string,
    currentRoute?: ResolvedRouteLike,
  ): RouteLike

  /**
   * Checks if there is a custom path for the given route in globalLocaleRoutes.
   * Used by redirect logic. Returns a path or null.
   */
  getCanonicalPath(
    route: ResolvedRouteLike,
    targetLocale: string,
  ): string | null

  /**
   * Determines locale from URL path (strategy-specific).
   * Returns locale code or null if path does not contain a locale (e.g. no_prefix).
   */
  resolveLocaleFromPath(path: string): string | null

  /**
   * Tries to determine locale from URL path (first segment).
   * Used for initial state and redirect logic. Base implementation in BasePathStrategy.
   */
  getLocaleFromPath(path: string): string | null

  /**
   * Returns path to redirect to for the given current path and target locale, or null if no redirect needed.
   * Use in middleware: const redirectPath = strategy.getRedirect(to.fullPath, detectedLocale)
   */
  getRedirect(currentPath: string, targetLocale: string): string | null

  /**
   * Returns SEO attributes (canonical, hreflangs) for useHead.
   */
  getSeoAttributes(currentRoute: ResolvedRouteLike): SeoAttributes

  /**
   * Sets the router adapter (e.g. when creating singleton and passing router later).
   */
  setRouter(router: RouterAdapter): void

  getDefaultLocale(): string
  getLocales(): Locale[]
  getStrategy(): Strategies
  getLocalizedRouteNamePrefix(): string
  getGlobalLocaleRoutes(): GlobalLocaleRoutes | undefined
  getRouteLocales(): Record<string, string[]> | undefined
  getRoutesLocaleLinks(): Record<string, string> | undefined
  getNoPrefixRedirect(): boolean | undefined
}
