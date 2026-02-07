/**
 * RouteResolver — single point for resolving custom paths from globalLocaleRoutes.
 * Uses normalizer and route-name utilities; lookup keys in one place (getLookupKeys).
 */

import { withoutLeadingSlash } from 'ufo'
import { joinUrl, nameKeyFirstSlash, nameKeyLastSlash, normalizePath, transformNameKeyToPath } from '../utils/path'
import { getRouteBaseName } from '../utils/route-name'
import { getPathWithoutLocale } from './normalizer'
import type { PathStrategyContext, ResolvedRouteLike } from './types'

/**
 * Single pre-compiled regex that matches all Nuxt route param patterns in one pass:
 *   :key()       — optional param  (group 1)
 *   :key         — required param  (group 2, not followed by word char)
 *   [...key]     — catch-all param (group 3)
 */
const PARAM_PATTERN = /:(\w+)\(\)|:(\w+)(?!\w)|\[\.\.\.(\w+)\]/g

export class RouteResolver {
  constructor(private ctx: PathStrategyContext) {}

  /**
   * Substitutes params into path template (:key, :key(), [...key]).
   * Uses a single pre-compiled regex for all keys in one pass — no per-key RegExp allocation.
   */
  resolvePathWithParams(path: string, params: Record<string, unknown> = {}): string {
    if (!params || Object.keys(params).length === 0) return path

    return path.replace(PARAM_PATTERN, (match, optKey?: string, reqKey?: string, catchAllKey?: string) => {
      const key = optKey || reqKey || catchAllKey
      if (!key) return match

      const value = params[key]
      if (value === undefined || value === null || value === '') return match

      return Array.isArray(value) ? (value as unknown[]).join('/') : String(value)
    })
  }

  /**
   * Analyzes route: path without locale and base name (normalizer + route-name).
   */
  private analyzeRoute(route: ResolvedRouteLike): { pathWithoutLocale: string; baseRouteName: string | null } {
    const localeCodes = this.ctx.locales.map((l) => l.code)
    const { pathWithoutLocale } = getPathWithoutLocale(route.path || '/', localeCodes)

    let baseRouteName: string | null = null
    if (route.name) {
      baseRouteName = getRouteBaseName(route, {
        locales: this.ctx.locales,
        localizedRouteNamePrefix: this.ctx.localizedRouteNamePrefix || 'localized-',
      })
    }

    return { pathWithoutLocale, baseRouteName }
  }

  /** Public access to route analysis (for strategies). */
  getPathWithoutLocaleAndBaseName(route: ResolvedRouteLike): { pathWithoutLocale: string; baseRouteName: string | null } {
    return this.analyzeRoute(route)
  }

  /**
   * Lookup keys for config (same order for resolveCustomPath, getPathForUnlocalizedRoute, getAllowedLocalesForRoute).
   */
  private getLookupKeys(pathWithoutLocale: string, baseRouteName: string | null): string[] {
    const keys: string[] = []

    keys.push(pathWithoutLocale)

    const pathKey = withoutLeadingSlash(pathWithoutLocale)
    if (pathKey && pathKey !== pathWithoutLocale) keys.push(pathKey)
    // Support root path lookup: '' as key when path is '/'
    if (pathWithoutLocale === '/' || pathKey === '') keys.push('')

    if (baseRouteName) {
      keys.push(`/${baseRouteName}`)
      keys.push(baseRouteName)

      const asPath = transformNameKeyToPath(baseRouteName)
      if (asPath && asPath !== baseRouteName) keys.push(asPath)

      const firstSlash = nameKeyFirstSlash(baseRouteName)
      if (firstSlash) keys.push(firstSlash)

      const lastSlash = nameKeyLastSlash(baseRouteName)
      if (lastSlash) keys.push(lastSlash)
    }

    return keys
  }

  /**
   * Resolves custom path for targetLocale from globalLocaleRoutes.
   */
  resolveCustomPath(route: ResolvedRouteLike, targetLocale: string): string | null {
    const gr = this.ctx.globalLocaleRoutes
    if (!gr || Object.keys(gr).length === 0) return null

    const { pathWithoutLocale, baseRouteName } = this.analyzeRoute(route)
    const keys = this.getLookupKeys(pathWithoutLocale, baseRouteName)

    for (const key of keys) {
      const rule = gr[key]
      if (rule && typeof rule === 'object' && !Array.isArray(rule)) {
        const customPath = (rule as Record<string, string>)[targetLocale]
        if (typeof customPath === 'string') {
          return this.resolvePathWithParams(customPath, route.params ?? {})
        }
      }
    }

    return null
  }

  /**
   * Unlocalized route (globalLocaleRoutes[key] === false) — returns path without locale.
   */
  getPathForUnlocalizedRoute(route: ResolvedRouteLike): string | null {
    const gr = this.ctx.globalLocaleRoutes
    if (!gr) return null

    const { pathWithoutLocale, baseRouteName } = this.analyzeRoute(route)
    const keys = this.getLookupKeys(pathWithoutLocale, baseRouteName)

    for (const key of keys) {
      if (gr[key] === false) {
        if (baseRouteName && (key === baseRouteName || key === `/${baseRouteName}`)) {
          const pathForm = transformNameKeyToPath(baseRouteName)
          return pathForm ? joinUrl('/', pathForm) : `/${baseRouteName}`
        }
        return pathWithoutLocale
      }
    }

    return null
  }

  /**
   * Unlocalized by name (when no route object available).
   */
  getPathForUnlocalizedRouteByName(routeName: string): string | null {
    const gr = this.ctx.globalLocaleRoutes
    if (!gr) return null

    const keys = [routeName, `/${routeName}`, withoutLeadingSlash(routeName)]

    for (const key of keys) {
      if (gr[key] === false) {
        const pathForm = transformNameKeyToPath(key.startsWith('/') ? key.slice(1) : key)
        return pathForm ? joinUrl('/', pathForm) : key.startsWith('/') ? key : `/${key}`
      }
    }
    return null
  }

  /**
   * Allowed locales for route (routeLocales).
   */
  getAllowedLocalesForRoute(route: ResolvedRouteLike): string[] {
    const rl = this.ctx.routeLocales
    if (!rl || Object.keys(rl).length === 0) {
      return this.ctx.locales.map((l) => l.code)
    }

    const { pathWithoutLocale, baseRouteName } = this.analyzeRoute(route)
    let keys = this.getLookupKeys(pathWithoutLocale, baseRouteName)

    if (baseRouteName && this.ctx.routesLocaleLinks?.[baseRouteName]) {
      const linkedName = this.ctx.routesLocaleLinks[baseRouteName]
      keys = [linkedName, ...keys]
    }

    for (const key of keys) {
      const allowed = rl[key]
      if (Array.isArray(allowed) && allowed.length > 0) {
        return allowed.filter((code) => this.ctx.locales.some((l) => l.code === code))
      }
    }

    return this.ctx.locales.map((l) => l.code)
  }

  /**
   * Parent path for nested route (parent key -> targetLocale path).
   */
  getParentPathForNested(nameSegments: string[], targetLocale: string): string {
    if (nameSegments.length <= 1) return '/'

    const parentKey = nameSegments.length > 1 ? nameSegments.slice(0, -1).join('-') : ''
    const gr = this.ctx.globalLocaleRoutes

    if (parentKey && gr?.[parentKey] && typeof gr[parentKey] === 'object') {
      const parentRules = gr[parentKey] as Record<string, string>
      if (parentRules[targetLocale]) {
        return normalizePath(parentRules[targetLocale])
      }
    }

    return joinUrl('/', ...nameSegments.slice(0, -1))
  }
}
