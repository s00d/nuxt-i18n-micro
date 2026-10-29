import {
  buildCanonicalFromSegment,
  buildPrefixedPath,
  findLocalizedRouteName,
  isTrustedRouterRoute,
  isUnlocalizedRoute,
  preserveQueryAndHash,
  tryResolveByLocalizedName,
  tryResolveByLocalizedNameWithParams,
} from '../helpers'
import {
  cleanDoubleSlashes,
  getCleanPath,
  getPathSegments,
  hasKeys,
  isSamePath,
  joinUrl,
  lastPathSegment,
  nameKeyFirstSlash,
  nameKeyLastSlash,
  normalizePath,
  normalizePathForCompare,
  parentKeyFromSlashKey,
  joinNestedCustomPath,
  transformNameKeyToPath,
} from '../path'
import {
  analyzeRoute,
  findCustomRule,
  findRouterPathRule,
  getPathForUnlocalizedRoute,
  getPathForUnlocalizedRouteByName,
  isIndexRouteName,
  isDashedNamePath,
  isRuleValueForPath,
  isTopLevelDashedRoute,
  resolveCustomPath,
  resolvePathWithParams,
} from '../resolver'
import type { NormalizedRouteInput, ResolvedRouteLike, RouteLike, SwitchLocaleOptions } from '../types'
import { BasePathStrategy } from './base-strategy'

export class PrefixExceptDefaultPathStrategy extends BasePathStrategy {
  protected shouldHavePrefix(locale: string): boolean {
    if (locale === this.ctx.defaultLocale) return false
    const localeObj = this.ctx.locales.find((l) => l.code === locale)
    if (localeObj?.baseUrl && localeObj?.baseDefault) return false
    return true
  }

  override buildLocalizedPath(path: string, locale: string, _isCustom: boolean): string {
    if (!this.shouldHavePrefix(locale)) return normalizePath(path)
    return joinUrl(locale, normalizePath(path))
  }

  override buildLocalizedRouteName(baseName: string, locale: string): string {
    if (!this.shouldHavePrefix(locale)) return baseName
    return this.buildLocalizedName(baseName, locale)
  }

