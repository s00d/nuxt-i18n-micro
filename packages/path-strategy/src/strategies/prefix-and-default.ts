import { isSamePath, withLeadingSlash, withoutLeadingSlash } from 'ufo'
import type { NormalizedRouteInput, ResolvedRouteLike, RouteLike, SwitchLocaleOptions } from '../core/types'
import { buildUrl, getCleanPath, joinUrl, normalizePath, normalizePathForCompare, transformNameKeyToPath } from '../utils/path'
import { isIndexRouteName } from '../utils/route-name'
import { BasePathStrategy } from './base-strategy'

/**
 * prefix_and_default: default locale has both /path and /en/path.
 * We use prefixed route names for consistency (localized-name-en).
 */
export class PrefixAndDefaultPathStrategy extends BasePathStrategy {
  protected buildLocalizedPath(path: string, locale: string, _isCustom: boolean): string {
    return joinUrl(locale, normalizePath(path))
  }

  protected buildLocalizedRouteName(baseName: string, locale: string): string {
    return this.buildLocalizedName(baseName, locale)
  }

  override switchLocaleRoute(fromLocale: string, toLocale: string, route: ResolvedRouteLike, options: SwitchLocaleOptions): RouteLike | string {
    const baseName = this.getBaseRouteName(route, fromLocale)
    if (!baseName) return route

    // Try route name with locale suffix first (custom paths), then without suffix (standard routes)
    const nameWithSuffix = this.buildLocalizedName(baseName, toLocale)
    const nameWithoutSuffix = `${this.getLocalizedRouteNamePrefix()}${baseName}`
    let targetName: string
    let needsLocaleParam = false

    if (this.ctx.router.hasRoute(nameWithSuffix)) {
      targetName = nameWithSuffix
    } else if (this.ctx.router.hasRoute(nameWithoutSuffix)) {
      targetName = nameWithoutSuffix
      needsLocaleParam = true
    } else if (this.ctx.router.hasRoute(baseName)) {
      targetName = baseName
    } else {
      return { ...route, name: nameWithSuffix }
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

  protected override resolveLocaleRoute(
    targetLocale: string,
    normalized: NormalizedRouteInput,
    currentRoute?: ResolvedRouteLike,
  ): RouteLike | string {
    if (normalized.kind === 'path') {
      const resolvedPath = this.resolvePathForLocale(normalized.path, targetLocale)
      const prefix = `/${targetLocale}`
      return this.applyBaseUrl(targetLocale, joinUrl(prefix, withLeadingSlash(resolvedPath)))
    }

    const { inputName, sourceRoute, resolved } = normalized
    if (inputName) {
      const unlocalizedByName = this.getPathForUnlocalizedRouteByName(inputName)
      if (unlocalizedByName !== null) return unlocalizedByName
    }
    const hasParams = sourceRoute.params && Object.keys(sourceRoute.params ?? {}).length > 0
    if (inputName && hasParams) {
      const routeWithParams = this.tryResolveByLocalizedNameWithParams(inputName, targetLocale, sourceRoute.params ?? {}, sourceRoute)
      if (routeWithParams !== null) {
        const resolvedPath = routeWithParams.path ?? ''
        const { pathWithoutLocale } = this.getPathWithoutLocale(resolvedPath)
        const pathWithLocale =
          pathWithoutLocale === '/' || pathWithoutLocale === ''
            ? `/${targetLocale}`
            : joinUrl(`/${targetLocale}`, withLeadingSlash(pathWithoutLocale))
        const fullPathWithLocale = buildUrl(pathWithLocale, routeWithParams.query, routeWithParams.hash)
        const routeWithPath: RouteLike = {
          ...routeWithParams,
          path: pathWithLocale,
          fullPath: fullPathWithLocale,
        }
        return this.applyBaseUrl(targetLocale, routeWithPath)
      }
    }

    const unlocalizedPath = this.getPathForUnlocalizedRoute(resolved)
    if (unlocalizedPath !== null) return this.applyBaseUrl(targetLocale, unlocalizedPath)

    const customSegment = this.getCustomPathSegment(resolved, targetLocale)
    if (customSegment !== null) {
      const prefix = `/${targetLocale}`
      return this.applyBaseUrl(targetLocale, joinUrl(prefix, withLeadingSlash(customSegment)))
    }
    const baseName = this.getRouteBaseName(resolved) ?? inputName ?? resolved.name?.toString() ?? null
    if (inputName && !hasParams) {
      let routeByLocalizedName = this.tryResolveByLocalizedName(inputName, targetLocale, sourceRoute)
      const prefix = this.getLocalizedRouteNamePrefix()
      if (routeByLocalizedName === null && baseName != null && baseName !== inputName && inputName.startsWith(prefix)) {
        routeByLocalizedName = this.tryResolveByLocalizedName(baseName, targetLocale, sourceRoute)
      }
      if (routeByLocalizedName !== null) {
        // Router may return path without locale prefix (e.g. Nuxt file-based /contact). For prefix_and_default
        // we always need path with locale (e.g. /en/contact).
        const resolvedPath = routeByLocalizedName.path ?? ''
        const { pathWithoutLocale } = this.getPathWithoutLocale(resolvedPath)
        const pathWithLocale =
          pathWithoutLocale === '/' || pathWithoutLocale === ''
            ? `/${targetLocale}`
            : joinUrl(`/${targetLocale}`, withLeadingSlash(pathWithoutLocale))
        const fullPathWithLocale = buildUrl(pathWithLocale, routeByLocalizedName.query, routeByLocalizedName.hash)
        const routeWithPath: RouteLike = {
          ...routeByLocalizedName,
          path: pathWithLocale,
          fullPath: fullPathWithLocale,
        }
        return this.applyBaseUrl(targetLocale, routeWithPath)
      }
    }
    if (resolved.path && resolved.path !== '/' && resolved.name) {
      const { pathWithoutLocale } = this.getPathWithoutLocaleAndBaseName(resolved)
      if (pathWithoutLocale && pathWithoutLocale !== '/') {
        return this.applyBaseUrl(targetLocale, joinUrl(`/${targetLocale}`, withLeadingSlash(pathWithoutLocale)))
      }
    }

    const fromLocale = currentRoute ? this.detectLocaleFromName(currentRoute.name) : this.detectLocaleFromName(resolved.name)

    const fallbackBaseName = fromLocale ? this.getBaseRouteName(resolved, fromLocale) : baseName

    if (!fallbackBaseName) {
      // Never return unprefixed path for prefix_and_default. Build path from resolved.
      const { pathWithoutLocale } = this.getPathWithoutLocale(resolved.path ?? '/')
      const pathWithLocale =
        pathWithoutLocale === '/' || pathWithoutLocale === '' ? `/${targetLocale}` : joinUrl(`/${targetLocale}`, withLeadingSlash(pathWithoutLocale))
      const fullPathWithLocale = buildUrl(pathWithLocale, sourceRoute.query, sourceRoute.hash)
      return this.applyBaseUrl(targetLocale, {
        ...sourceRoute,
        path: pathWithLocale,
        fullPath: fullPathWithLocale,
      })
    }

    const targetName = this.buildLocalizedName(fallbackBaseName, targetLocale)

    const pathWithoutLocale = isIndexRouteName(fallbackBaseName) ? '/' : joinUrl('/', transformNameKeyToPath(fallbackBaseName))
    const pathForLocale = joinUrl(`/${targetLocale}`, withLeadingSlash(pathWithoutLocale))
    const withBase = this.applyBaseUrl(targetLocale, pathForLocale)
    const pathStr = typeof withBase === 'string' ? withBase : ((withBase as RouteLike).path ?? pathForLocale)

    const newRoute: RouteLike = {
      name: targetName,
      path: pathStr,
      fullPath: pathStr,
      params: { ...resolved.params, ...sourceRoute.params },
      query: { ...resolved.query, ...sourceRoute.query },
      hash: sourceRoute.hash ?? resolved.hash,
    }
    return this.applyBaseUrl(targetLocale, newRoute)
  }

  override getCanonicalPath(route: ResolvedRouteLike, targetLocale: string): string | null {
    const segment = this.getCustomPathSegment(route, targetLocale)
    if (!segment) return null
    return joinUrl(`/${targetLocale}`, withLeadingSlash(segment))
  }

  protected detectLocaleFromName(name: string | null): string | null {
    if (!name) return null
    for (const locale of this.ctx.locales) {
      if (name.endsWith(`-${locale.code}`)) {
        return locale.code
      }
    }
    return null
  }

  resolveLocaleFromPath(path: string): string | null {
    const { localeFromPath } = this.getPathWithoutLocale(path)
    return localeFromPath
  }

  getRedirect(currentPath: string, detectedLocale: string): string | null {
    const { pathWithoutLocale, localeFromPath } = this.getPathWithoutLocale(currentPath)
    // Unlocalized routes (globalLocaleRoutes[key] === false): redirect /locale/path to /path
    const gr = this.ctx.globalLocaleRoutes
    if (gr && localeFromPath !== null) {
      const pathKey = pathWithoutLocale === '/' ? '/' : withoutLeadingSlash(pathWithoutLocale)
      if (gr[pathWithoutLocale] === false || gr[pathKey] === false) {
        return normalizePathForCompare(pathWithoutLocale === '/' ? '/' : pathWithoutLocale)
      }
    }
    const expectedPath = this.buildPathWithPrefix(pathWithoutLocale, detectedLocale)
    const currentPathOnly = getCleanPath(currentPath)
    if (localeFromPath === detectedLocale && isSamePath(currentPathOnly, expectedPath)) {
      return null
    }
    return expectedPath
  }

  private buildPathWithPrefix(pathWithoutLocale: string, locale: string): string {
    const resolved = this.resolvePathForLocale(pathWithoutLocale, locale)
    if (resolved === '/' || resolved === '') {
      return `/${locale}`
    }
    return joinUrl(`/${locale}`, resolved)
  }

  /**
   * Formats path for router.resolve.
   * prefix_and_default: always add locale prefix.
   */
  formatPathForResolve(path: string, fromLocale: string, _toLocale: string): string {
    return `/${fromLocale}${path}`
  }

  /**
   * prefix_and_default: both / and /locale are valid for any locale.
   * Does NOT redirect if user explicitly navigates to a locale path.
   * Only redirects from paths without locale prefix.
   */
  getClientRedirect(currentPath: string, _preferredLocale: string): string | null {
    const { pathWithoutLocale, localeFromPath } = this.getPathWithoutLocale(currentPath)

    // Check if route is unlocalized
    const gr = this.ctx.globalLocaleRoutes
    const pathKey = pathWithoutLocale === '/' ? '/' : pathWithoutLocale.replace(/^\//, '')
    if (gr && (gr[pathWithoutLocale] === false || gr[pathKey] === false)) {
      return null // Unlocalized routes - no redirect
    }

    // URL has locale prefix - user explicitly navigated here, don't redirect
    if (localeFromPath !== null) return null

    // Root path without locale is valid for any locale - no redirect
    if (currentPath === '/' || currentPath === '') return null

    // Non-root path without locale - this shouldn't happen normally in prefix_and_default
    // but if it does, we could redirect. For now, let Vue Router handle it.
    return null
  }
}

/** Alias for Nuxt alias consumption. */
export { PrefixAndDefaultPathStrategy as Strategy }
