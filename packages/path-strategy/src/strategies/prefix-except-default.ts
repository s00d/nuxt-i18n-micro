import type { NormalizedRouteInput, ResolvedRouteLike, RouteLike, SwitchLocaleOptions } from '../core/types'
import { BasePathStrategy } from './base-strategy'
import { cleanDoubleSlashes, isSamePath, withoutLeadingSlash } from 'ufo'
import { getCleanPath, getPathSegments, joinUrl, normalizePath, normalizePathForCompare, nameKeyFirstSlash, nameKeyLastSlash, parentKeyFromSlashKey, lastPathSegment, transformNameKeyToPath } from '../utils/path'
import { isIndexRouteName } from '../utils/route-name'

export class PrefixExceptDefaultPathStrategy extends BasePathStrategy {
  /**
   * For this strategy a prefix is required for all non-default locales,
   * unless includeDefaultLocaleRoute is explicitly enabled.
   */
  protected shouldHavePrefix(locale: string): boolean {
    if (this.ctx.includeDefaultLocaleRoute) return true
    return locale !== this.ctx.defaultLocale
  }

  protected buildLocalizedPath(path: string, locale: string, _isCustom: boolean): string {
    if (!this.shouldHavePrefix(locale)) return normalizePath(path)
    return joinUrl(locale, normalizePath(path))
  }

  protected buildLocalizedRouteName(baseName: string, locale: string): string {
    if (!this.shouldHavePrefix(locale)) return baseName
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

    const targetName = this.shouldHavePrefix(toLocale)
      ? this.buildLocalizedName(baseName, toLocale)
      : baseName

    if (this.ctx.router.hasRoute(targetName)) {
      const i18nParams = options.i18nRouteParams?.[toLocale] || {}
      const newParams: Record<string, unknown> = { ...(route.params || {}), ...i18nParams }
      delete newParams.locale

      const newRoute: RouteLike = {
        name: targetName,
        params: newParams,
        query: route.query,
        hash: route.hash,
      }

      return this.applyBaseUrl(toLocale, newRoute)
    }

    return { ...route, name: targetName }
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
      const syntheticPath = '/' + keyLastSlash
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
        }
        else {
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
      const routeWithParams = this.tryResolveByLocalizedNameWithParams(
        inputName,
        targetLocale,
        sourceRoute.params ?? {},
        sourceRoute,
      )
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
        }
        else {
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
        }
        else if (isNested && customForTarget === null && pathWithoutLocale && pathWithoutLocale !== '/' && nestedInfo) {
          const parentPath = this.getParentPathForTarget(nestedInfo.parentKey, nestedInfo.keyWithSlash, targetLocale, currentRoute)
          const segment = lastPathSegment(pathWithoutLocale)
          pathToUse = parentPath ? joinUrl(parentPath, segment) : (pathWithoutLocale !== '/' ? pathWithoutLocale : null)
        }
        else {
          pathToUse = customForTarget !== null && !isNested
            ? normalizePath(customForTarget)
            : (pathWithoutLocale && pathWithoutLocale !== '/' ? pathWithoutLocale : null)
        }
        if (pathToUse) {
          const fromLocale = this.detectLocaleFromName(resolved.name)
          const baseName = fromLocale ? this.getBaseRouteName(resolved, fromLocale) : (resolved.name ? this.getRouteBaseName(resolved) : null)
          const targetName = baseName
            ? (this.shouldHavePrefix(targetLocale) ? this.buildLocalizedName(baseName, targetLocale) : baseName.toString())
            : undefined
          const pathForLocale = this.shouldHavePrefix(targetLocale)
            ? joinUrl(targetLocale, pathToUse)
            : pathToUse
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
      const syntheticPath = '/' + keyLastSlash
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
        }
        else {
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
      const routeByLocalizedName = this.tryResolveByLocalizedName(inputName, targetLocale, sourceRoute)
      if (routeByLocalizedName !== null) return this.preserveQueryAndHash(this.applyBaseUrl(targetLocale, routeByLocalizedName), sourceRoute)
    }

    const fromLocale = currentRoute
      ? this.detectLocaleFromName(currentRoute.name)
      : this.detectLocaleFromName(resolved.name)

    const baseName = fromLocale
      ? this.getBaseRouteName(resolved, fromLocale)
      : resolved.name ?? null

    if (!baseName) return sourceRoute

    const targetName = this.shouldHavePrefix(targetLocale)
      ? this.buildLocalizedName(baseName, targetLocale)
      : baseName.toString()

    const pathWithoutLocale = isIndexRouteName(baseName)
      ? '/'
      : joinUrl('/', transformNameKeyToPath(baseName))
    const pathForLocale = this.shouldHavePrefix(targetLocale)
      ? joinUrl(targetLocale, pathWithoutLocale)
      : pathWithoutLocale
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
  private getNestedRouteInfo(baseRouteName: string): { parentKey: string, keyWithSlash: string } | null {
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
  private getParentPathForTarget(
    parentKey: string,
    keyWithSlash: string,
    targetLocale: string,
    currentRoute?: ResolvedRouteLike,
  ): string {
    const gr = this.ctx.globalLocaleRoutes
    const parentRules = (parentKey && gr?.[parentKey] && typeof gr[parentKey] === 'object' && !Array.isArray(gr[parentKey]))
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
}

/** Alias for Nuxt alias consumption. */
export { PrefixExceptDefaultPathStrategy as Strategy }
