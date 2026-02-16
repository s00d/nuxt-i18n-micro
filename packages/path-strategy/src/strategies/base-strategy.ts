/**
 * BasePathStrategy — lean abstract base for all path strategies.
 * No RouteResolver class — uses pure functions from ../resolver.
 */
import type { Locale } from '@i18n-micro/types'
import {
  buildCanonicalFromSegment,
  detectLocaleFromName as helperDetectLocaleFromName,
  getCurrentLocale as helperGetCurrentLocale,
  getCurrentLocaleName as helperGetCurrentLocaleName,
  getPluginRouteName as helperGetPluginRouteName,
  shouldReturn404 as helperShouldReturn404,
} from '../helpers'
import {
  buildUrl,
  hasKeys,
  hasProtocol,
  joinUrl,
  normalizePath,
  getLocaleFromPath as normalizerGetLocaleFromPath,
  getPathWithoutLocale as normalizerGetPathWithoutLocale,
  withoutTrailingSlash,
} from '../path'
import {
  isIndexRouteName,
  resolveCustomPath,
  resolvePathForLocale as resolverResolvePathForLocale,
  buildLocalizedName as utilBuildLocalizedName,
  getRouteBaseName as utilGetRouteBaseName,
} from '../resolver'
import type {
  NormalizedRouteInput,
  PathStrategy,
  PathStrategyContext,
  ResolvedRouteLike,
  RouteLike,
  RouterAdapter,
  SwitchLocaleOptions,
} from '../types'

export abstract class BasePathStrategy implements PathStrategy {
  readonly ctx: PathStrategyContext

  constructor(ctx: PathStrategyContext) {
    if (!ctx.localeCodes) ctx.localeCodes = ctx.locales.map((l) => l.code)
    if (ctx._hasGR === undefined) ctx._hasGR = hasKeys(ctx.globalLocaleRoutes as Record<string, unknown> | undefined)
    if (ctx._hasRL === undefined) ctx._hasRL = hasKeys(ctx.routeLocales as Record<string, unknown> | undefined)
    this.ctx = ctx
  }

  // --- Getters (interface) ---

  setRouter(router: RouterAdapter): void {
    this.ctx.router = router
  }
  getDefaultLocale(): string {
    return this.ctx.defaultLocale
  }
  getLocales(): Locale[] {
    return this.ctx.locales
  }
  getStrategy(): PathStrategyContext['strategy'] {
    return this.ctx.strategy
  }
  getLocalizedRouteNamePrefix(): string {
    return this.ctx.localizedRouteNamePrefix || 'localized-'
  }
  getGlobalLocaleRoutes(): PathStrategyContext['globalLocaleRoutes'] {
    return this.ctx.globalLocaleRoutes
  }
  getRouteLocales(): PathStrategyContext['routeLocales'] {
    return this.ctx.routeLocales
  }
  getRoutesLocaleLinks(): PathStrategyContext['routesLocaleLinks'] {
    return this.ctx.routesLocaleLinks
  }
  getNoPrefixRedirect(): boolean | undefined {
    return this.ctx.noPrefixRedirect
  }

  // --- Route name helpers ---

  getRouteBaseName(route: RouteLike, locale?: string): string | null {
    const locales = locale ? [{ code: locale }] : this.ctx.locales
    return utilGetRouteBaseName(route, { locales, localizedRouteNamePrefix: this.getLocalizedRouteNamePrefix() })
  }

  getBaseRouteName(route: RouteLike, locale: string): string | null {
    return this.getRouteBaseName(route, locale)
  }

  buildLocalizedName(baseName: string, locale: string): string {
    return utilBuildLocalizedName(baseName, locale, this.getLocalizedRouteNamePrefix())
  }

  // --- Default implementations (overridable) ---

  buildLocalizedRouteName(baseName: string, locale: string): string {
    return this.buildLocalizedName(baseName, locale)
  }

  resolveLocaleFromPath(path: string): string | null {
    const { localeFromPath } = this.getPathWithoutLocale(path)
    return localeFromPath
  }

  detectLocaleFromName(name: string | null): string | null {
    return helperDetectLocaleFromName(name, this.ctx.locales)
  }

  // --- Abstract (strategy-specific) ---

  abstract switchLocaleRoute(fromLocale: string, toLocale: string, route: ResolvedRouteLike, options: SwitchLocaleOptions): RouteLike | string
  abstract resolveLocaleRoute(targetLocale: string, normalized: NormalizedRouteInput, _currentRoute?: ResolvedRouteLike): RouteLike | string
  abstract getRedirect(currentPath: string, targetLocale: string): string | null
  abstract getClientRedirect(currentPath: string, preferredLocale: string): string | null

  // --- Default implementations (overridable by strategies) ---

  buildLocalizedPath(path: string, locale: string, _isCustom: boolean): string {
    return joinUrl(locale, normalizePath(path))
  }

  formatPathForResolve(path: string, fromLocale: string, _toLocale: string): string {
    return `/${fromLocale}${path}`
  }

  // --- Core helpers (use pure resolver functions) ---

