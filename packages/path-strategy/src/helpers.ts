/**
 * Standalone strategy helper functions.
 * Merged: route-resolve + strategy-helpers.
 * No class dependencies — pure functions of context + route.
 */
import type { Locale } from '@i18n-micro/types'
import { buildUrl, cleanDoubleSlashes, getCleanPath, hasKeys, isSamePath, normalizePathForCompare, withoutLeadingSlash } from './path'
import { getRouteBaseName } from './resolver'
import type { GlobalLocaleRoutes, PathStrategyContext, ResolvedRouteLike, RouteLike, RouterAdapter } from './types'

// ---------------------------------------------------------------------------
// Route resolution helpers (was route-resolve.ts)
// ---------------------------------------------------------------------------

/**
 * Finds the localized route name that the router recognises.
 * Tries "{prefix}{routeName}-{locale}" first, then "{prefix}{routeName}".
 */
export function findLocalizedRouteName(
  router: RouterAdapter,
  prefix: string,
  routeName: string,
  targetLocale: string,
): { name: string; needsLocaleParam: boolean } | null {
  const withSuffix = `${prefix}${routeName}-${targetLocale}`
  if (router.hasRoute(withSuffix)) return { name: withSuffix, needsLocaleParam: false }
  const withoutSuffix = `${prefix}${routeName}`
  if (router.hasRoute(withoutSuffix)) return { name: withoutSuffix, needsLocaleParam: true }
  return null
}

/**
 * Core resolver: resolves a localized route given name, params, locale.
 */
function resolveLocalizedRoute(
  router: RouterAdapter,
  localizedName: string,
  needsLocaleParam: boolean,
  targetLocale: string,
  params: Record<string, unknown>,
  sourceRoute: RouteLike | undefined,
  rejectRoot: boolean,
): RouteLike | null {
  const resolveParams = { ...params }
  if (needsLocaleParam) resolveParams.locale = targetLocale

  let resolved: ReturnType<RouterAdapter['resolve']>
  try {
    resolved = router.resolve({
      name: localizedName,
      params: resolveParams,
      query: sourceRoute?.query,
      hash: sourceRoute?.hash,
    })
  } catch {
    return null
  }
  if (!resolved?.path) return null
  if (rejectRoot && resolved.path === '/') return null
  return {
    name: localizedName,
    path: resolved.path,
    fullPath: resolved.fullPath,
    params: resolved.params,
    query: resolved.query ?? sourceRoute?.query,
    hash: resolved.hash ?? sourceRoute?.hash,
  }
}

/**
 * Try to resolve route by localized name (uses sourceRoute.params).
 */
export function tryResolveByLocalizedName(
  router: RouterAdapter,
  prefix: string,
  routeName: string,
  targetLocale: string,
  sourceRoute?: RouteLike,
): RouteLike | null {
  const found = findLocalizedRouteName(router, prefix, routeName, targetLocale)
  if (!found) return null
  return resolveLocalizedRoute(router, found.name, found.needsLocaleParam, targetLocale, { ...sourceRoute?.params }, sourceRoute, false)
}

/**
 * Try to resolve route by localized name with explicit params.
 * Returns null if resolved path is "/" (root).
 */
export function tryResolveByLocalizedNameWithParams(
  router: RouterAdapter,
  prefix: string,
  routeName: string,
  targetLocale: string,
  params: Record<string, unknown>,
  sourceRoute?: RouteLike,
): RouteLike | null {
  const found = findLocalizedRouteName(router, prefix, routeName, targetLocale)
  if (!found) return null
  return resolveLocalizedRoute(router, found.name, found.needsLocaleParam, targetLocale, params, sourceRoute, true)
}

/**
 * Merges target route with query and hash from source route.
 */
export function preserveQueryAndHash(target: RouteLike | string, source?: RouteLike | null): RouteLike | string {
  if (!source || (!source.query && !source.hash)) {
    return target
  }

  let result: RouteLike
  if (typeof target === 'string') {
    result = { path: target }
  } else {
    result = target
  }

  if (source.query) {
    result.query = result.query ? Object.assign({}, source.query, result.query) : source.query
  }
  if (!result.hash && source.hash) {
    result.hash = source.hash
  }

  const basePath = result.path ?? ''
  result.fullPath = buildUrl(basePath, result.query, result.hash)

  return result
}

