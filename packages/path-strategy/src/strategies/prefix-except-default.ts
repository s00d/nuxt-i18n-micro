import { cleanDoubleSlashes, isSamePath, withoutLeadingSlash } from 'ufo'
import type { NormalizedRouteInput, ResolvedRouteLike, RouteLike, SwitchLocaleOptions } from '../core/types'
import {
  getCleanPath,
  getPathSegments,
  joinUrl,
  lastPathSegment,
  nameKeyFirstSlash,
  nameKeyLastSlash,
  normalizePath,
  normalizePathForCompare,
  parentKeyFromSlashKey,
  transformNameKeyToPath,
} from '../utils/path'
import { isIndexRouteName } from '../utils/route-name'
import { BasePathStrategy } from './base-strategy'

export class PrefixExceptDefaultPathStrategy extends BasePathStrategy {
  /**
   * For this strategy a prefix is required for all non-default locales.
   */
  protected shouldHavePrefix(locale: string): boolean {
    if (locale === this.ctx.defaultLocale) return false
    // When locale has baseUrl with baseDefault=true, no prefix needed (uses root on separate domain)
    const localeObj = this.ctx.locales.find((l) => l.code === locale)
    if (localeObj?.baseUrl && localeObj?.baseDefault) return false
    return true
  }

  protected buildLocalizedPath(path: string, locale: string, _isCustom: boolean): string {
    if (!this.shouldHavePrefix(locale)) return normalizePath(path)
    return joinUrl(locale, normalizePath(path))
  }

  protected buildLocalizedRouteName(baseName: string, locale: string): string {
    if (!this.shouldHavePrefix(locale)) return baseName
    return this.buildLocalizedName(baseName, locale)
  }

  override switchLocaleRoute(fromLocale: string, toLocale: string, route: ResolvedRouteLike, options: SwitchLocaleOptions): RouteLike | string {
    const baseName = this.getBaseRouteName(route, fromLocale)
    if (!baseName) return route

    // For non-default locale, try route name with locale suffix first (custom paths),
    // then without suffix (standard routes like "localized-page")
    let targetName: string
    if (this.shouldHavePrefix(toLocale)) {
      const nameWithSuffix = this.buildLocalizedName(baseName, toLocale)
      const nameWithoutSuffix = `${this.getLocalizedRouteNamePrefix()}${baseName}`
      targetName = this.ctx.router.hasRoute(nameWithSuffix) ? nameWithSuffix : nameWithoutSuffix
    } else {
      targetName = baseName
    }

    if (this.ctx.router.hasRoute(targetName)) {
      const i18nParams = options.i18nRouteParams?.[toLocale] || {}
      const newParams: Record<string, unknown> = { ...(route.params || {}), ...i18nParams }
      // Always set locale param for non-default locales because routes may have /:locale(...) in path
      if (this.shouldHavePrefix(toLocale)) {
        newParams.locale = toLocale
      } else {
        delete newParams.locale
      }

      // Resolve to get the actual path for applyBaseUrl
      const resolved = this.ctx.router.resolve({ name: targetName, params: newParams })
      const newRoute: RouteLike = {
        name: targetName,
        params: newParams,
        path: resolved?.path,
        fullPath: resolved?.fullPath,
        query: route.query,
        hash: route.hash,
      }

      return this.applyBaseUrl(toLocale, newRoute)
    }

    // Fallback: build path-based route
    const pathWithoutLocale = route.path?.replace(new RegExp(`^/${fromLocale}`), '') || '/'
    const targetPath = this.buildLocalizedPath(pathWithoutLocale, toLocale, false)
    return this.applyBaseUrl(toLocale, { path: targetPath, query: route.query, hash: route.hash })
  }

