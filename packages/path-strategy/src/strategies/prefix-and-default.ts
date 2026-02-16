import {
  findLocalizedRouteName,
  isUnlocalizedRoute,
  joinWithLocalePrefix,
  prefixRedirect,
  tryResolveByLocalizedName,
  tryResolveByLocalizedNameWithParams,
} from '../helpers'
import { buildUrl, hasKeys, joinUrl, transformNameKeyToPath } from '../path'
import { analyzeRoute, getPathForUnlocalizedRoute, getPathForUnlocalizedRouteByName, isIndexRouteName, resolveCustomPath } from '../resolver'
import type { NormalizedRouteInput, ResolvedRouteLike, RouteLike, SwitchLocaleOptions } from '../types'
import { BasePathStrategy } from './base-strategy'

/**
 * prefix_and_default: default locale has both /path and /en/path.
 * We use prefixed route names for consistency (localized-name-en).
 */
export class PrefixAndDefaultPathStrategy extends BasePathStrategy {
  switchLocaleRoute(fromLocale: string, toLocale: string, route: ResolvedRouteLike, options: SwitchLocaleOptions): RouteLike | string {
    const baseName = this.getBaseRouteName(route, fromLocale)
    if (!baseName) return route

    const prefix = this.getLocalizedRouteNamePrefix()
    const found = findLocalizedRouteName(this.ctx.router, prefix, baseName, toLocale)
    let targetName: string
    let needsLocaleParam = false

    if (found) {
      targetName = found.name
      needsLocaleParam = found.needsLocaleParam
    } else if (this.ctx.router.hasRoute(baseName)) {
      targetName = baseName
    } else {
      return { ...route, name: this.buildLocalizedName(baseName, toLocale) }
    }

    const i18nParams = options.i18nRouteParams?.[toLocale] || {}
    const newParams: Record<string, unknown> = { ...(route.params || {}), ...i18nParams }
    if (needsLocaleParam) {
      newParams.locale = toLocale
    } else {
      delete (newParams as Record<string, unknown>).locale
    }

    return this.applyBaseUrl(toLocale, {
      name: targetName,
      params: newParams,
      query: route.query,
      hash: route.hash,
    }) as RouteLike
  }

  private rewriteWithLocalePrefix(route: RouteLike, targetLocale: string): RouteLike {
    const resolvedPath = route.path ?? ''
    const { pathWithoutLocale } = this.getPathWithoutLocale(resolvedPath)
    const pathWithLocale = joinWithLocalePrefix(pathWithoutLocale, targetLocale)
    const fullPathWithLocale = buildUrl(pathWithLocale, route.query, route.hash)
    return { ...route, path: pathWithLocale, fullPath: fullPathWithLocale }
  }