  resolvePathForLocale(path: string, targetLocale: string): string {
    return resolverResolvePathForLocale(this.ctx, path, targetLocale)
  }

  getPathWithoutLocale(path: string): { pathWithoutLocale: string; localeFromPath: string | null } {
    return normalizerGetPathWithoutLocale(path, this.ctx.localeCodes!)
  }

  getLocaleFromPath(path: string): string | null {
    return normalizerGetLocaleFromPath(path, this.ctx.localeCodes!)
  }

  getCanonicalPath(route: ResolvedRouteLike, targetLocale: string): string | null {
    return buildCanonicalFromSegment(resolveCustomPath(this.ctx, route, targetLocale) ?? '', targetLocale)
  }

  applyBaseUrl(localeCode: string, route: RouteLike | string): RouteLike | string {
    if (typeof route === 'string') {
      if (hasProtocol(route)) return route
    } else if (route.path && hasProtocol(route.path)) {
      return route
    }

    const locale = this.ctx.locales.find((l) => l.code === localeCode)
    if (!locale?.baseUrl) return route

    const baseUrl = withoutTrailingSlash(locale.baseUrl)

    if (typeof route === 'string') {
      return joinUrl(baseUrl, normalizePath(route.charCodeAt(0) === 47 ? route : `/${route}`))
    }

    const fullPath = joinUrl(baseUrl, normalizePath(route.path || ''))
    if (hasProtocol(fullPath)) return fullPath
    return { ...route, path: fullPath, fullPath }
  }

  getSwitchLocaleFallbackWhenNoRoute(route: ResolvedRouteLike, targetName: string): RouteLike | string {
    return { ...route, name: targetName }
  }

  // --- localeRoute template method ---

  localeRoute(targetLocale: string, routeOrPath: RouteLike | string, currentRoute?: ResolvedRouteLike): RouteLike {
    const normalized = this._normalizeRouteInput(routeOrPath, currentRoute)
    const raw = this.resolveLocaleRoute(targetLocale, normalized, currentRoute)
    return this._ensureRouteLike(raw, normalized.kind === 'route' ? normalized.sourceRoute : undefined)
  }

  _ensureRouteLike(value: RouteLike | string, source?: RouteLike | null): RouteLike {
    if (typeof value === 'string') {
      const path = value
      const fullPath = source?.query || source?.hash ? buildUrl(path, source?.query, source?.hash) : path
      const result: RouteLike = { path, fullPath }
      if (source?.query) result.query = source.query
      if (source?.hash) result.hash = source.hash
      return result
    }
    if (value.path && value.fullPath) return value
    let fullPath = value.fullPath ?? value.path ?? ''
    let path =
      value.path ??
      (fullPath.indexOf('?') !== -1
        ? fullPath.slice(0, fullPath.indexOf('?'))
        : fullPath.indexOf('#') !== -1
          ? fullPath.slice(0, fullPath.indexOf('#'))
          : fullPath)
    if (!path && !fullPath) {
      const name = value.name?.toString() ?? source?.name?.toString() ?? ''
      if (isIndexRouteName(name, { localizedRouteNamePrefix: this.getLocalizedRouteNamePrefix(), localeCodes: this.ctx.localeCodes! })) {
        path = '/'
        fullPath = '/'
      }
    }
    value.path = path
    value.fullPath = fullPath
    return value
  }

  _normalizeRouteInput(routeOrPath: RouteLike | string, _currentRoute?: ResolvedRouteLike): NormalizedRouteInput {
    if (typeof routeOrPath === 'string') return { kind: 'path', path: routeOrPath }
    const sourceRoute = routeOrPath
    const inputName = sourceRoute.name?.toString() ?? null
    let resolved: ResolvedRouteLike
    try {
      resolved = this.ctx.router.resolve(routeOrPath)
    } catch {
      resolved = {
        name: inputName,
        path: sourceRoute.path ?? '/',
        fullPath: sourceRoute.fullPath ?? sourceRoute.path ?? '/',
        params: sourceRoute.params ?? {},
        query: sourceRoute.query ?? {},
        hash: sourceRoute.hash ?? '',
      } as ResolvedRouteLike
    }
    return { kind: 'route', inputName, sourceRoute, resolved }
  }

  // --- Delegated to standalone helpers ---

  getCurrentLocale(route: ResolvedRouteLike, defaultLocaleOverride?: string | null): string {
    return helperGetCurrentLocale(this.ctx, route, defaultLocaleOverride)
  }

  getPluginRouteName(route: ResolvedRouteLike, locale: string): string {
    return helperGetPluginRouteName(this.ctx, route, locale, this.getLocalizedRouteNamePrefix())
  }

  getCurrentLocaleName(route: ResolvedRouteLike, defaultLocaleOverride?: string | null): string | null {
    return helperGetCurrentLocaleName(this.ctx, route, defaultLocaleOverride)
  }

  shouldReturn404(currentPath: string): string | null {
    return helperShouldReturn404(this.ctx, this.getPathWithoutLocale(currentPath))
  }
}