  protected override resolveLocaleRoute(
    targetLocale: string,
    normalized: NormalizedRouteInput,
    currentRoute?: ResolvedRouteLike,
  ): RouteLike | string {
    if (normalized.kind === 'path') {
      const path = this.resolvePathForLocale(normalized.path, targetLocale)
      if (!this.shouldHavePrefix(targetLocale)) return this.applyBaseUrl(targetLocale, path)
      const newPath = joinUrl(targetLocale, path)
      return this.applyBaseUrl(targetLocale, newPath)
    }

    const { inputName, sourceRoute, resolved } = normalized
    if (inputName) {
      const unlocalizedByName = this.getPathForUnlocalizedRouteByName(inputName)
      if (unlocalizedByName !== null) return this.preserveQueryAndHash(unlocalizedByName, sourceRoute)
      const keyLastSlash = nameKeyLastSlash(inputName)
      const syntheticPath = `/${keyLastSlash}`
      const syntheticResolved: ResolvedRouteLike = {
        name: inputName,
        path: syntheticPath,
        fullPath: syntheticPath,
        params: sourceRoute.params ?? {},
      }
      const customBySynthetic = this.getCustomPathSegment(syntheticResolved, targetLocale)
      if (customBySynthetic !== null) {
        const nestedInfo = this.getNestedRouteInfo(inputName)
        let pathNorm: string
        if (nestedInfo) {
          const parentPath = this.getParentPathForTarget(nestedInfo.parentKey, nestedInfo.keyWithSlash, targetLocale, currentRoute)
          const segment = customBySynthetic.startsWith('/') ? customBySynthetic.slice(1) : customBySynthetic
          pathNorm = parentPath ? joinUrl(parentPath, segment) : normalizePath(customBySynthetic)
        } else {
          pathNorm = normalizePath(customBySynthetic)
        }
        if (!this.shouldHavePrefix(targetLocale)) {
          return this.preserveQueryAndHash(this.applyBaseUrl(targetLocale, pathNorm), sourceRoute)
        }
        const newPath = joinUrl(targetLocale, pathNorm)
        return this.preserveQueryAndHash(this.applyBaseUrl(targetLocale, newPath), sourceRoute)
      }
    }

    const hasParams = sourceRoute.params && Object.keys(sourceRoute.params ?? {}).length > 0
    if (inputName && hasParams) {
      // For default locale, try resolving base route name first (without localized prefix)
      if (!this.shouldHavePrefix(targetLocale) && this.ctx.router.hasRoute(inputName)) {
        const resolved = this.ctx.router.resolve({
          name: inputName,
          params: sourceRoute.params,
          query: sourceRoute.query,
          hash: sourceRoute.hash,
        })
        if (resolved?.path && resolved.path !== '/') {
          const routeResult: RouteLike = {
            name: inputName,
            path: resolved.path,
            fullPath: resolved.fullPath,
            params: resolved.params,
            query: resolved.query ?? sourceRoute.query,
            hash: resolved.hash ?? sourceRoute.hash,
          }
          return this.preserveQueryAndHash(this.applyBaseUrl(targetLocale, routeResult), sourceRoute)
        }
      }
      const routeWithParams = this.tryResolveByLocalizedNameWithParams(inputName, targetLocale, sourceRoute.params ?? {}, sourceRoute)
      if (routeWithParams !== null) {
        const applied = this.applyBaseUrl(targetLocale, routeWithParams)
        return this.preserveQueryAndHash(applied, sourceRoute)
      }
    }

    if (resolved.name != null) {
      const unlocalizedPath = this.getPathForUnlocalizedRoute(resolved)
      if (unlocalizedPath !== null) {
        return this.preserveQueryAndHash(this.applyBaseUrl(targetLocale, unlocalizedPath), sourceRoute)
      }
      // When route has custom path for target locale (globalLocaleRoutes), build path string so href is correct
      const customSegment = this.getCustomPathSegment(resolved, targetLocale)
      if (customSegment !== null) {
        const routeName = resolved.name?.toString() ?? inputName ?? ''
        const nestedInfo = routeName ? this.getNestedRouteInfo(routeName) : null
        let path: string
        if (nestedInfo) {
          const parentPath = this.getParentPathForTarget(nestedInfo.parentKey, nestedInfo.keyWithSlash, targetLocale, currentRoute)
          const segment = customSegment.startsWith('/') ? customSegment.slice(1) : customSegment
          path = joinUrl(parentPath, segment)
        } else {
          path = normalizePath(customSegment)
        }
        if (!this.shouldHavePrefix(targetLocale)) {
          return this.preserveQueryAndHash(this.applyBaseUrl(targetLocale, path), sourceRoute)
        }
        const newPath = joinUrl(targetLocale, path)
        return this.preserveQueryAndHash(this.applyBaseUrl(targetLocale, newPath), sourceRoute)
      }
      // Use resolved path when valid. Prefer custom path for target locale; for nested routes build parent path + custom segment.
      if (resolved.path && resolved.path !== '/' && resolved.name) {
        const { pathWithoutLocale, baseRouteName } = this.getPathWithoutLocaleAndBaseName(resolved)
        const customForTarget = this.getCustomPathSegment(resolved, targetLocale)
        const nestedInfo = baseRouteName ? this.getNestedRouteInfo(baseRouteName) : null
        const isNested = !!nestedInfo
        let pathToUse: string | null
        if (customForTarget !== null && isNested && nestedInfo) {
          const parentPath = this.getParentPathForTarget(nestedInfo.parentKey, nestedInfo.keyWithSlash, targetLocale, currentRoute)
          const segment = customForTarget.startsWith('/') ? customForTarget.slice(1) : customForTarget
          pathToUse = joinUrl(parentPath, segment)
        } else if (isNested && customForTarget === null && pathWithoutLocale && pathWithoutLocale !== '/' && nestedInfo) {
          const parentPath = this.getParentPathForTarget(nestedInfo.parentKey, nestedInfo.keyWithSlash, targetLocale, currentRoute)
          const segment = lastPathSegment(pathWithoutLocale)
          pathToUse = parentPath ? joinUrl(parentPath, segment) : pathWithoutLocale !== '/' ? pathWithoutLocale : null
        } else {
          pathToUse =
            customForTarget !== null && !isNested
              ? normalizePath(customForTarget)
              : pathWithoutLocale && pathWithoutLocale !== '/'
                ? pathWithoutLocale
                : null
        }
        if (pathToUse) {
          const fromLocale = this.detectLocaleFromName(resolved.name)
          const baseName = fromLocale ? this.getBaseRouteName(resolved, fromLocale) : resolved.name ? this.getRouteBaseName(resolved) : null
          const targetName = baseName
            ? this.shouldHavePrefix(targetLocale)
              ? this.buildLocalizedName(baseName, targetLocale)
              : baseName.toString()
            : undefined
          const pathForLocale = this.shouldHavePrefix(targetLocale) ? joinUrl(targetLocale, pathToUse) : pathToUse
          const routeWithName: RouteLike = {
            ...(targetName ? { name: targetName } : {}),
            path: pathForLocale,
            fullPath: pathForLocale,
            params: { ...resolved.params, ...sourceRoute.params },
            query: { ...resolved.query, ...sourceRoute.query },
            hash: sourceRoute.hash ?? resolved.hash,
          }
          return this.preserveQueryAndHash(this.applyBaseUrl(targetLocale, routeWithName), sourceRoute)
        }
      }
    }
    // When resolved failed (e.g. router has only localized names), try getCustomPathSegment by synthetic path from inputName
    if (inputName) {
      const keyLastSlash = nameKeyLastSlash(inputName)
      const syntheticPath = `/${keyLastSlash}`
      const syntheticResolved: ResolvedRouteLike = {
        name: inputName,
        path: syntheticPath,
        fullPath: syntheticPath,
        params: sourceRoute.params ?? {},
      }
      const customBySynthetic = this.getCustomPathSegment(syntheticResolved, targetLocale)
      if (customBySynthetic !== null) {
        const nestedInfo = this.getNestedRouteInfo(inputName)
        let pathNorm: string
        if (nestedInfo) {
          const parentPath = this.getParentPathForTarget(nestedInfo.parentKey, nestedInfo.keyWithSlash, targetLocale, currentRoute)
          const segment = customBySynthetic.startsWith('/') ? customBySynthetic.slice(1) : customBySynthetic
          pathNorm = joinUrl(parentPath || '/', segment)
        } else {
          pathNorm = normalizePath(customBySynthetic)
        }
        if (!this.shouldHavePrefix(targetLocale)) {
          return this.preserveQueryAndHash(this.applyBaseUrl(targetLocale, pathNorm), sourceRoute)
        }
        const newPath = joinUrl(targetLocale, pathNorm)
        return this.preserveQueryAndHash(this.applyBaseUrl(targetLocale, newPath), sourceRoute)
      }
    }
    if (inputName && !hasParams) {
      // For default locale, try base route name first (e.g. 'index' instead of 'localized-index')
      if (!this.shouldHavePrefix(targetLocale)) {
        // Default locale: try to resolve baseName directly
        if (this.ctx.router.hasRoute(inputName)) {
          const resolvedBase = this.ctx.router.resolve({
            name: inputName,
            params: sourceRoute.params,
            query: sourceRoute.query,
            hash: sourceRoute.hash,
          })
          if (resolvedBase?.path) {
            return this.preserveQueryAndHash(
              this.applyBaseUrl(targetLocale, {
                name: inputName,
                path: resolvedBase.path,
                fullPath: resolvedBase.fullPath,
                params: resolvedBase.params,
                query: resolvedBase.query ?? sourceRoute.query,
                hash: resolvedBase.hash ?? sourceRoute.hash,
              }),
              sourceRoute,
            )
          }
        }
      } else {
        const routeByLocalizedName = this.tryResolveByLocalizedName(inputName, targetLocale, sourceRoute)
        if (routeByLocalizedName !== null) return this.preserveQueryAndHash(this.applyBaseUrl(targetLocale, routeByLocalizedName), sourceRoute)
      }
    }

    const fromLocale = currentRoute ? this.detectLocaleFromName(currentRoute.name) : this.detectLocaleFromName(resolved.name)

    const baseName = fromLocale ? this.getBaseRouteName(resolved, fromLocale) : (resolved.name ?? null)

    if (!baseName) return sourceRoute

    const targetName = this.shouldHavePrefix(targetLocale) ? this.buildLocalizedName(baseName, targetLocale) : baseName.toString()

    const pathWithoutLocale = isIndexRouteName(baseName) ? '/' : joinUrl('/', transformNameKeyToPath(baseName))
    const pathForLocale = this.shouldHavePrefix(targetLocale) ? joinUrl(targetLocale, pathWithoutLocale) : pathWithoutLocale
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

    return this.preserveQueryAndHash(this.applyBaseUrl(targetLocale, newRoute), sourceRoute)
  }