  resolveLocaleRoute(targetLocale: string, normalized: NormalizedRouteInput, currentRoute?: ResolvedRouteLike): RouteLike | string {
    if (normalized.kind === 'path') {
      const resolvedPath = this.resolvePathForLocale(normalized.path, targetLocale)
      return this.applyBaseUrl(targetLocale, joinWithLocalePrefix(resolvedPath, targetLocale))
    }

    const { inputName, sourceRoute, resolved } = normalized
    const prefix = this.getLocalizedRouteNamePrefix()

    if (inputName) {
      const unlocalizedByName = getPathForUnlocalizedRouteByName(this.ctx, inputName)
      if (unlocalizedByName !== null) return unlocalizedByName
    }
    const hasParams = hasKeys(sourceRoute.params as Record<string, unknown>)
    if (inputName && hasParams) {
      const routeWithParams = tryResolveByLocalizedNameWithParams(
        this.ctx.router,
        prefix,
        inputName,
        targetLocale,
        sourceRoute.params ?? {},
        sourceRoute,
      )
      if (routeWithParams !== null) {
        return this.applyBaseUrl(targetLocale, this.rewriteWithLocalePrefix(routeWithParams, targetLocale))
      }
    }

    const hasGR = this.ctx._hasGR === true
    const baseName = this.getRouteBaseName(resolved) ?? inputName ?? resolved.name?.toString() ?? null

    if (hasGR) {
      const analysis = analyzeRoute(this.ctx, resolved)

      const unlocalizedPath = getPathForUnlocalizedRoute(this.ctx, resolved, analysis)
      if (unlocalizedPath !== null) return this.applyBaseUrl(targetLocale, unlocalizedPath)

      const customSegment = resolveCustomPath(this.ctx, resolved, targetLocale, analysis)
      if (customSegment !== null) {
        return this.applyBaseUrl(targetLocale, joinWithLocalePrefix(customSegment, targetLocale))
      }

      if (resolved.path && resolved.path !== '/' && resolved.name) {
        const { pathWithoutLocale } = analysis
        if (pathWithoutLocale && pathWithoutLocale !== '/') {
          return this.applyBaseUrl(targetLocale, joinWithLocalePrefix(pathWithoutLocale, targetLocale))
        }
      }
    }

    if (inputName && !hasParams) {
      let routeByLocalizedName = tryResolveByLocalizedName(this.ctx.router, prefix, inputName, targetLocale, sourceRoute)
      if (routeByLocalizedName === null && baseName != null && baseName !== inputName && inputName.startsWith(prefix)) {
        routeByLocalizedName = tryResolveByLocalizedName(this.ctx.router, prefix, baseName, targetLocale, sourceRoute)
      }
      if (routeByLocalizedName !== null) {
        return this.applyBaseUrl(targetLocale, this.rewriteWithLocalePrefix(routeByLocalizedName, targetLocale))
      }
    }

    if (!hasGR && resolved.path && resolved.path !== '/' && resolved.name) {
      const analysis = analyzeRoute(this.ctx, resolved)
      const { pathWithoutLocale } = analysis
      if (pathWithoutLocale && pathWithoutLocale !== '/') {
        return this.applyBaseUrl(targetLocale, joinWithLocalePrefix(pathWithoutLocale, targetLocale))
      }
    }

    const fromLocale = this.detectLocaleFromName(currentRoute ? currentRoute.name : resolved.name)

    const fallbackBaseName = fromLocale ? this.getBaseRouteName(resolved, fromLocale) : baseName

    if (!fallbackBaseName) {
      const { pathWithoutLocale } = this.getPathWithoutLocale(resolved.path ?? '/')
      const pathWithLocale = joinWithLocalePrefix(pathWithoutLocale, targetLocale)
      const fullPathWithLocale = buildUrl(pathWithLocale, sourceRoute.query, sourceRoute.hash)
      return this.applyBaseUrl(targetLocale, {
        ...sourceRoute,
        path: pathWithLocale,
        fullPath: fullPathWithLocale,
      })
    }

    const targetName = this.buildLocalizedName(fallbackBaseName, targetLocale)

    const pathWithoutLocale = isIndexRouteName(fallbackBaseName) ? '/' : joinUrl('/', transformNameKeyToPath(fallbackBaseName))
    const pathForLocale = joinWithLocalePrefix(pathWithoutLocale, targetLocale)
    const withBase = this.applyBaseUrl(targetLocale, pathForLocale)
    const pathStr = typeof withBase === 'string' ? withBase : ((withBase as RouteLike).path ?? pathForLocale)

    const newRoute: RouteLike = { name: targetName, path: pathStr, fullPath: pathStr }
    if (resolved.params || sourceRoute.params)
      newRoute.params = resolved.params !== sourceRoute.params ? Object.assign({}, resolved.params, sourceRoute.params) : resolved.params
    if (resolved.query || sourceRoute.query)
      newRoute.query = resolved.query !== sourceRoute.query ? Object.assign({}, resolved.query, sourceRoute.query) : resolved.query
    newRoute.hash = sourceRoute.hash || resolved.hash
    return this.applyBaseUrl(targetLocale, newRoute)
  }

  getRedirect(currentPath: string, detectedLocale: string): string | null {
    return prefixRedirect(this, currentPath, detectedLocale)
  }

  getClientRedirect(currentPath: string, _preferredLocale: string): string | null {
    const { pathWithoutLocale, localeFromPath } = this.getPathWithoutLocale(currentPath)
    if (isUnlocalizedRoute(pathWithoutLocale, this.ctx.globalLocaleRoutes)) return null
    if (localeFromPath !== null) return null
    return null
  }
}

/** Alias for Nuxt alias consumption. */
export { PrefixAndDefaultPathStrategy as Strategy }
