/**
 * Route resolver — pure functions for resolving custom paths from globalLocaleRoutes.
 * No class, no stored state. Takes context as first argument.
 */

import {
  getPathWithoutLocale,
  hasKeys,
  joinUrl,
  nameKeyFirstSlash,
  nameKeyLastSlash,
  normalizePath,
  transformNameKeyToPath,
  withoutLeadingSlash,
} from './path'
import type { PathStrategyContext, ResolvedRouteLike } from './types'

/**
 * Single pre-compiled regex that matches all Nuxt route param patterns in one pass:
 *   :key()       — optional param  (group 1)
 *   :key         — required param  (group 2, not followed by word char)
 *   [...key]     — catch-all param (group 3)
 */
const PARAM_PATTERN = /:(\w+)\(\)|:(\w+)(?!\w)|\[\.\.\.(\w+)\]/g

/**
 * Substitutes params into path template (:key, :key(), [...key]).
 * Uses a single pre-compiled regex for all keys in one pass.
 */
export function resolvePathWithParams(path: string, params: Record<string, unknown> = {}): string {
  if (!params || !hasKeys(params)) return path

  return path.replace(PARAM_PATTERN, (match, optKey?: string, reqKey?: string, catchAllKey?: string) => {
    const key = optKey || reqKey || catchAllKey
    if (!key) return match

    const value = params[key]
    if (value === undefined || value === null || value === '') return match

    return Array.isArray(value) ? (value as unknown[]).join('/') : String(value)
  })
}

// ---------------------------------------------------------------------------
// Route name helpers (used internally by resolver)
// ---------------------------------------------------------------------------

export interface GetRouteBaseNameOptions {
  locales: { code: string }[]
  localizedRouteNamePrefix?: string
}

/**
 * Base route name without prefix (localized-) and suffix (-{locale}).
 */
export function getRouteBaseName(route: { name?: string | null } & Record<string, any>, options: GetRouteBaseNameOptions): string | null {
  const name = route.name?.toString()
  if (!name) return null

  const prefix = options.localizedRouteNamePrefix || 'localized-'
  const base = name.startsWith(prefix) ? name.slice(prefix.length) : name

  let bestLen = 0
  let bestSlice = -1
  for (let i = 0; i < options.locales.length; i++) {
    const code = options.locales[i]!.code
    if (code.length <= bestLen) continue
    const dashPos = base.length - code.length - 1
    if (dashPos < 0 || base[dashPos] !== '-') continue
    if (base.endsWith(code)) {
      bestLen = code.length
      bestSlice = dashPos
    }
  }
  return bestSlice >= 0 ? base.slice(0, bestSlice) : base
}

/** Builds localized name: localized-{baseName}-{locale}. */
export function buildLocalizedName(baseName: string, locale: string, prefix = 'localized-'): string {
  return `${prefix}${baseName}-${locale}`
}

export interface IsIndexRouteNameOptions {
  localizedRouteNamePrefix?: string
  localeCodes?: readonly string[]
}

/**
 * Returns true if the given route name refers to the index (root) route.
 */
export function isIndexRouteName(name: string | null | undefined, options?: IsIndexRouteNameOptions): boolean {
  if (name == null) return false
  const s = String(name).trim()
  if (s === '' || s === 'index') return true
  const prefix = options?.localizedRouteNamePrefix ?? 'localized-'
  const localeCodes = options?.localeCodes ?? []
  const localizedIndexPrefix = `${prefix}index-`
  if (!s.startsWith(localizedIndexPrefix)) return false
  const localePart = s.slice(localizedIndexPrefix.length)
  return localeCodes.length === 0 ? localePart.length >= 2 : localeCodes.includes(localePart)
}

// ---------------------------------------------------------------------------
// Lookup keys — shared by resolveCustomPath, getPathForUnlocalizedRoute, getAllowedLocalesForRoute
// ---------------------------------------------------------------------------

export interface RouteAnalysis {
  pathWithoutLocale: string
  baseRouteName: string | null
}

export function analyzeRoute(ctx: PathStrategyContext, route: ResolvedRouteLike): RouteAnalysis {
  const codes = ctx.localeCodes ?? ctx.locales.map((l) => l.code)
  const { pathWithoutLocale } = getPathWithoutLocale(route.path || '/', codes)

  let baseRouteName: string | null = null
  if (route.name) {
    baseRouteName = getRouteBaseName(route, {
      locales: ctx.locales,
      localizedRouteNamePrefix: ctx.localizedRouteNamePrefix || 'localized-',
    })
  }

  return { pathWithoutLocale, baseRouteName }
}