  override getCanonicalPath(route: ResolvedRouteLike, targetLocale: string): string | null {
    const segment = this.getCustomPathSegment(route, targetLocale)
    if (!segment) return null
    const normalized = segment.startsWith('/') ? segment : `/${segment}`
    if (!this.shouldHavePrefix(targetLocale)) {
      return cleanDoubleSlashes(normalized)
    }
    return cleanDoubleSlashes(`/${targetLocale}${normalized}`)
  }

  resolveLocaleFromPath(path: string): string | null {
    const { localeFromPath } = this.getPathWithoutLocale(path)
    if (localeFromPath) return localeFromPath
    return this.ctx.defaultLocale
  }

  getRedirect(currentPath: string, detectedLocale: string): string | null {
    const { pathWithoutLocale, localeFromPath } = this.getPathWithoutLocale(currentPath)
    const needPrefix = this.shouldHavePrefix(detectedLocale)

    // Unlocalized routes (globalLocaleRoutes[key] === false): redirect /locale/path to /path
    const gr = this.ctx.globalLocaleRoutes
    if (gr && localeFromPath !== null) {
      const pathKey = pathWithoutLocale === '/' ? '/' : withoutLeadingSlash(pathWithoutLocale)
      if (gr[pathWithoutLocale] === false || gr[pathKey] === false) {
        return normalizePathForCompare(pathWithoutLocale)
      }
    }

    if (localeFromPath !== null) {
      if (localeFromPath === this.ctx.defaultLocale) {
        return normalizePathForCompare(pathWithoutLocale)
      }
      if (localeFromPath === detectedLocale) {
        const expected = this.buildPathWithPrefix(pathWithoutLocale, detectedLocale)
        const currentPathOnly = getCleanPath(currentPath)
        return isSamePath(currentPathOnly, expected) ? null : expected
      }
      return this.buildPathWithPrefix(pathWithoutLocale, detectedLocale)
    }

    if (needPrefix) {
      return this.buildPathWithPrefix(pathWithoutLocale, detectedLocale)
    }
    const expectedPath = this.resolvePathForLocale(pathWithoutLocale, detectedLocale)
    const normalized = expectedPath.startsWith('/') ? expectedPath : `/${expectedPath}`
    const currentPathOnly = getCleanPath(currentPath)
    return isSamePath(currentPathOnly, normalized) ? null : normalized
  }

