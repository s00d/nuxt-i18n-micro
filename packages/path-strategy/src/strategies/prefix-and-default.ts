import type { NormalizedRouteInput, ResolvedRouteLike, RouteLike, SwitchLocaleOptions } from '../core/types'
import { BasePathStrategy } from './base-strategy'
import { isSamePath, withLeadingSlash, withoutLeadingSlash } from 'ufo'
import { buildUrl, getCleanPath, joinUrl, normalizePath, normalizePathForCompare, transformNameKeyToPath } from '../utils/path'
import { isIndexRouteName } from '../utils/route-name'

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

  override switchLocaleRoute(
    fromLocale: string,
    toLocale: string,
    route: ResolvedRouteLike,
    options: SwitchLocaleOptions,
  ): RouteLike | string {
    const baseName = this.getBaseRouteName(route, fromLocale)
    if (!baseName) return route

    const targetName = this.buildLocalizedName(baseName, toLocale)

    if (this.ctx.router.hasRoute(targetName)) {
      const i18nParams = options.i18nRouteParams?.[toLocale] || {}
      const newParams = { ...(route.params || {}), ...i18nParams }
      delete (newParams as Record<string, unknown>).locale

      return this.applyBaseUrl(toLocale, {
        name: targetName,
        params: newParams,
        query: route.query,
        hash: route.hash,
      }) as RouteLike
    }

    return { ...route, name: targetName }
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
      const routeWithParams = this.tryResolveByLocalizedNameWithParams(
        inputName,
        targetLocale,
        sourceRoute.params ?? {},
        sourceRoute,
      )
      if (routeWithParams !== null) {
        const resolvedPath = routeWithParams.path ?? ''
        const { pathWithoutLocale } = this.getPathWithoutLocale(resolvedPath)
        const pathWithLocale = pathWithoutLocale === '/' || pathWithoutLocale === ''
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
        const pathWithLocale = pathWithoutLocale === '/' || pathWithoutLocale === ''
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

    const fromLocale = currentRoute
      ? this.detectLocaleFromName(currentRoute.name)
      : this.detectLocaleFromName(resolved.name)

    const fallbackBaseName = fromLocale
      ? this.getBaseRouteName(resolved, fromLocale)
      : baseName

    if (!fallbackBaseName) {
      // Never return unprefixed path for prefix_and_default. Build path from resolved.
      const { pathWithoutLocale } = this.getPathWithoutLocale(resolved.path ?? '/')
      const pathWithLocale = pathWithoutLocale === '/' || pathWithoutLocale === ''
        ? `/${targetLocale}`
        : joinUrl(`/${targetLocale}`, withLeadingSlash(pathWithoutLocale))
      const fullPathWithLocale = buildUrl(pathWithLocale, sourceRoute.query, sourceRoute.hash)
      return this.applyBaseUrl(targetLocale, {
        ...sourceRoute,
        path: pathWithLocale,
        fullPath: fullPathWithLocale,
      })
    }

    const targetName = this.buildLocalizedName(fallbackBaseName, targetLocale)

    const pathWithoutLocale = isIndexRouteName(fallbackBaseName)
      ? '/'
      : joinUrl('/', transformNameKeyToPath(fallbackBaseName))
    const pathForLocale = joinUrl(`/${targetLocale}`, withLeadingSlash(pathWithoutLocale))
    const withBase = this.applyBaseUrl(targetLocale, pathForLocale)
    const pathStr = typeof withBase === 'string' ? withBase : (withBase as RouteLike).path ?? pathForLocale

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
}

/** Alias for Nuxt alias consumption. */
export { PrefixAndDefaultPathStrategy as Strategy }
