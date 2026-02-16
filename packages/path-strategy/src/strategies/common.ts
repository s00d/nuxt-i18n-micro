/**
 * Default implementations of switchLocaleRoute / resolveLocaleRoute.
 * Used by NoPrefixPathStrategy and PrefixPathStrategy.
 * Standalone functions — no class inheritance needed.
 * Resolver is now pure functions from ../resolver.
 */

import { findLocalizedRouteName, preserveQueryAndHash, tryResolveByLocalizedName, tryResolveByLocalizedNameWithParams } from '../helpers'
import { getPathSegments, hasKeys, joinUrl, nameKeyFirstSlash, nameKeyLastSlash, normalizePath, transformNameKeyToPath } from '../path'
import {
  analyzeRoute,
  getPathForUnlocalizedRoute,
  getPathForUnlocalizedRouteByName,
  isIndexRouteName,
  resolveCustomPath,
  resolvePathWithParams,
} from '../resolver'
import type { NormalizedRouteInput, PathStrategyContext, ResolvedRouteLike, RouteLike, SwitchLocaleOptions } from '../types'

/** Minimal interface that strategies must satisfy for default implementations. */
export interface DefaultImplHost {
  readonly ctx: PathStrategyContext
  getRouteBaseName(route: RouteLike, locale?: string): string | null
  getBaseRouteName(route: RouteLike, locale: string): string | null
  buildLocalizedName(baseName: string, locale: string): string
  buildLocalizedPath(path: string, locale: string, isCustom: boolean): string
  buildLocalizedRouteName(baseName: string, locale: string): string
  getLocalizedRouteNamePrefix(): string
  applyBaseUrl(localeCode: string, route: RouteLike | string): RouteLike | string
  getPathWithoutLocale(path: string): { pathWithoutLocale: string; localeFromPath: string | null }
  resolvePathForLocale(path: string, targetLocale: string): string
  getSwitchLocaleFallbackWhenNoRoute(route: ResolvedRouteLike, targetName: string): RouteLike | string
}

export function defaultSwitchLocaleRoute(
  s: DefaultImplHost,
  fromLocale: string,
  toLocale: string,
  route: ResolvedRouteLike,
  options: SwitchLocaleOptions,
): RouteLike | string {
  const baseName = s.getBaseRouteName(route, fromLocale)
  if (!baseName) return route

  const prefix = s.getLocalizedRouteNamePrefix()
  const found = findLocalizedRouteName(s.ctx.router, prefix, baseName, toLocale)
  let targetName: string
  let needsLocaleParam = false

  if (found) {
    targetName = found.name
    needsLocaleParam = found.needsLocaleParam
  } else if (s.ctx.router.hasRoute(baseName)) {
    targetName = baseName
  } else {
    return s.getSwitchLocaleFallbackWhenNoRoute(route, s.buildLocalizedRouteName(baseName, toLocale))
  }

  const i18nParams = options.i18nRouteParams?.[toLocale] || {}
  const newParams: Record<string, unknown> = { ...(route.params || {}), ...i18nParams }
  if (needsLocaleParam) {
    newParams.locale = toLocale
  } else {
    delete newParams.locale
  }

  return s.applyBaseUrl(toLocale, {
    name: targetName,
    params: newParams,
    query: route.query,
    hash: route.hash,
  })
}

function buildPathFromBaseNameAndParams(s: DefaultImplHost, baseName: string, params: Record<string, unknown>, targetLocale: string): string | null {
  const paramKeys = Object.keys(params).filter((k) => params[k] !== undefined && params[k] !== null && params[k] !== '')
  if (paramKeys.length === 0) return null

  let pathTemplate: string
  const firstKey = paramKeys[0]
  if (paramKeys.length === 1 && firstKey !== undefined && baseName.endsWith(`-${firstKey}`)) {
    pathTemplate = joinUrl('/', `${baseName.slice(0, baseName.length - firstKey.length - 1)}-:${firstKey}`)
  } else {
    const pathForm = transformNameKeyToPath(baseName)
    const pathSegments = pathForm ? pathForm.split('/').filter(Boolean) : [baseName]
    const replaceCount = Math.min(paramKeys.length, pathSegments.length)
    const templateSegments = pathSegments.slice(0, pathSegments.length - replaceCount).concat(paramKeys.slice(0, replaceCount).map((k) => `:${k}`))
    pathTemplate = joinUrl('/', ...templateSegments)
  }
  const pathWithParams = resolvePathWithParams(pathTemplate, params)
  const finalPath = s.buildLocalizedPath(pathWithParams, targetLocale, false)
  const withBase = s.applyBaseUrl(targetLocale, finalPath)
  return typeof withBase === 'string' ? withBase : ((withBase as RouteLike).path ?? finalPath)
}