  override shouldReturn404(currentPath: string): string | null {
    const { pathWithoutLocale, localeFromPath } = this.getPathWithoutLocale(currentPath)

    // No locale in URL - no 404 from strategy perspective
    if (localeFromPath === null) return null

    // Default locale with prefix is 404 for prefix_except_default
    // e.g. /en when defaultLocale is 'en' and path is just the locale
    if (localeFromPath === this.ctx.defaultLocale && pathWithoutLocale === '/') {
      return 'Default locale should not have prefix'
    }

    // Delegate to base implementation for other checks
    return super.shouldReturn404(currentPath)
  }

  /** True if gr[key] is a locale rules object (Record<locale, path>). */
  private isLocaleRules(key: string): boolean {
    const gr = this.ctx.globalLocaleRoutes
    if (!gr || !key) return false
    const v = gr[key]
    return typeof v === 'object' && v !== null && !Array.isArray(v)
  }

  /**
   * For a nested route name (e.g. activity-locale-hiking), returns parent key and slash-key
   * when the route is nested (child or parent in globalLocaleRoutes). Otherwise null.
   */
  private getNestedRouteInfo(baseRouteName: string): { parentKey: string; keyWithSlash: string } | null {
    const gr = this.ctx.globalLocaleRoutes
    if (!gr) return null
    const keyLast = nameKeyLastSlash(baseRouteName)
    const keyFirst = nameKeyFirstSlash(baseRouteName)
    if (keyLast.includes('/') && this.isLocaleRules(keyLast)) {
      return { parentKey: parentKeyFromSlashKey(keyLast), keyWithSlash: keyLast }
    }
    if (keyFirst.includes('/') && this.isLocaleRules(keyFirst)) {
      return { parentKey: parentKeyFromSlashKey(keyFirst), keyWithSlash: keyFirst }
    }
    const parentLast = parentKeyFromSlashKey(keyLast)
    if (keyLast.includes('/') && parentLast && this.isLocaleRules(parentLast)) {
      return { parentKey: parentLast, keyWithSlash: keyLast }
    }
    const parentFirst = parentKeyFromSlashKey(keyFirst)
    if (keyFirst.includes('/') && parentFirst && this.isLocaleRules(parentFirst)) {
      return { parentKey: parentFirst, keyWithSlash: keyFirst }
    }
    return null
  }