// ---------------------------------------------------------------------------
// Strategy helpers (was strategy-helpers.ts)
// ---------------------------------------------------------------------------

/**
 * Extracts locale from the first path segment.
 */
export function extractLocaleFromPath(path: string, locales: Locale[]): string | null {
  if (!path) return null
  const clean = getCleanPath(path)
  if (!clean || clean === '/') return null
  const start = clean.charCodeAt(0) === 47 ? 1 : 0
  const nextSlash = clean.indexOf('/', start)
  const first = nextSlash === -1 ? clean.slice(start) : clean.slice(start, nextSlash)
  if (!first) return null
  for (let i = 0; i < locales.length; i++) {
    if (locales[i]!.code === first) return first
  }
  return null
}

/**
 * Determines current locale from route.
 * @param defaultLocaleOverride — optional locale value (e.g. from cookie/state); replaces the old callback.
 */
export function getCurrentLocale(ctx: PathStrategyContext, route: ResolvedRouteLike, defaultLocaleOverride?: string | null): string {
  if (ctx.hashMode || ctx.strategy === 'no_prefix') {
    return defaultLocaleOverride || ctx.defaultLocale
  }

  const path = route.path || route.fullPath || ''

  if (ctx.strategy === 'prefix_and_default' && (path === '/' || path === '')) {
    if (defaultLocaleOverride) return defaultLocaleOverride
  }

  if (route.params?.locale) return String(route.params.locale)

  const localeFromPath = extractLocaleFromPath(path, ctx.locales)
  if (localeFromPath) return localeFromPath

  if (ctx.strategy === 'prefix_except_default') return ctx.defaultLocale

  return defaultLocaleOverride || ctx.defaultLocale
}

/**
 * Returns the route name for plugin translation loading.
 */
export function getPluginRouteName(ctx: PathStrategyContext, route: ResolvedRouteLike, locale: string, localizedRouteNamePrefix?: string): string {
  if (ctx.disablePageLocales) return 'index'
  const prefix = localizedRouteNamePrefix || ctx.localizedRouteNamePrefix || 'localized-'
  const baseName = getRouteBaseName(route, { locales: ctx.locales, localizedRouteNamePrefix: prefix })
  if (baseName) return baseName
  const name = (route.name ?? '').toString()
  let stripped = name.startsWith(prefix) ? name.slice(prefix.length) : name
  const suffix = `-${locale}`
  if (stripped.endsWith(suffix)) {
    stripped = stripped.slice(0, -suffix.length)
  }
  return stripped
}

/**
 * Returns displayName of the current locale, or null.
 */
export function getCurrentLocaleName(ctx: PathStrategyContext, route: ResolvedRouteLike, defaultLocaleOverride?: string | null): string | null {
  const code = getCurrentLocale(ctx, route, defaultLocaleOverride)
  for (let i = 0; i < ctx.locales.length; i++) {
    if (ctx.locales[i]!.code === code) return ctx.locales[i]!.displayName ?? null
  }
  return null
}

/**
 * Detects locale code from a localized route name suffix (e.g. "localized-about-de" → "de").
 */
export function detectLocaleFromName(name: string | null, locales: Locale[]): string | null {
  if (!name) return null
  for (let i = 0; i < locales.length; i++) {
    if (name.endsWith(`-${locales[i]!.code}`)) return locales[i]!.code
  }
  return null
}

/**
 * Checks whether a path corresponds to an unlocalized route (globalLocaleRoutes[key] === false).
 */
export function isUnlocalizedRoute(pathWithoutLocale: string, gr: GlobalLocaleRoutes | undefined): boolean {
  if (!gr) return false
  if (gr[pathWithoutLocale] === false) return true
  const pathKey = pathWithoutLocale === '/' ? '/' : withoutLeadingSlash(pathWithoutLocale)
  return gr[pathKey] === false
}