export function defaultResolveLocaleRoute(
  s: DefaultImplHost,
  targetLocale: string,
  normalized: NormalizedRouteInput,
  _currentRoute?: ResolvedRouteLike,
): RouteLike | string {
  if (normalized.kind === 'path') {
    const resolvedPath = s.resolvePathForLocale(normalized.path, targetLocale)
    const finalPath = s.buildLocalizedPath(resolvedPath, targetLocale, false)
    return s.applyBaseUrl(targetLocale, finalPath)
  }

  const { inputName, sourceRoute: src, resolved } = normalized
  const hasParams = hasKeys(src.params as Record<string, unknown>)
  const baseName = s.getRouteBaseName(resolved) ?? inputName ?? resolved.name?.toString() ?? null
  const resolvedNameStr = resolved.name?.toString()
  const prefix = s.getLocalizedRouteNamePrefix()
  const router = s.ctx.router
  const gr = s.ctx.globalLocaleRoutes
  const hasGR = s.ctx._hasGR === true

  if (inputName && hasGR) {
    const unlocalizedByName = getPathForUnlocalizedRouteByName(s.ctx, inputName)
    if (unlocalizedByName !== null) return preserveQueryAndHash(unlocalizedByName, src)
  }

  if (inputName && hasParams) {
    const routeWithParams = tryResolveByLocalizedNameWithParams(router, prefix, inputName, targetLocale, src.params ?? {}, src)
    if (routeWithParams !== null) return preserveQueryAndHash(s.applyBaseUrl(targetLocale, routeWithParams), src)
  }

  if (inputName && !hasParams) {
    let routeByLocalizedName = tryResolveByLocalizedName(router, prefix, inputName, targetLocale, src)
    if (routeByLocalizedName === null && baseName != null && baseName !== inputName && inputName.startsWith(prefix)) {
      routeByLocalizedName = tryResolveByLocalizedName(router, prefix, baseName, targetLocale, src)
    }
    if (routeByLocalizedName !== null) return preserveQueryAndHash(s.applyBaseUrl(targetLocale, routeByLocalizedName), src)
  }

  if (hasGR) {
    const analysis = analyzeRoute(s.ctx, resolved)

    const unlocalizedPath = getPathForUnlocalizedRoute(s.ctx, resolved, analysis)
    if (unlocalizedPath !== null) {
      const path = s.buildLocalizedPath(unlocalizedPath, targetLocale, false)
      return preserveQueryAndHash(s.applyBaseUrl(targetLocale, path), src)
    }

    const customSegment = resolveCustomPath(s.ctx, resolved, targetLocale, analysis)
    if (customSegment !== null) {
      const routeName = resolved.name?.toString() ?? inputName ?? ''
      const keyFirstSlash = routeName ? nameKeyFirstSlash(routeName) : ''
      const keyLastSlash = routeName ? nameKeyLastSlash(routeName) : ''
      const isNestedFirst = keyFirstSlash.includes('/') && gr?.[keyFirstSlash]
      const isNestedLast = keyLastSlash.includes('/') && gr?.[keyLastSlash]
      const isNested = isNestedFirst || isNestedLast
      const keyWithSlash = isNestedLast ? keyLastSlash : keyFirstSlash
      let pathWithoutLocale: string
      if (isNested) {
        const nameSegments = getPathSegments(keyWithSlash)
        const parentKey = nameSegments.length > 1 ? nameSegments.slice(0, -1).join('-') : ''
        const parentRules =
          parentKey && gr?.[parentKey] && typeof gr[parentKey] === 'object' && !Array.isArray(gr[parentKey])
            ? (gr[parentKey] as Record<string, string>)
            : null
        const parentPath = parentRules?.[targetLocale] ? normalizePath(parentRules[targetLocale]) : joinUrl('/', ...nameSegments.slice(0, -1))
        const segment = customSegment.charCodeAt(0) === 47 ? customSegment.slice(1) : customSegment
        pathWithoutLocale = joinUrl(parentPath, segment)
      } else {
        pathWithoutLocale = normalizePath(customSegment)
      }
      const finalPath = s.buildLocalizedPath(pathWithoutLocale, targetLocale, true)
      return preserveQueryAndHash(s.applyBaseUrl(targetLocale, finalPath), src)
    }

    if (!hasParams && resolved.path && resolved.path !== '/' && resolved.name) {
      const { pathWithoutLocale, baseRouteName } = analysis
      if (pathWithoutLocale && pathWithoutLocale !== '/') {
        const pathToUse =
          baseRouteName && pathWithoutLocale === baseRouteName ? joinUrl('/', transformNameKeyToPath(baseRouteName)) : pathWithoutLocale
        const finalPath = s.buildLocalizedPath(pathToUse, targetLocale, false)
        return preserveQueryAndHash(s.applyBaseUrl(targetLocale, finalPath), src)
      }
    }
  }

  const effectiveBaseName = baseName ?? inputName
  if (!effectiveBaseName) return src

  if (!hasGR && !hasParams && resolved.path && resolved.path !== '/' && resolved.name) {
    const analysis = analyzeRoute(s.ctx, resolved)
    const { pathWithoutLocale, baseRouteName } = analysis
    if (pathWithoutLocale && pathWithoutLocale !== '/') {
      const pathToUse = baseRouteName && pathWithoutLocale === baseRouteName ? joinUrl('/', transformNameKeyToPath(baseRouteName)) : pathWithoutLocale
      const finalPath = s.buildLocalizedPath(pathToUse, targetLocale, false)
      return preserveQueryAndHash(s.applyBaseUrl(targetLocale, finalPath), src)
    }
  }

  const baseNameForPath = resolvedNameStr === inputName ? effectiveBaseName : (inputName ?? effectiveBaseName)
  const targetName = s.buildLocalizedRouteName(baseNameForPath, targetLocale)
  const newRoute: RouteLike = { name: targetName, path: src.path, fullPath: src.fullPath }
  if (src.params) newRoute.params = Object.assign({}, src.params)
  if (src.query) newRoute.query = src.query
  if (src.hash) newRoute.hash = src.hash

  if (!hasParams) {
    const pathWithoutLocale = isIndexRouteName(baseNameForPath) ? '/' : joinUrl('/', transformNameKeyToPath(baseNameForPath))
    const finalPath = s.buildLocalizedPath(pathWithoutLocale, targetLocale, false)
    const withBase = s.applyBaseUrl(targetLocale, finalPath)
    const pathStr = typeof withBase === 'string' ? withBase : ((withBase as RouteLike).path ?? finalPath)
    newRoute.path = pathStr
    newRoute.fullPath = pathStr
  } else {
    let pathStr: string | null = null
    try {
      const resolvedWithParams = router.resolve({ name: baseNameForPath, params: src.params })
      if (resolvedWithParams?.path) {
        const pathToUse =
          resolvedWithParams.path === '/'
            ? '/'
            : (() => {
                const { pathWithoutLocale } = s.getPathWithoutLocale(resolvedWithParams.path)
                return pathWithoutLocale && pathWithoutLocale !== '/' ? pathWithoutLocale : resolvedWithParams.path
              })()
        const finalPath = s.buildLocalizedPath(pathToUse, targetLocale, false)
        const withBase = s.applyBaseUrl(targetLocale, finalPath)
        pathStr = typeof withBase === 'string' ? withBase : ((withBase as RouteLike).path ?? finalPath)
      }
    } catch {
      pathStr = buildPathFromBaseNameAndParams(s, baseNameForPath, src.params ?? {}, targetLocale)
    }
    if (pathStr) {
      newRoute.path = pathStr
      newRoute.fullPath = pathStr
    }
  }

  if (newRoute.path) delete newRoute.name
  return preserveQueryAndHash(s.applyBaseUrl(targetLocale, newRoute), src)
}