  /** Parent path for target locale from gr or currentRoute. */
  private getParentPathForTarget(parentKey: string, keyWithSlash: string, targetLocale: string, currentRoute?: ResolvedRouteLike): string {
    const gr = this.ctx.globalLocaleRoutes
    const parentRules =
      parentKey && gr?.[parentKey] && typeof gr[parentKey] === 'object' && !Array.isArray(gr[parentKey])
        ? (gr[parentKey] as Record<string, string>)
        : null
    let parentPath = parentRules?.[targetLocale] ? normalizePath(parentRules[targetLocale]) : ''
    if (!parentPath && currentRoute?.path) {
      const curPathOnly = getCleanPath(currentRoute.path)
      const { pathWithoutLocale: curWithoutLocale } = this.getPathWithoutLocale(curPathOnly)
      parentPath = normalizePath(curWithoutLocale)
    }
    if (!parentPath) {
      const nameSegments = getPathSegments(keyWithSlash).slice(0, -1)
      parentPath = nameSegments.length ? joinUrl('/', ...nameSegments) : ''
    }
    return parentPath
  }

  private buildPathWithPrefix(pathWithoutLocale: string, locale: string): string {
    const resolved = this.resolvePathForLocale(pathWithoutLocale, locale)
    if (resolved === '/' || resolved === '') {
      return `/${locale}`
    }
    return joinUrl(`/${locale}`, resolved)
  }