function getLookupKeys(pathWithoutLocale: string, baseRouteName: string | null): string[] {
  const keys: string[] = []

  keys.push(pathWithoutLocale)

  const pathKey = withoutLeadingSlash(pathWithoutLocale)
  if (pathKey && pathKey !== pathWithoutLocale) keys.push(pathKey)
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
export function resolveCustomPath(
  ctx: PathStrategyContext,
  route: ResolvedRouteLike,
  targetLocale: string,
  precomputed?: RouteAnalysis,
): string | null {
  const gr = ctx.globalLocaleRoutes
  if (!gr || !(ctx._hasGR ?? hasKeys(gr as Record<string, unknown>))) return null

  const { pathWithoutLocale, baseRouteName } = precomputed ?? analyzeRoute(ctx, route)
  const keys = getLookupKeys(pathWithoutLocale, baseRouteName)

  for (const key of keys) {
    const rule = gr[key]
    if (rule && typeof rule === 'object' && !Array.isArray(rule)) {
      const customPath = (rule as Record<string, string>)[targetLocale]
      if (typeof customPath === 'string') {
        return resolvePathWithParams(customPath, route.params ?? {})
      }
    }
  }

  return null
}

/**
 * Unlocalized route (globalLocaleRoutes[key] === false) — returns path without locale.
 */
export function getPathForUnlocalizedRoute(ctx: PathStrategyContext, route: ResolvedRouteLike, precomputed?: RouteAnalysis): string | null {
  const gr = ctx.globalLocaleRoutes
  if (!gr) return null

  const { pathWithoutLocale, baseRouteName } = precomputed ?? analyzeRoute(ctx, route)
  const keys = getLookupKeys(pathWithoutLocale, baseRouteName)

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
export function getPathForUnlocalizedRouteByName(ctx: PathStrategyContext, routeName: string): string | null {
  const gr = ctx.globalLocaleRoutes
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
export function getAllowedLocalesForRoute(ctx: PathStrategyContext, route: ResolvedRouteLike, precomputed?: RouteAnalysis): string[] {
  const codes = ctx.localeCodes ?? ctx.locales.map((l) => l.code)
  const rl = ctx.routeLocales
  if (!rl || !(ctx._hasRL ?? hasKeys(rl as Record<string, unknown>))) {
    return codes as string[]
  }

  const { pathWithoutLocale, baseRouteName } = precomputed ?? analyzeRoute(ctx, route)
  let keys = getLookupKeys(pathWithoutLocale, baseRouteName)

  if (baseRouteName && ctx.routesLocaleLinks?.[baseRouteName]) {
    const linkedName = ctx.routesLocaleLinks[baseRouteName]
    keys = [linkedName, ...keys]
  }

  for (const key of keys) {
    const allowed = rl[key]
    if (Array.isArray(allowed) && allowed.length > 0) {
      return allowed.filter((code) => codes.includes(code))
    }
  }

  return codes as string[]
}

/**
 * Parent path for nested route (parent key -> targetLocale path).
 */
export function getParentPathForNested(ctx: PathStrategyContext, nameSegments: string[], targetLocale: string): string {
  if (nameSegments.length <= 1) return '/'

  const parentKey = nameSegments.length > 1 ? nameSegments.slice(0, -1).join('-') : ''
  const gr = ctx.globalLocaleRoutes

  if (parentKey && gr?.[parentKey] && typeof gr[parentKey] === 'object') {
    const parentRules = gr[parentKey] as Record<string, string>
    if (parentRules[targetLocale]) {
      return normalizePath(parentRules[targetLocale])
    }
  }

  return joinUrl('/', ...nameSegments.slice(0, -1))
}

// ---------------------------------------------------------------------------
// Resolve path for locale (used by strategies)
// ---------------------------------------------------------------------------

/**
 * Resolves a path for a target locale using custom routes.
 * Returns normalized path (custom or original).
 */
export function resolvePathForLocale(ctx: PathStrategyContext, path: string, targetLocale: string): string {
  const mockRoute: ResolvedRouteLike = { path, name: null, fullPath: path, params: {} }
  const customSegment = resolveCustomPath(ctx, mockRoute, targetLocale)
  return normalizePath(customSegment || path)
}
