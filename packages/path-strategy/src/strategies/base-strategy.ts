import type { PathStrategyContext, PathStrategy, NormalizedRouteInput, ResolvedRouteLike, RouteLike, SeoAttributes, SwitchLocaleOptions, RouterAdapter } from '../core/types'
import type { Locale } from '@i18n-micro/types'
import { RouteResolver } from '../core/resolver'
import { getPathWithoutLocale as normalizerGetPathWithoutLocale, getLocaleFromPath as normalizerGetLocaleFromPath } from '../core/normalizer'
import { getRouteBaseName as utilGetRouteBaseName, buildLocalizedName as utilBuildLocalizedName, isIndexRouteName } from '../utils/route-name'
import { withoutTrailingSlash, hasProtocol } from 'ufo'
import { buildUrl, getPathSegments, joinUrl, normalizePath, nameKeyFirstSlash, nameKeyLastSlash, transformNameKeyToPath } from '../utils/path'

export abstract class BasePathStrategy implements PathStrategy {
  protected resolver: RouteResolver

  constructor(protected ctx: PathStrategyContext) {
    this.resolver = new RouteResolver(ctx)
  }

  setRouter(router: RouterAdapter): void {
    this.ctx.router = router
  }

  getDefaultLocale(): string {
    return this.ctx.defaultLocale
  }

  getLocales(): Locale[] {
    return this.ctx.locales
  }

  getStrategy(): PathStrategyContext['strategy'] {
    return this.ctx.strategy
  }

  getLocalizedRouteNamePrefix(): string {
    return this.ctx.localizedRouteNamePrefix || 'localized-'
  }

  getGlobalLocaleRoutes(): PathStrategyContext['globalLocaleRoutes'] {
    return this.ctx.globalLocaleRoutes
  }

  getRouteLocales(): PathStrategyContext['routeLocales'] {
    return this.ctx.routeLocales
  }

  getRoutesLocaleLinks(): PathStrategyContext['routesLocaleLinks'] {
    return this.ctx.routesLocaleLinks
  }

  getNoPrefixRedirect(): boolean | undefined {
    return this.ctx.noPrefixRedirect
  }

  /** Strips localization prefix/suffix and returns the "base" route name for one locale. */
  protected getBaseRouteName(route: RouteLike, locale: string): string | null {
    return utilGetRouteBaseName(route, {
      locales: [{ code: locale }],
      localizedRouteNamePrefix: this.getLocalizedRouteNamePrefix(),
    })
  }

  /** Returns the base route name (without localized prefix/suffix) by trying all locales. */
  getRouteBaseName(route: RouteLike): string | null {
    return utilGetRouteBaseName(route, {
      locales: this.ctx.locales,
      localizedRouteNamePrefix: this.getLocalizedRouteNamePrefix(),
    })
  }

  /** Resolves target path for a locale, checking globalLocaleRoutes first. */
  protected resolvePathForLocale(path: string, targetLocale: string): string {
    const mockRoute: ResolvedRouteLike = {
      path,
      name: null,
      fullPath: path,
      params: {},
    }
    const customSegment = this.resolver.resolveCustomPath(mockRoute, targetLocale)
    if (customSegment) return normalizePath(customSegment)
    return normalizePath(path)
  }

  protected buildLocalizedName(baseName: string, locale: string): string {
    return utilBuildLocalizedName(baseName, locale, this.getLocalizedRouteNamePrefix())
  }

  /** Builds path for target locale (strategy decides: with or without prefix). */
  protected abstract buildLocalizedPath(path: string, locale: string, isCustom: boolean): string

  /** Builds localized route name for target locale. */
  protected abstract buildLocalizedRouteName(baseName: string, locale: string): string

  protected getLocaleObject(code: string): Locale | undefined {
    return this.ctx.locales.find(l => l.code === code)
  }

  protected applyBaseUrl(localeCode: string, route: RouteLike | string): RouteLike | string {
    if (typeof route === 'string') {
      if (hasProtocol(route)) return route
    }
    else if (route.path && hasProtocol(route.path)) {
      return route
    }

    const locale = this.getLocaleObject(localeCode)
    if (!locale?.baseUrl) {
      return route
    }

    const baseUrl = withoutTrailingSlash(locale.baseUrl)

    if (typeof route === 'string') {
      const path = normalizePath(route.startsWith('/') ? route : `/${route}`)
      return joinUrl(baseUrl, path)
    }

    const resolvedPath = normalizePath(route.path || '')
    const fullPath = joinUrl(baseUrl, resolvedPath)
    return {
      ...route,
      path: fullPath,
      fullPath,
    }
  }