  /**
   * Simple locale detector based on route name suffix.
   * Looks for known locale codes at the end of the name.
   */
  protected detectLocaleFromName(name: string | null): string | null {
    if (!name) return null
    for (const locale of this.ctx.locales) {
      if (name.endsWith(`-${locale.code}`)) {
        return locale.code
      }
    }
    return null
  }

  /**
   * Formats path for router.resolve.
   * prefix_except_default: add prefix only for non-default locale.
   */
  formatPathForResolve(path: string, fromLocale: string, toLocale: string): string {
    if (toLocale !== this.ctx.defaultLocale) {
      return `/${fromLocale}${path}`
    }
    return path
  }

  /**
   * prefix_except_default: redirect based on preferred locale.
   * Uses shouldHavePrefix to determine if locale needs prefix.
   * Also handles custom paths from globalLocaleRoutes.
   */
  getClientRedirect(currentPath: string, preferredLocale: string): string | null {
    const { pathWithoutLocale, localeFromPath } = this.getPathWithoutLocale(currentPath)

    // Check if route is unlocalized
    const gr = this.ctx.globalLocaleRoutes
    const pathKey = pathWithoutLocale === '/' ? '/' : withoutLeadingSlash(pathWithoutLocale)
    if (gr && (gr[pathWithoutLocale] === false || gr[pathKey] === false)) {
      return null // Unlocalized routes - no redirect
    }

    // URL has locale prefix - user explicitly navigated here, don't redirect
    if (localeFromPath !== null) return null

    // Resolve custom path for this locale
    const customPath = this.resolvePathForLocale(pathWithoutLocale, preferredLocale)
    const needsPrefix = this.shouldHavePrefix(preferredLocale)

    // Build target path
    let targetPath: string
    if (needsPrefix) {
      targetPath = cleanDoubleSlashes(`/${preferredLocale}${customPath.startsWith('/') ? customPath : `/${customPath}`}`)
    } else {
      targetPath = customPath.startsWith('/') ? customPath : `/${customPath}`
    }

    // Remove trailing slash (except for root)
    if (targetPath !== '/' && targetPath.endsWith('/')) {
      targetPath = targetPath.slice(0, -1)
    }

    // Only redirect if target differs from current
    const currentClean = getCleanPath(currentPath)
    if (isSamePath(currentClean, targetPath)) return null

    return targetPath
  }
}

/** Alias for Nuxt alias consumption. */
export { PrefixExceptDefaultPathStrategy as Strategy }
