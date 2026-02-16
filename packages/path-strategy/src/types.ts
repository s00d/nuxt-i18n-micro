/**
 * All types for @i18n-micro/path-strategy in one place.
 */
import type { I18nRouteParams, Locale, Strategies } from '@i18n-micro/types'

/** Custom path rules: route key -> locale -> path segment. false = unlocalized route. */
export type GlobalLocaleRoutes = Record<string, Record<string, string> | false | boolean>

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
export type NormalizedRouteInput =
  | { kind: 'path'; path: string }
  | { kind: 'route'; inputName: string | null; sourceRoute: RouteLike; resolved: ResolvedRouteLike }

export interface RouterAdapter {
  hasRoute: (name: string) => boolean
  resolve: (to: RouteLike | string) => ResolvedRouteLike
  getRoutes?: () => unknown[]
}

export interface PathStrategyContext {
  strategy: Strategies
  defaultLocale: string
  locales: Locale[]
  /** Pre-computed locale codes (derived from locales). Set automatically at construction. */
  localeCodes?: readonly string[]
  localizedRouteNamePrefix: string
  globalLocaleRoutes?: GlobalLocaleRoutes
  routeLocales?: Record<string, string[]>
  routesLocaleLinks?: Record<string, string>
  noPrefixRedirect?: boolean
  debug?: boolean
  router: RouterAdapter
  /** Hash mode: locale stored in hash, no prefix in path */
  hashMode?: boolean
  /** When true, all pages use only global translations (no page-specific loading) */
  disablePageLocales?: boolean
  /** Pre-computed: globalLocaleRoutes has at least one entry. Set automatically at construction. */
  _hasGR?: boolean
  /** Pre-computed: routeLocales has at least one entry. Set automatically at construction. */
  _hasRL?: boolean
}

export interface SwitchLocaleOptions {
  i18nRouteParams?: I18nRouteParams
}

export interface PathStrategy {
  switchLocaleRoute(fromLocale: string, toLocale: string, route: ResolvedRouteLike, options: SwitchLocaleOptions): RouteLike | string
  localeRoute(targetLocale: string, routeOrPath: RouteLike | string, currentRoute?: ResolvedRouteLike): RouteLike
  getCanonicalPath(route: ResolvedRouteLike, targetLocale: string): string | null
  resolveLocaleFromPath(path: string): string | null
  getLocaleFromPath(path: string): string | null
  getRedirect(currentPath: string, targetLocale: string): string | null
  shouldReturn404(currentPath: string): string | null
  getClientRedirect(currentPath: string, preferredLocale: string): string | null
  setRouter(router: RouterAdapter): void

  /** Determines current locale from route (considers strategy, hashMode, params, path). */
  getCurrentLocale(route: ResolvedRouteLike, defaultLocaleOverride?: string | null): string
  /** Returns the base route name for translation loading. */
  getPluginRouteName(route: ResolvedRouteLike, locale: string): string
  /** Returns displayName of the current locale, or null. */
  getCurrentLocaleName(route: ResolvedRouteLike, defaultLocaleOverride?: string | null): string | null

  getDefaultLocale(): string
  getLocales(): Locale[]
  getStrategy(): Strategies
  getLocalizedRouteNamePrefix(): string
  getGlobalLocaleRoutes(): GlobalLocaleRoutes | undefined
  getRouteLocales(): Record<string, string[]> | undefined
  getRoutesLocaleLinks(): Record<string, string> | undefined
  getNoPrefixRedirect(): boolean | undefined
  getRouteBaseName(route: RouteLike, locale?: string): string | null
  formatPathForResolve(path: string, fromLocale: string, toLocale: string): string
}