  /**
   * Merges target route (strategy result) with query and hash from source route.
   * Returns normalized RouteLike object.
   */
  protected preserveQueryAndHash(
    target: RouteLike | string,
    source?: RouteLike | null,
  ): RouteLike | string {
    if (!source || (!source.query && !source.hash)) {
      return target
    }

    const result: RouteLike = typeof target === 'string'
      ? { path: target }
      : { ...target }

    if (source.query) {
      result.query = { ...source.query, ...result.query }
    }
    if (!result.hash && source.hash) {
      result.hash = source.hash
    }

    const basePath = result.path ?? ''
    result.fullPath = buildUrl(basePath, result.query, result.hash)

    return result
  }

  protected resolvePathWithParams(path: string, params: Record<string, unknown> = {}): string {
    return this.resolver.resolvePathWithParams(path, params)
  }

  protected getPathWithoutLocaleAndBaseName(route: ResolvedRouteLike): { pathWithoutLocale: string, baseRouteName: string | null } {
    return this.resolver.getPathWithoutLocaleAndBaseName(route)
  }

  /** Look up custom path segment for targetLocale in globalLocaleRoutes. */
  protected getCustomPathSegment(route: ResolvedRouteLike, targetLocale: string): string | null {
    return this.resolver.resolveCustomPath(route, targetLocale)
  }

  protected getAllowedLocalesForRoute(route: ResolvedRouteLike): string[] {
    return this.resolver.getAllowedLocalesForRoute(route)
  }

  getCanonicalPath(_route: ResolvedRouteLike, _targetLocale: string): string | null {
    return null
  }

  protected getPathForUnlocalizedRouteByName(routeName: string): string | null {
    return this.resolver.getPathForUnlocalizedRouteByName(routeName)
  }