/**
 * Minimal interface for strategies that use prefix redirect / buildPrefixedPath helpers.
 */
export interface PrefixRedirectHost {
  readonly ctx: { globalLocaleRoutes?: GlobalLocaleRoutes }
  getPathWithoutLocale(path: string): { pathWithoutLocale: string; localeFromPath: string | null }
  resolvePathForLocale(path: string, locale: string): string
}

/**
 * Builds a path with locale prefix: `/{locale}{resolved}`.
 */
export function buildPrefixedPath(host: PrefixRedirectHost, pathWithoutLocale: string, locale: string): string {
  const resolved = host.resolvePathForLocale(pathWithoutLocale, locale)
  if (resolved === '/' || resolved === '') return `/${locale}`
  const withSlash = resolved.charCodeAt(0) === 47 ? resolved : `/${resolved}`
  return cleanDoubleSlashes(`/${locale}${withSlash}`)
}

/**
 * Joins a path with a locale prefix: `/{locale}{path}`.
 */
export function joinWithLocalePrefix(pathWithoutLocale: string, locale: string): string {
  if (pathWithoutLocale === '/' || pathWithoutLocale === '') return `/${locale}`
  const withSlash = pathWithoutLocale.charCodeAt(0) === 47 ? pathWithoutLocale : `/${pathWithoutLocale}`
  return cleanDoubleSlashes(`/${locale}${withSlash}`)
}

/**
 * Builds canonical path from a custom segment with optional locale prefix.
 */
export function buildCanonicalFromSegment(segment: string, locale: string | null): string | null {
  if (!segment) return null
  const normalized = segment.charCodeAt(0) === 47 ? segment : `/${segment}`
  if (!locale) return normalized
  return cleanDoubleSlashes(`/${locale}${normalized}`)
}

/**
 * Common prefix redirect logic shared by prefix and prefix_and_default strategies.
 */
export function prefixRedirect(host: PrefixRedirectHost, currentPath: string, detectedLocale: string): string | null {
  const gr = host.ctx.globalLocaleRoutes
  const { pathWithoutLocale, localeFromPath } = host.getPathWithoutLocale(currentPath)
  if (localeFromPath !== null && isUnlocalizedRoute(pathWithoutLocale, gr)) {
    return normalizePathForCompare(pathWithoutLocale)
  }
  if (localeFromPath === null && isUnlocalizedRoute(pathWithoutLocale, gr)) return null
  const expectedPath = buildPrefixedPath(host, pathWithoutLocale, detectedLocale)
  const currentPathOnly = getCleanPath(currentPath)
  if (localeFromPath === detectedLocale && isSamePath(currentPathOnly, expectedPath)) return null
  return expectedPath
}

/**
 * Checks if the current path should return 404.
 * @param parsed — pre-computed result of getPathWithoutLocale(currentPath); no callback needed.
 */
export function shouldReturn404(ctx: PathStrategyContext, parsed: { pathWithoutLocale: string; localeFromPath: string | null }): string | null {
  const { pathWithoutLocale, localeFromPath } = parsed
  if (localeFromPath === null) return null

  if (isUnlocalizedRoute(pathWithoutLocale, ctx.globalLocaleRoutes)) {
    return 'Unlocalized route cannot have locale prefix'
  }

  const rl = ctx.routeLocales
  if (rl && (ctx._hasRL ?? hasKeys(rl as Record<string, unknown>))) {
    const localeCodes = ctx.localeCodes ?? ctx.locales.map((l) => l.code)
    const rlKey = pathWithoutLocale === '/' ? '/' : withoutLeadingSlash(pathWithoutLocale)
    const allowed = rl[pathWithoutLocale] ?? rl[rlKey]
    if (Array.isArray(allowed) && allowed.length > 0) {
      const allowedCodes = allowed.filter((code) => localeCodes.includes(code))
      if (allowedCodes.length > 0 && !allowedCodes.includes(localeFromPath)) {
        return 'Locale not allowed for this route'
      }
    }
  }

  return null
}