  switchLocaleRoute(fromLocale: string, toLocale: string, route: ResolvedRouteLike, options: SwitchLocaleOptions): RouteLike | string {
    const baseName = this.getBaseRouteName(route, fromLocale)
    if (!baseName) return route

    const needsPrefix = this.shouldHavePrefix(toLocale)
    let targetName: string

    if (needsPrefix) {
      const found = findLocalizedRouteName(this.ctx.router, this.getLocalizedRouteNamePrefix(), baseName, toLocale)
      targetName = found ? found.name : this.buildLocalizedName(baseName, toLocale)
    } else {
      targetName = baseName
    }

    if (this.ctx.router.hasRoute(targetName)) {
      const i18nParams = options.i18nRouteParams?.[toLocale] || {}
      const newParams: Record<string, unknown> = { ...(route.params || {}), ...i18nParams }
      if (needsPrefix) {
        newParams.locale = toLocale
      } else {
        delete newParams.locale
      }

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

    const localePrefix = `/${fromLocale}`
    const pathWithoutLocale = route.path?.startsWith(localePrefix) ? route.path.slice(localePrefix.length) || '/' : route.path || '/'
    const targetPath = this.buildLocalizedPath(pathWithoutLocale, toLocale, false)
    return this.applyBaseUrl(toLocale, { path: targetPath, query: route.query, hash: route.hash })
  }

  resolveLocaleRoute(targetLocale: string, normalized: NormalizedRouteInput, currentRoute?: ResolvedRouteLike): RouteLike | string {
    if (normalized.kind === 'path') {
      const path = this.resolvePathForLocale(normalized.path, targetLocale)
      if (!this.shouldHavePrefix(targetLocale)) return this.applyBaseUrl(targetLocale, path)
      return this.applyBaseUrl(targetLocale, joinUrl(targetLocale, path))
    }

    const { inputName, sourceRoute } = normalized
    const needsPrefix = this.shouldHavePrefix(targetLocale)
    const hasGR = this.ctx._hasGR === true
    const hasParams = sourceRoute.params !== null && sourceRoute.params !== undefined && hasKeys(sourceRoute.params as Record<string, unknown>)

    if (!hasGR) {
      return this.resolveLocaleRouteSimple(targetLocale, inputName, sourceRoute, normalized.resolved, needsPrefix, hasParams, currentRoute)
    }

    if (inputName) {
      const unlocalizedByName = getPathForUnlocalizedRouteByName(this.ctx, inputName)
      if (unlocalizedByName !== null) return preserveQueryAndHash(unlocalizedByName, sourceRoute)

      // The router holds every localized route with its build-time path: ask it first, before
      // the input route is even resolved. The globalLocaleRoutes heuristics run only when it has no such route.
      const viaRouter = this.resolveViaRouter(inputName, targetLocale, needsPrefix, sourceRoute, hasParams)
      if (viaRouter !== null) return preserveQueryAndHash(this.applyBaseUrl(targetLocale, viaRouter), sourceRoute)
    }

    return this.resolveLocaleRouteFull(targetLocale, inputName, sourceRoute, normalized.resolved, needsPrefix, hasParams, currentRoute)
  }

  private resolveLocaleRouteSimple(
    targetLocale: string,
    inputName: string | null,
    sourceRoute: RouteLike,
    resolved: ResolvedRouteLike,
    needsPrefix: boolean,
    hasParams: boolean,
    currentRoute?: ResolvedRouteLike,
  ): RouteLike | string {
    const prefix = this.getLocalizedRouteNamePrefix()

    if (inputName && hasParams) {
      if (!needsPrefix && this.ctx.router.hasRoute(inputName)) {
        const res = this.ctx.router.resolve({ name: inputName, params: sourceRoute.params, query: sourceRoute.query, hash: sourceRoute.hash })
        if (res?.path && res.path !== '/') {
          return preserveQueryAndHash(
            this.applyBaseUrl(targetLocale, {
              name: inputName,
              path: res.path,
              fullPath: res.fullPath,
              params: res.params,
              query: res.query ?? sourceRoute.query,
              hash: res.hash ?? sourceRoute.hash,
            }),
            sourceRoute,
          )
        }
      }
      const routeWithParams = tryResolveByLocalizedNameWithParams(
        this.ctx.router,
        prefix,
        inputName,
        targetLocale,
        sourceRoute.params ?? {},
        sourceRoute,
      )
      if (routeWithParams !== null) return preserveQueryAndHash(this.applyBaseUrl(targetLocale, routeWithParams), sourceRoute)
    }

    if (resolved.name !== null && resolved.name !== undefined && resolved.path && resolved.path !== '/') {
      const analysis = analyzeRoute(this.ctx, resolved)
      const { pathWithoutLocale, baseRouteName } = analysis
      if (pathWithoutLocale && pathWithoutLocale !== '/') {
        const targetName = baseRouteName ? (needsPrefix ? this.buildLocalizedName(baseRouteName, targetLocale) : baseRouteName) : undefined
        const pathForLocale = needsPrefix ? joinUrl(targetLocale, pathWithoutLocale) : pathWithoutLocale
        const route: RouteLike = { path: pathForLocale, fullPath: pathForLocale }
        if (targetName) route.name = targetName
        if (resolved.params || sourceRoute.params)
          route.params = resolved.params !== sourceRoute.params ? Object.assign({}, resolved.params, sourceRoute.params) : resolved.params
        if (resolved.query || sourceRoute.query)
          route.query = resolved.query !== sourceRoute.query ? Object.assign({}, resolved.query, sourceRoute.query) : resolved.query
        route.hash = sourceRoute.hash || resolved.hash
        return preserveQueryAndHash(this.applyBaseUrl(targetLocale, route), sourceRoute)
      }
    }

    if (inputName && !hasParams) {
      if (!needsPrefix) {
        const baseName = this.getRouteBaseName(resolved) ?? inputName
        if (this.ctx.router.hasRoute(baseName)) {
          const res = this.ctx.router.resolve({ name: baseName, params: sourceRoute.params, query: sourceRoute.query, hash: sourceRoute.hash })
          if (res?.path) {
            return preserveQueryAndHash(
              this.applyBaseUrl(targetLocale, {
                name: baseName,
                path: res.path,
                fullPath: res.fullPath,
                params: res.params,
                query: res.query ?? sourceRoute.query,
                hash: res.hash ?? sourceRoute.hash,
              }),
              sourceRoute,
            )
          }
        }
      } else {
        const routeByLocalizedName = tryResolveByLocalizedName(this.ctx.router, prefix, inputName, targetLocale, sourceRoute)
        if (routeByLocalizedName !== null) return preserveQueryAndHash(this.applyBaseUrl(targetLocale, routeByLocalizedName), sourceRoute)
      }
    }

    return this.resolveLocaleRouteFallback(targetLocale, resolved, sourceRoute, needsPrefix, currentRoute)
  }

  private resolveLocaleRouteFull(
    targetLocale: string,
    inputName: string | null,
    sourceRoute: RouteLike,
    resolved: ResolvedRouteLike,
    needsPrefix: boolean,
    hasParams: boolean,
    currentRoute?: ResolvedRouteLike,
  ): RouteLike | string {
    const prefix = this.getLocalizedRouteNamePrefix()

    if (inputName) {
      const pathForNesting = resolved?.path && resolved.path !== '/' ? analyzeRoute(this.ctx, resolved).pathWithoutLocale : null

      // Prefer the real router path for top-level dashed pages so we never look up
      // nested file-path keys (about/team) via a synthetic /about/team path.
      if (isTopLevelDashedRoute(this.ctx, inputName, pathForNesting)) {
        const topLevelResolved: ResolvedRouteLike = {
          name: inputName,
          path: pathForNesting!,
          fullPath: pathForNesting!,
          params: sourceRoute.params ?? {},
        }
        const rule = findCustomRule(this.ctx, topLevelResolved, targetLocale)
        if (rule !== null) {
          return this.buildNestedCustomResult(
            rule,
            topLevelResolved.params,
            inputName,
            targetLocale,
            needsPrefix,
            sourceRoute,
            currentRoute,
            pathForNesting,
          )
        }
      } else {
        const keyLastSlash = nameKeyLastSlash(inputName)
        const syntheticResolved: ResolvedRouteLike = {
          name: inputName,
          path: `/${keyLastSlash}`,
          fullPath: `/${keyLastSlash}`,
          params: sourceRoute.params ?? {},
        }
        let rule = findCustomRule(this.ctx, syntheticResolved, targetLocale)
        // One dashed name can match several rules (about/team and about-team). Prefer the rule
        // the router path was built from; the synthetic /about/team probe is the fallback.
        // Same path means same lookup keys, so only a differing router path can find another rule.
        let isRouterRule = false
        if (rule !== null && pathForNesting && pathForNesting !== syntheticResolved.path) {
          isRouterRule = this.isRouterPathRule(rule, inputName, pathForNesting, syntheticResolved.params)
          if (!isRouterRule) {
            const routerRule = findRouterPathRule(
              this.ctx,
              inputName,
              pathForNesting,
              syntheticResolved.path!,
              this.getRouteOwnLocale(inputName),
              targetLocale,
              syntheticResolved.params,
            )
            if (routerRule !== null) {
              rule = routerRule
              isRouterRule = true
            }
          }
        }
        if (rule !== null) {
          return this.buildNestedCustomResult(
            rule,
            syntheticResolved.params,
            inputName,
            targetLocale,
            needsPrefix,
            sourceRoute,
            currentRoute,
            pathForNesting,
            isRouterRule,
          )
        }
      }
    }

    if (inputName && hasParams) {
      if (!needsPrefix && this.ctx.router.hasRoute(inputName)) {
        const res = this.ctx.router.resolve({ name: inputName, params: sourceRoute.params, query: sourceRoute.query, hash: sourceRoute.hash })
        if (res?.path && res.path !== '/') {
          return preserveQueryAndHash(
            this.applyBaseUrl(targetLocale, {
              name: inputName,
              path: res.path,
              fullPath: res.fullPath,
              params: res.params,
              query: res.query ?? sourceRoute.query,
              hash: res.hash ?? sourceRoute.hash,
            }),
            sourceRoute,
          )
        }
      }
      const routeWithParams = tryResolveByLocalizedNameWithParams(
        this.ctx.router,
        prefix,
        inputName,
        targetLocale,
        sourceRoute.params ?? {},
        sourceRoute,
      )
      if (routeWithParams !== null) return preserveQueryAndHash(this.applyBaseUrl(targetLocale, routeWithParams), sourceRoute)
    }

    if (resolved.name !== null && resolved.name !== undefined) {
      const analysis = analyzeRoute(this.ctx, resolved)

      const unlocalizedPath = getPathForUnlocalizedRoute(this.ctx, resolved, analysis)
      if (unlocalizedPath !== null) return preserveQueryAndHash(this.applyBaseUrl(targetLocale, unlocalizedPath), sourceRoute)

      const rule = findCustomRule(this.ctx, resolved, targetLocale, analysis)
      if (rule !== null) {
        const routeName = resolved.name?.toString() ?? inputName ?? ''
        return this.buildNestedCustomResult(
          rule,
          resolved.params,
          routeName,
          targetLocale,
          needsPrefix,
          sourceRoute,
          currentRoute,
          analysis.pathWithoutLocale,
        )
      }

      if (resolved.path && resolved.path !== '/' && resolved.name) {
        const { pathWithoutLocale, baseRouteName } = analysis
        const nestedInfo = baseRouteName ? this.getNestedRouteInfo(baseRouteName, pathWithoutLocale) : null
        let pathToUse: string | null
        if (nestedInfo && pathWithoutLocale && pathWithoutLocale !== '/') {
          const parentPath = this.getParentPathForTarget(nestedInfo.parentKey, nestedInfo.keyWithSlash, targetLocale, currentRoute)
          const segment = lastPathSegment(pathWithoutLocale)
          pathToUse = parentPath ? joinUrl(parentPath, segment) : pathWithoutLocale !== '/' ? pathWithoutLocale : null
        } else {
          pathToUse = pathWithoutLocale && pathWithoutLocale !== '/' ? pathWithoutLocale : null
        }
        if (pathToUse) {
          const targetName = baseRouteName ? (needsPrefix ? this.buildLocalizedName(baseRouteName, targetLocale) : baseRouteName) : undefined
          const pathForLocale = needsPrefix ? joinUrl(targetLocale, pathToUse) : pathToUse
          const route: RouteLike = { path: pathForLocale, fullPath: pathForLocale }
          if (targetName) route.name = targetName
          if (resolved.params || sourceRoute.params)
            route.params = resolved.params !== sourceRoute.params ? Object.assign({}, resolved.params, sourceRoute.params) : resolved.params
          if (resolved.query || sourceRoute.query)
            route.query = resolved.query !== sourceRoute.query ? Object.assign({}, resolved.query, sourceRoute.query) : resolved.query
          route.hash = sourceRoute.hash || resolved.hash
          return preserveQueryAndHash(this.applyBaseUrl(targetLocale, route), sourceRoute)
        }
      }
    }

    if (inputName && !hasParams) {
      if (!needsPrefix) {
        if (this.ctx.router.hasRoute(inputName)) {
          const resolvedBase = this.ctx.router.resolve({
            name: inputName,
            params: sourceRoute.params,
            query: sourceRoute.query,
            hash: sourceRoute.hash,
          })
          if (resolvedBase?.path) {
            return preserveQueryAndHash(
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
        const routeByLocalizedName = tryResolveByLocalizedName(this.ctx.router, prefix, inputName, targetLocale, sourceRoute)
        if (routeByLocalizedName !== null) return preserveQueryAndHash(this.applyBaseUrl(targetLocale, routeByLocalizedName), sourceRoute)
      }
    }

    return this.resolveLocaleRouteFallback(targetLocale, resolved, sourceRoute, needsPrefix, currentRoute)
  }

  /** Route `inputName` resolves to in `targetLocale` according to the router (when trusted), or null. */
  private resolveViaRouter(
    inputName: string,
    targetLocale: string,
    needsPrefix: boolean,
    sourceRoute: RouteLike,
    hasParams: boolean,
  ): RouteLike | null {
    const router = this.ctx.router
    const baseName = this.getRouteBaseName({ name: inputName }) ?? inputName
    let route: RouteLike | null = null
    if (needsPrefix) {
      const prefix = this.getLocalizedRouteNamePrefix()
      route = hasParams
        ? tryResolveByLocalizedNameWithParams(router, prefix, baseName, targetLocale, sourceRoute.params ?? {}, sourceRoute)
        : tryResolveByLocalizedName(router, prefix, baseName, targetLocale, sourceRoute)
    } else if (router.hasRoute(baseName)) {
      try {
        const res = router.resolve({ name: baseName, params: sourceRoute.params, query: sourceRoute.query, hash: sourceRoute.hash })
        if (res?.path) {
          route = {
            name: baseName,
            path: res.path,
            fullPath: res.fullPath,
            params: res.params,
            query: res.query ?? sourceRoute.query,
            hash: res.hash ?? sourceRoute.hash,
          }
        }
      } catch {
        route = null
      }
    }
    return route !== null && isTrustedRouterRoute(this, route, baseName) ? route : null
  }

  private resolveLocaleRouteFallback(
    targetLocale: string,
    resolved: ResolvedRouteLike,
    sourceRoute: RouteLike,
    needsPrefix: boolean,
    currentRoute?: ResolvedRouteLike,
  ): RouteLike | string {
    const fromLocale = currentRoute ? this.detectLocaleFromName(currentRoute.name) : this.detectLocaleFromName(resolved.name)
    const baseName = fromLocale ? this.getBaseRouteName(resolved, fromLocale) : (resolved.name ?? null)
    if (!baseName) return sourceRoute

    const targetName = needsPrefix ? this.buildLocalizedName(baseName, targetLocale) : baseName.toString()
    const pathWithoutLocale = isIndexRouteName(baseName) ? '/' : joinUrl('/', transformNameKeyToPath(baseName))
    const pathForLocale = needsPrefix ? joinUrl(targetLocale, pathWithoutLocale) : pathWithoutLocale
    const withBase = this.applyBaseUrl(targetLocale, pathForLocale)
    const pathStr = typeof withBase === 'string' ? withBase : ((withBase as RouteLike).path ?? pathForLocale)

    const route: RouteLike = { name: targetName, path: pathStr, fullPath: pathStr }
    if (resolved.params || sourceRoute.params)
      route.params = resolved.params !== sourceRoute.params ? Object.assign({}, resolved.params, sourceRoute.params) : resolved.params
    if (resolved.query || sourceRoute.query)
      route.query = resolved.query !== sourceRoute.query ? Object.assign({}, resolved.query, sourceRoute.query) : resolved.query
    route.hash = sourceRoute.hash || resolved.hash
    return preserveQueryAndHash(this.applyBaseUrl(targetLocale, route), sourceRoute)
  }

  override getCanonicalPath(route: ResolvedRouteLike, targetLocale: string): string | null {
    return buildCanonicalFromSegment(
      resolveCustomPath(this.ctx, route, targetLocale) ?? '',
      this.shouldHavePrefix(targetLocale) ? targetLocale : null,
    )
  }

  override resolveLocaleFromPath(path: string): string | null {
    return super.resolveLocaleFromPath(path) ?? this.ctx.defaultLocale
  }

  getRedirect(currentPath: string, detectedLocale: string): string | null {
    const { pathWithoutLocale, localeFromPath } = this.getPathWithoutLocale(currentPath)
    const needPrefix = this.shouldHavePrefix(detectedLocale)

    if (localeFromPath !== null && isUnlocalizedRoute(pathWithoutLocale, this.ctx.globalLocaleRoutes)) {
      return normalizePathForCompare(pathWithoutLocale)
    }

    if (localeFromPath !== null) {
      if (localeFromPath === this.ctx.defaultLocale) {
        return normalizePathForCompare(pathWithoutLocale)
      }
      if (localeFromPath === detectedLocale) {
        const expected = buildPrefixedPath(this, pathWithoutLocale, detectedLocale)
        const currentPathOnly = getCleanPath(currentPath)
        return isSamePath(currentPathOnly, expected) ? null : expected
      }
      return buildPrefixedPath(this, pathWithoutLocale, detectedLocale)
    }

    if (needPrefix) {
      return buildPrefixedPath(this, pathWithoutLocale, detectedLocale)
    }
    const expectedPath = this.resolvePathForLocale(pathWithoutLocale, detectedLocale)
    const norm = expectedPath.startsWith('/') ? expectedPath : `/${expectedPath}`
    const currentPathOnly = getCleanPath(currentPath)
    return isSamePath(currentPathOnly, norm) ? null : norm
  }

  override shouldReturn404(currentPath: string): string | null {
    const { pathWithoutLocale, localeFromPath } = this.getPathWithoutLocale(currentPath)
    if (localeFromPath === null) return null
    if (localeFromPath === this.ctx.defaultLocale && pathWithoutLocale === '/') {
      return 'Default locale should not have prefix'
    }
    return super.shouldReturn404(currentPath)
  }

  private isLocaleRules(key: string): boolean {
    const gr = this.ctx.globalLocaleRoutes
    if (!gr || !key) return false
    const v = gr[key]
    return typeof v === 'object' && v !== null && !Array.isArray(v)
  }

  private getNestedRouteInfo(baseRouteName: string, pathWithoutLocale?: string | null): { parentKey: string; keyWithSlash: string } | null {
    const gr = this.ctx.globalLocaleRoutes
    if (!gr) return null
    // Resolved path wins over slash-key inference: /about-team is never a child of about,
    // even when globalLocaleRoutes also has an about/team rule for a nested page.
    // The nested-rule claim only steers which rule is used; without a rule the URL decides.
    if (isDashedNamePath(baseRouteName, pathWithoutLocale)) {
      return null
    }
    const keyLast = nameKeyLastSlash(baseRouteName)
    const keyFirst = nameKeyFirstSlash(baseRouteName)
    // Explicit file-path keys (about/team) mean nested when the path is not top-level.
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

  /** Locale whose rule value the router path of `routeName` was built from. */
  private getRouteOwnLocale(routeName: string): string {
    const prefix = this.getLocalizedRouteNamePrefix()
    return (routeName.startsWith(prefix) && this.detectLocaleFromName(routeName)) || this.ctx.defaultLocale
  }

  private isRouterPathRule(rule: Record<string, string> | null, routeName: string, routerPath: string, params?: Record<string, unknown>): boolean {
    return rule !== null && isRuleValueForPath(rule[this.getRouteOwnLocale(routeName)], routerPath, params)
  }

  private buildNestedCustomResult(
    rule: Record<string, string>,
    ruleParams: Record<string, unknown> | undefined,
    routeName: string,
    targetLocale: string,
    needsPrefix: boolean,
    sourceRoute: RouteLike,
    currentRoute?: ResolvedRouteLike,
    pathWithoutLocale?: string | null,
    /** Caller already proved that the rule's own-locale value is the router path. */
    isRouterRule = false,
  ): RouteLike | string {
    // The router path of this route is built from the rule value of the route's own locale.
    // When that value is the router path itself, the rule holds complete paths (flat or
    // top-level page): no parent join. Otherwise its values are relative to the parent
    // (Nuxt child route), whatever key form matched (about/team or about-team).
    // Without a resolved path or an own-locale value, fall back to: absolute rule keyed by name = complete.
    const customPath = resolvePathWithParams(rule[targetLocale]!, ruleParams ?? {})
    const ownValue = pathWithoutLocale ? rule[this.getRouteOwnLocale(routeName)] : undefined
    const isCompletePath =
      isRouterRule ||
      (ownValue !== undefined
        ? isRuleValueForPath(ownValue, pathWithoutLocale!, ruleParams)
        : customPath.startsWith('/') && (this.isLocaleRules(routeName) || this.isLocaleRules(`/${routeName}`)))
    const nestedInfo = isCompletePath ? null : this.getNestedRouteInfo(routeName, pathWithoutLocale)
    let pathNorm: string
    if (nestedInfo) {
      const parentPath = this.getParentPathForTarget(nestedInfo.parentKey, nestedInfo.keyWithSlash, targetLocale, currentRoute)
      pathNorm = joinNestedCustomPath(parentPath, customPath)
    } else {
      pathNorm = normalizePath(customPath)
    }
    if (!needsPrefix) return preserveQueryAndHash(this.applyBaseUrl(targetLocale, pathNorm), sourceRoute)
    return preserveQueryAndHash(this.applyBaseUrl(targetLocale, joinUrl(targetLocale, pathNorm)), sourceRoute)
  }

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

  override formatPathForResolve(path: string, fromLocale: string, toLocale: string): string {
    if (toLocale !== this.ctx.defaultLocale) {
      return `/${fromLocale}${path}`
    }
    return path
  }

  getClientRedirect(currentPath: string, preferredLocale: string): string | null {
    const { pathWithoutLocale, localeFromPath } = this.getPathWithoutLocale(currentPath)
    if (isUnlocalizedRoute(pathWithoutLocale, this.ctx.globalLocaleRoutes)) return null
    if (localeFromPath !== null) return null

    const customPath = this.resolvePathForLocale(pathWithoutLocale, preferredLocale)
    const needsPrefix = this.shouldHavePrefix(preferredLocale)

    let targetPath: string
    if (needsPrefix) {
      targetPath = cleanDoubleSlashes(`/${preferredLocale}${customPath.startsWith('/') ? customPath : `/${customPath}`}`)
    } else {
      targetPath = customPath.startsWith('/') ? customPath : `/${customPath}`
    }

    if (targetPath !== '/' && targetPath.endsWith('/')) {
      targetPath = targetPath.slice(0, -1)
    }

    const currentClean = getCleanPath(currentPath)
    if (isSamePath(currentClean, targetPath)) return null

    return targetPath
  }
}

/** Alias for Nuxt alias consumption. */
export { PrefixExceptDefaultPathStrategy as Strategy }