  /**
   * Try to resolve route by localized name. Returns RouteLike with query/hash from sourceRoute to preserve them.
   */
  protected tryResolveByLocalizedName(routeName: string, targetLocale: string, sourceRoute?: RouteLike): RouteLike | null {
    const localizedName = `${this.getLocalizedRouteNamePrefix()}${routeName}-${targetLocale}`
    const hasRoute = this.ctx.router.hasRoute(localizedName)
    this.debugLog('tryResolveByLocalizedName', { routeName, targetLocale, localizedName, hasRoute })
    if (!hasRoute) return null
    const resolved = this.ctx.router.resolve({
      name: localizedName,
      params: sourceRoute?.params,
      query: sourceRoute?.query,
      hash: sourceRoute?.hash,
    })
    this.debugLog('tryResolveByLocalizedName resolved', { localizedName, path: resolved?.path, fullPath: resolved?.fullPath })
    if (!resolved?.path) return null
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
   * Try to resolve route by localized name with params. Returns RouteLike to preserve query/hash.
   */
  protected tryResolveByLocalizedNameWithParams(
    routeName: string,
    targetLocale: string,
    params: Record<string, unknown>,
    sourceRoute?: RouteLike,
  ): RouteLike | null {
    const localizedName = `${this.getLocalizedRouteNamePrefix()}${routeName}-${targetLocale}`
    const hasRoute = this.ctx.router.hasRoute(localizedName)
    this.debugLog('tryResolveByLocalizedNameWithParams', { routeName, targetLocale, params, localizedName, hasRoute })
    if (!hasRoute) return null
    const resolved = this.ctx.router.resolve({
      name: localizedName,
      params,
      query: sourceRoute?.query,
      hash: sourceRoute?.hash,
    })
    this.debugLog('tryResolveByLocalizedNameWithParams resolved', { path: resolved?.path, fullPath: resolved?.fullPath })
    if (!resolved?.path || resolved.path === '/') return null
    return {
      name: localizedName,
      path: resolved.path,
      fullPath: resolved.fullPath,
      params: resolved.params,
      query: resolved.query ?? sourceRoute?.query,
      hash: resolved.hash ?? sourceRoute?.hash,
    }
  }

  protected getPathForUnlocalizedRoute(route: ResolvedRouteLike): string | null {
    return this.resolver.getPathForUnlocalizedRoute(route)
  }

  /**
   * Builds localized path from baseName + params when router does not have the route.
   * Tries two conventions:
   * 1) Hyphen form (Nuxt test-[id].vue → /test-:id): when single param key equals last baseName segment (e.g. test-id + id → test-:id).
   * 2) Slash form (kebab→slash): path segments from baseName, last N replaced by :paramKey (e.g. test-id → /test/:id).
   */
  protected buildPathFromBaseNameAndParams(
    baseName: string,
    params: Record<string, unknown>,
    targetLocale: string,
  ): string | null {
    const paramKeys = Object.keys(params).filter(k => params[k] !== undefined && params[k] !== null && params[k] !== '')
    if (paramKeys.length === 0) return null
    let pathTemplate: string
    const firstKey = paramKeys[0]
    if (paramKeys.length === 1 && firstKey !== undefined && baseName.endsWith('-' + firstKey)) {
      pathTemplate = joinUrl('/', baseName.slice(0, baseName.length - firstKey.length - 1) + '-:' + firstKey)
    }
    else {
      const pathForm = transformNameKeyToPath(baseName)
      const pathSegments = pathForm ? pathForm.split('/').filter(Boolean) : [baseName]
      const replaceCount = Math.min(paramKeys.length, pathSegments.length)
      const templateSegments = pathSegments.slice(0, pathSegments.length - replaceCount)
        .concat(paramKeys.slice(0, replaceCount).map(k => `:${k}`))
      pathTemplate = joinUrl('/', ...templateSegments)
    }
    const pathWithParams = this.resolvePathWithParams(pathTemplate, params)
    const finalPath = this.buildLocalizedPath(pathWithParams, targetLocale, false)
    const withBase = this.applyBaseUrl(targetLocale, finalPath)
    return typeof withBase === 'string' ? withBase : (withBase as RouteLike).path ?? finalPath
  }

  protected getPathWithoutLocale(path: string): { pathWithoutLocale: string, localeFromPath: string | null } {
    return normalizerGetPathWithoutLocale(path, this.ctx.locales.map(l => l.code))
  }

  getLocaleFromPath(path: string): string | null {
    return normalizerGetLocaleFromPath(path, this.ctx.locales.map(l => l.code))
  }

  abstract resolveLocaleFromPath(path: string): string | null

  /**
   * Returns path to redirect to, or null if no redirect needed.
   * Use in middleware: strategy.getRedirect(to.fullPath, detectedLocale)
   */
  abstract getRedirect(currentPath: string, targetLocale: string): string | null

  /**
   * Builds SEO attributes (canonical + hreflangs) from current route.
   * Respects routeLocales: only allowed locales for this route get an hreflang entry.
   * routesLocaleLinks is used when resolving the route key for routeLocales lookup.
   */
  getSeoAttributes(currentRoute: ResolvedRouteLike): SeoAttributes {
    const currentLocale = this.resolveLocaleFromPath(currentRoute.path) ?? this.ctx.defaultLocale
    const canonicalPath = this.getCanonicalPath(currentRoute, currentLocale) ?? currentRoute.path
    const canonical = this.buildFullUrl(currentLocale, canonicalPath)

    const allowedCodes = this.getAllowedLocalesForRoute(currentRoute)
    const localesToEmit = this.ctx.locales.filter(l => allowedCodes.includes(l.code))
    const hreflangs = localesToEmit.map((locale) => {
      const localized = this.localeRoute(locale.code, currentRoute, currentRoute)
      const pathStr = localized.path ?? localized.fullPath ?? ''
      const normalizedPath = pathStr || '/'
      return {
        rel: 'alternate' as const,
        hreflang: locale.code,
        href: this.buildFullUrl(locale.code, normalizedPath),
      }
    })

    return { canonical, hreflangs }
  }

  /**
   * Builds full URL (path + optional baseUrl for locale).
   */
  protected buildFullUrl(localeCode: string, path: string): string {
    const result = this.applyBaseUrl(localeCode, path)
    return typeof result === 'string' ? result : (result.path ?? path)
  }

  /** When router knows neither targetName nor baseName — what to return (strategy may override). */
  protected getSwitchLocaleFallbackWhenNoRoute(route: ResolvedRouteLike, targetName: string): RouteLike | string {
    return { ...route, name: targetName }
  }

  /**
   * Default: baseName → buildLocalizedRouteName → hasRoute → applyBaseUrl; fallback to baseName.
   */
  switchLocaleRoute(
    fromLocale: string,
    toLocale: string,
    route: ResolvedRouteLike,
    options: SwitchLocaleOptions,
  ): RouteLike | string {
    const baseName = this.getBaseRouteName(route, fromLocale)
    if (!baseName) return route

    let targetName = this.buildLocalizedRouteName(baseName, toLocale)

    if (!this.ctx.router.hasRoute(targetName)) {
      if (this.ctx.router.hasRoute(baseName)) {
        targetName = baseName
      }
      else {
        return this.getSwitchLocaleFallbackWhenNoRoute(route, targetName)
      }
    }

    const i18nParams = options.i18nRouteParams?.[toLocale] || {}
    const newParams: Record<string, unknown> = { ...(route.params || {}), ...i18nParams }
    delete (newParams as Record<string, unknown>).locale

    const newRoute: RouteLike = {
      name: targetName,
      params: newParams,
      query: route.query,
      hash: route.hash,
    }
    return this.applyBaseUrl(toLocale, newRoute)
  }

  /**
   * Template Method: BaseStrategy knows "how" (normalize → delegate to strategy).
   * Always returns RouteLike with path and fullPath (never a string).
   */
  localeRoute(
    targetLocale: string,
    routeOrPath: RouteLike | string,
    currentRoute?: ResolvedRouteLike,
  ): RouteLike {
    const normalized = this.normalizeRouteInput(routeOrPath, currentRoute)
    const raw = this.resolveLocaleRoute(targetLocale, normalized, currentRoute)
    this.debugLog('localeRoute raw', { rawPath: typeof raw === 'string' ? raw : (raw as RouteLike).path, rawFullPath: typeof raw === 'string' ? raw : (raw as RouteLike).fullPath })
    const result = this.ensureRouteLike(raw, normalized.kind === 'route' ? normalized.sourceRoute : undefined)
    this.debugLog('localeRoute after ensureRouteLike', { path: result.path, fullPath: result.fullPath })
    return result
  }

  /** Normalizes resolveLocaleRoute result into RouteLike (path and fullPath always set). */
  protected ensureRouteLike(value: RouteLike | string, source?: RouteLike | null): RouteLike {
    if (typeof value === 'string') {
      const path = value
      const fullPath = source?.query || source?.hash
        ? buildUrl(path, source?.query, source?.hash)
        : path
      return {
        path,
        fullPath,
        ...(source?.query && { query: source.query }),
        ...(source?.hash && { hash: source.hash }),
      }
    }
    let fullPath = (value.fullPath ?? value.path ?? '')
    let path = (value.path ?? fullPath.split('?')[0]?.split('#')[0] ?? fullPath)
    if (!path && !fullPath) {
      const name = value.name?.toString() ?? source?.name?.toString() ?? ''
      if (isIndexRouteName(name, {
        localizedRouteNamePrefix: this.getLocalizedRouteNamePrefix(),
        localeCodes: this.ctx.locales.map(l => l.code),
      })) {
        path = '/'
        fullPath = '/'
      }
    }
    return { ...value, path, fullPath }
  }

  /**
   * Normalizes localeRoute input into a single structure (path string or route with resolved).
   */
  protected normalizeRouteInput(
    routeOrPath: RouteLike | string,
    _currentRoute?: ResolvedRouteLike,
  ): NormalizedRouteInput {
    if (typeof routeOrPath === 'string') {
      return { kind: 'path', path: routeOrPath }
    }
    const sourceRoute = routeOrPath as RouteLike
    const inputName = sourceRoute.name?.toString() ?? null
    let resolved: ResolvedRouteLike
    try {
      resolved = this.ctx.router.resolve(routeOrPath)
      this.debugLog('normalizeRouteInput router.resolve ok', { inputName, resolvedPath: resolved.path, resolvedName: resolved.name })
    }
    catch {
      resolved = {
        name: inputName,
        path: sourceRoute.path ?? '/',
        fullPath: sourceRoute.fullPath ?? sourceRoute.path ?? '/',
        params: sourceRoute.params ?? {},
        query: sourceRoute.query ?? {},
        hash: sourceRoute.hash ?? '',
      } as ResolvedRouteLike
      this.debugLog('normalizeRouteInput router.resolve catch fallback', { inputName, resolvedPath: resolved.path })
    }
    return { kind: 'route', inputName, sourceRoute, resolved }
  }

  /** Logging when ctx.debug (for localeRoute debugging). Disabled by default. */
  private debugLog(..._args: unknown[]): void {
    // if (this.ctx.debug) console.log('[i18n:resolveLocaleRoute]', ..._args)
  }

  /**
   * Default resolution: uses buildLocalizedPath and buildLocalizedRouteName.
   * Strategies with different logic (e.g. prefix-except-default) override this method.
   */
  protected resolveLocaleRoute(
    targetLocale: string,
    normalized: NormalizedRouteInput,
    _currentRoute?: ResolvedRouteLike,
  ): RouteLike | string {
    if (normalized.kind === 'path') {
      const resolvedPath = this.resolvePathForLocale(normalized.path, targetLocale)
      const finalPath = this.buildLocalizedPath(resolvedPath, targetLocale, false)
      const out = this.applyBaseUrl(targetLocale, finalPath)
      this.debugLog('branch=path', { targetLocale, path: normalized.path, finalPath, out: typeof out === 'string' ? out : (out as RouteLike).path })
      return out
    }

    const { inputName, sourceRoute: src, resolved } = normalized
    const hasParams = src.params && Object.keys(src.params ?? {}).length > 0
    const baseName = this.getRouteBaseName(resolved) ?? inputName ?? resolved.name?.toString() ?? null
    const resolvedNameStr = resolved.name?.toString()

    this.debugLog('input', { targetLocale, inputName, resolvedPath: resolved.path, resolvedName: resolved.name, params: src.params, hasParams, baseName })

    if (inputName) {
      const unlocalizedByName = this.getPathForUnlocalizedRouteByName(inputName)
      if (unlocalizedByName !== null) {
        this.debugLog('branch=unlocalizedByName', { inputName, unlocalizedByName })
        return this.preserveQueryAndHash(unlocalizedByName, src)
      }
    }

    if (inputName && hasParams) {
      const routeWithParams = this.tryResolveByLocalizedNameWithParams(
        inputName,
        targetLocale,
        src.params ?? {},
        src,
      )
      if (routeWithParams !== null) {
        this.debugLog('branch=routeWithParams', { inputName, path: routeWithParams.path, fullPath: routeWithParams.fullPath })
        return this.preserveQueryAndHash(this.applyBaseUrl(targetLocale, routeWithParams), src)
      }
    }

    // Resolve by inputName first; if not found and inputName looks like a localized name (prefix-base-locale), try baseName.
    // Do not try baseName when user asked for base name 'index' (resolved route may be current page -> baseName 'page').
    if (inputName && !hasParams) {
      let routeByLocalizedName = this.tryResolveByLocalizedName(inputName, targetLocale, src)
      const prefix = this.getLocalizedRouteNamePrefix()
      if (routeByLocalizedName === null && baseName != null && baseName !== inputName && inputName.startsWith(prefix)) {
        routeByLocalizedName = this.tryResolveByLocalizedName(baseName, targetLocale, src)
      }
      if (routeByLocalizedName !== null) {
        this.debugLog('branch=routeByLocalizedName', { inputName, path: routeByLocalizedName.path, fullPath: routeByLocalizedName.fullPath })
        return this.preserveQueryAndHash(this.applyBaseUrl(targetLocale, routeByLocalizedName), src)
      }
    }

    const unlocalizedPath = this.getPathForUnlocalizedRoute(resolved)
    if (unlocalizedPath !== null) {
      const path = this.buildLocalizedPath(unlocalizedPath, targetLocale, false)
      this.debugLog('branch=unlocalizedPath', { unlocalizedPath, path })
      return this.preserveQueryAndHash(this.applyBaseUrl(targetLocale, path), src)
    }

    const customSegment = this.getCustomPathSegment(resolved, targetLocale)
    if (customSegment !== null) {
      const routeName = resolved.name?.toString() ?? inputName ?? ''
      const keyFirstSlash = routeName ? nameKeyFirstSlash(routeName) : ''
      const keyLastSlash = routeName ? nameKeyLastSlash(routeName) : ''
      const gr = this.ctx.globalLocaleRoutes
      const isNestedFirst = keyFirstSlash.includes('/') && gr?.[keyFirstSlash]
      const isNestedLast = keyLastSlash.includes('/') && gr?.[keyLastSlash]
      const isNested = isNestedFirst || isNestedLast
      const keyWithSlash = isNestedLast ? keyLastSlash : keyFirstSlash
      let pathWithoutLocale: string
      if (isNested) {
        const nameSegments = getPathSegments(keyWithSlash)
        const parentKey = nameSegments.length > 1 ? nameSegments.slice(0, -1).join('-') : ''
        const parentRules = parentKey && gr?.[parentKey] && typeof gr[parentKey] === 'object' && !Array.isArray(gr[parentKey])
          ? (gr[parentKey] as Record<string, string>)
          : null
        const parentPath = parentRules?.[targetLocale]
          ? normalizePath(parentRules[targetLocale])
          : joinUrl('/', ...nameSegments.slice(0, -1))
        const segment = customSegment.startsWith('/') ? customSegment.slice(1) : customSegment
        pathWithoutLocale = joinUrl(parentPath, segment)
      }
      else {
        pathWithoutLocale = normalizePath(customSegment)
      }
      const finalPath = this.buildLocalizedPath(pathWithoutLocale, targetLocale, true)
      this.debugLog('branch=customSegment', { customSegment, pathWithoutLocale, finalPath })
      return this.preserveQueryAndHash(this.applyBaseUrl(targetLocale, finalPath), src)
    }

    const effectiveBaseName = baseName ?? inputName
    this.debugLog('before effectiveBaseName check', { baseName, inputName, effectiveBaseName, resolvedName: resolved.name?.toString() })
    if (!effectiveBaseName) {
      this.debugLog('branch=noBaseName', { return: 'src' })
      return src
    }

    if (!hasParams && resolved.path && resolved.path !== '/' && resolved.name) {
      const { pathWithoutLocale, baseRouteName } = this.getPathWithoutLocaleAndBaseName(resolved)
      if (pathWithoutLocale && pathWithoutLocale !== '/') {
        const pathToUse = baseRouteName && pathWithoutLocale === baseRouteName
          ? joinUrl('/', transformNameKeyToPath(baseRouteName))
          : pathWithoutLocale
        const finalPath = this.buildLocalizedPath(pathToUse, targetLocale, false)
        this.debugLog('branch=pathFromResolved', { pathWithoutLocale, baseRouteName, pathToUse, finalPath })
        return this.preserveQueryAndHash(this.applyBaseUrl(targetLocale, finalPath), src)
      }
    }

    const baseNameForPath = (resolvedNameStr === inputName ? effectiveBaseName : (inputName ?? effectiveBaseName))
    this.debugLog('fallback build', { resolvedNameStr, inputName, baseNameForPath, targetLocale, hasParams })
    const targetName = this.buildLocalizedRouteName(baseNameForPath, targetLocale)
    const newRoute: RouteLike = {
      ...src,
      name: targetName,
      params: { ...src.params },
    }
    if (!hasParams) {
      const pathWithoutLocale = isIndexRouteName(baseNameForPath)
        ? '/'
        : joinUrl('/', transformNameKeyToPath(baseNameForPath))
      const finalPath = this.buildLocalizedPath(pathWithoutLocale, targetLocale, false)
      const withBase = this.applyBaseUrl(targetLocale, finalPath)
      const pathStr = typeof withBase === 'string' ? withBase : (withBase as RouteLike).path ?? finalPath
      this.debugLog('fallback !hasParams', { pathWithoutLocale, finalPath, pathStr })
      newRoute.path = pathStr
      newRoute.fullPath = pathStr
    }
    else {
      let pathStr: string | null = null
      try {
        const resolvedWithParams = this.ctx.router.resolve({ name: baseNameForPath, params: src.params })
        if (resolvedWithParams?.path) {
          const pathToUse = resolvedWithParams.path === '/'
            ? '/'
            : (() => {
                const { pathWithoutLocale } = this.getPathWithoutLocale(resolvedWithParams.path)
                return pathWithoutLocale && pathWithoutLocale !== '/' ? pathWithoutLocale : resolvedWithParams.path
              })()
          const finalPath = this.buildLocalizedPath(pathToUse, targetLocale, false)
          const withBase = this.applyBaseUrl(targetLocale, finalPath)
          pathStr = typeof withBase === 'string' ? withBase : (withBase as RouteLike).path ?? finalPath
        }
      }
      catch {
        // Router does not have baseName route: build path from baseNameForPath + params (path template)
        pathStr = this.buildPathFromBaseNameAndParams(baseNameForPath, src.params ?? {}, targetLocale)
      }
      if (pathStr) {
        newRoute.path = pathStr
        newRoute.fullPath = pathStr
      }
    }
    const out = this.preserveQueryAndHash(this.applyBaseUrl(targetLocale, newRoute), src)
    this.debugLog('branch=fallbackNewRoute return', { baseName, targetName, hasParams, newRoutePath: newRoute.path, outPath: typeof out === 'string' ? out : (out as RouteLike).path })
    return out
  }
}
