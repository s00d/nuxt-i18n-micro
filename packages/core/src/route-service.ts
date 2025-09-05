import type {
  NavigationFailure,
  RouteLocationAsPath, RouteLocationAsPathGeneric,
  RouteLocationAsRelative,
  RouteLocationAsString,
  RouteLocationNamedRaw,
  RouteLocationNormalizedLoaded,
  RouteLocationOptions,
  RouteLocationRaw,
  RouteLocationResolved,
  RouteLocationResolvedGeneric,
  RouteParamsRawGeneric,
  Router,
} from 'vue-router'
import type { I18nRouteParams, Locale, ModuleOptionsExtend } from 'nuxt-i18n-micro-types'
import { isNoPrefixStrategy, withPrefixStrategy } from './helpers'

interface NavigateToInterface {
  replace?: boolean
  redirectCode?: number
  external?: boolean
}

export class RouteService {
  constructor(
    private i18nConfig: ModuleOptionsExtend,
    private router: Router,
    private hashLocaleDefault: string | null | undefined,
    private noPrefixDefault: string | null | undefined,
    private navigateTo: (to: RouteLocationRaw | undefined | null, options?: NavigateToInterface) => Promise<void | NavigationFailure | false> | false | void | RouteLocationRaw,
    private setCookie: (name: string, value: string) => void,
  ) {}

  getCurrentLocale(route?: RouteLocationNormalizedLoaded | RouteLocationResolvedGeneric): string {
    route = route ?? this.router.currentRoute.value
    if (this.i18nConfig.hashMode && this.hashLocaleDefault) {
      return this.hashLocaleDefault
    }
    if (isNoPrefixStrategy(this.i18nConfig.strategy!) && this.noPrefixDefault) {
      return this.noPrefixDefault
    }
    return (route.params?.locale ?? this.i18nConfig.defaultLocale).toString()
  }

  getCurrentName(route: RouteLocationNormalizedLoaded | RouteLocationResolvedGeneric): string | null {
    const currentLocaleCode = this.getCurrentLocale(route)
    const checkLocale = this.i18nConfig.locales?.find(l => l.code === currentLocaleCode)
    return checkLocale?.displayName ?? null
  }

  getRouteName(route: RouteLocationResolvedGeneric | RouteLocationNamedRaw, locale: string): string {
    const name = (route.name ?? '').toString()
    return name
      .toString()
      .replace('localized-', '')
      .replace(new RegExp(`-${locale}$`), '')
  }

  getFullPathWithBaseUrl(currentLocale: Locale, route: RouteLocationRaw): string {
    const resolvedRoute = this.router.resolve(route)
    let fullPath = resolvedRoute.fullPath

    if (currentLocale?.baseDefault) {
      fullPath = fullPath.replace(new RegExp(`^/${currentLocale!.code}`), '')
    }

    let baseUrl = currentLocale!.baseUrl
    if (!baseUrl) baseUrl = ''
    if (baseUrl?.endsWith('/')) {
      baseUrl = baseUrl.slice(0, -1)
    }

    return baseUrl + fullPath
  }

  switchLocaleRoute(
    fromLocale: string,
    toLocale: string,
    route: RouteLocationResolvedGeneric | RouteLocationNamedRaw,
    i18nRouteParams: I18nRouteParams,
  ): RouteLocationRaw {
    const currentLocale = this.i18nConfig.locales?.find(l => l.code === toLocale)

    const routeName = this.getRouteName(route, fromLocale)
    if (this.router.hasRoute(`localized-${routeName}-${toLocale}`)) {
      const newParams = { ...route.params ?? {}, ...i18nRouteParams?.[toLocale] }
      if (!isNoPrefixStrategy(this.i18nConfig.strategy!)) newParams.locale = toLocale

      const newRoute = {
        name: `localized-${routeName}-${toLocale}`,
        params: newParams,
        query: route.query,
        hash: route.hash,
      }

      if (currentLocale?.baseUrl) {
        return this.getFullPathWithBaseUrl(currentLocale, newRoute)
      }

      return newRoute
    }

    let newRouteName = routeName
    const newParams = { ...route.params ?? {}, ...i18nRouteParams?.[toLocale] }
    delete newParams.locale

    if (!isNoPrefixStrategy(this.i18nConfig.strategy!)) {
      if (routeName === 'custom-fallback-route') {
        newRouteName = routeName
      }
      else {
        newRouteName
          = toLocale !== this.i18nConfig.defaultLocale || withPrefixStrategy(this.i18nConfig.strategy!)
            ? `localized-${routeName}`
            : routeName
      }

      if (!isNoPrefixStrategy(this.i18nConfig.strategy!)) {
        if (toLocale !== this.i18nConfig.defaultLocale || withPrefixStrategy(this.i18nConfig.strategy!)) {
          newParams.locale = toLocale
        }
      }
    }

    const newRoute = {
      name: newRouteName,
      params: newParams,
      query: route.query,
      hash: route.hash,
    }

    if (isNoPrefixStrategy(this.i18nConfig.strategy!)) {
      this.i18nConfig.locales?.forEach((locale, _index) => {
        if (newRoute.name.endsWith(`-${locale.code}`)) {
          newRoute.name = newRoute.name.slice(0, -locale.code - 1)
        }
      })
    }

    if (currentLocale?.baseUrl) {
      return this.getFullPathWithBaseUrl(currentLocale, newRoute)
    }

    return newRoute
  }

  private resolveParams(to: RouteLocationAsString | RouteLocationAsRelative | RouteLocationAsPath): RouteParamsRawGeneric {
    const params
      = typeof to === 'object' && 'params' in to && typeof to.params === 'object'
        ? { ...to.params }
        : {}

    if (typeof to === 'string') {
      const resolved = this.router.resolve(to)
      if (resolved && resolved.params) {
        Object.assign(params, resolved.params)
      }
    }

    return params
  }

  private handlePrefixStrategy(
    to: RouteLocationResolvedGeneric | RouteLocationAsPathGeneric | RouteLocationNamedRaw | string,
  ): RouteLocationResolvedGeneric | RouteLocationAsPathGeneric | RouteLocationNamedRaw | string {
    if (!withPrefixStrategy(this.i18nConfig.strategy!)) {
      return to
    }

    const defaultLocale = this.i18nConfig.defaultLocale!
    let resolvedTo = to

    if (typeof to === 'string') {
      resolvedTo = this.router.resolve('/' + defaultLocale + to)
    }

    const defaultRouteName = this.getRouteName(resolvedTo as RouteLocationResolvedGeneric, defaultLocale)
    const newParams = this.resolveParams(resolvedTo)

    if (!isNoPrefixStrategy(this.i18nConfig.strategy!)) {
      newParams.locale = defaultLocale
    }

    if (this.router.hasRoute(`localized-${defaultRouteName}`)) {
      return this.router.resolve({
        name: `localized-${defaultRouteName}`,
        query: (resolvedTo as RouteLocationNormalizedLoaded).query,
        hash: (resolvedTo as RouteLocationNormalizedLoaded).hash,
        params: newParams,
      })
    }
    else if (this.router.hasRoute(`localized-${defaultRouteName}-${defaultLocale}`)) {
      return this.router.resolve({
        name: `localized-${defaultRouteName}-${defaultLocale}`,
        query: (resolvedTo as RouteLocationNormalizedLoaded).query,
        hash: (resolvedTo as RouteLocationNormalizedLoaded).hash,
        params: newParams,
      })
    }

    return to
  }

  private createLocalizedRoute(
    to: RouteLocationAsString | RouteLocationAsRelative | RouteLocationAsPath,
    route: RouteLocationNormalizedLoaded,
    locale: string,
  ): RouteLocationResolved {
    const selectRoute = this.router.resolve(to)
    const routeName = this.getRouteName(selectRoute, locale)
      .replace(new RegExp(`-${this.i18nConfig.defaultLocale!}$`), '')

    if (!isNoPrefixStrategy(this.i18nConfig.strategy!)) {
      if (!routeName || routeName === '') {
        const resolved = this.router.resolve(to)
        let url = resolved.path.replace(new RegExp(`^/${locale}/`), '/')
        if (locale !== this.i18nConfig.defaultLocale || withPrefixStrategy(this.i18nConfig.strategy!)) {
          url = '/' + locale + '' + url
        }

        return this.router.resolve({
          path: url,
          query: selectRoute.query,
          hash: selectRoute.hash,
        })
      }
    }

    if (this.router.hasRoute(`localized-${routeName}-${locale}`)) {
      const newParams = this.resolveParams(selectRoute)
      if (!isNoPrefixStrategy(this.i18nConfig.strategy!)) newParams.locale = locale

      return this.router.resolve({
        name: `localized-${routeName}-${locale}`,
        params: newParams,
        query: selectRoute.query,
        hash: selectRoute.hash,
      })
    }

    const newRouteName
      = locale !== this.i18nConfig.defaultLocale || withPrefixStrategy(this.i18nConfig.strategy!)
        ? `localized-${routeName}`
        : routeName

    if (!this.router.hasRoute(newRouteName)) {
      const newParams = this.resolveParams(to)
      delete newParams.locale

      if (!this.router.hasRoute(routeName)) {
        return this.router.resolve('/')
      }

      return this.router.resolve({
        name: routeName,
        params: newParams,
        query: selectRoute.query,
        hash: selectRoute.hash,
      })
    }

    const newParams = this.resolveParams(to)
    delete newParams.locale

    if (!isNoPrefixStrategy(this.i18nConfig.strategy!)) {
      if (locale !== this.i18nConfig.defaultLocale || withPrefixStrategy(this.i18nConfig.strategy!)) {
        newParams.locale = locale
      }
    }

    return this.router.resolve({
      name: newRouteName,
      params: newParams,
      query: selectRoute.query,
      hash: selectRoute.hash,
    })
  }

  getLocalizedRoute(
    to: RouteLocationResolvedGeneric | RouteLocationAsPathGeneric | RouteLocationNamedRaw | string,
    route: RouteLocationNormalizedLoaded,
    locale?: string,
  ): RouteLocationResolved {
    const currentLocale = locale || this.getCurrentLocale(route)

    // Handle prefix strategy
    const processedTo = this.handlePrefixStrategy(to)

    // Create localized route
    return this.createLocalizedRoute(processedTo, route, currentLocale)
  }

  updateCookies(toLocale: string): void {
    if (this.i18nConfig.hashMode) {
      this.setCookie('hash-locale', toLocale)
      // useCookie('hash-locale').value = toLocale
      this.hashLocaleDefault = toLocale
    }
    if (isNoPrefixStrategy(this.i18nConfig.strategy!)) {
      this.setCookie('no-prefix-locale', toLocale)
      // useCookie('no-prefix-locale').value = toLocale
      this.noPrefixDefault = toLocale
    }
  }

  getCurrentRoute(): RouteLocationNormalizedLoaded {
    return this.router.currentRoute.value
  }

  private resolveRouteWithStrategy(
    route: string,
    currentLocale: string,
    fromLocale: string,
  ): RouteLocationResolved {
    if (isNoPrefixStrategy(this.i18nConfig.strategy!)) {
      return this.router.resolve(route)
    }
    else if (currentLocale !== this.i18nConfig.defaultLocale || withPrefixStrategy(this.i18nConfig.strategy!)) {
      return this.router.resolve(`/${fromLocale}${route}`)
    }
    else {
      return this.router.resolve(route)
    }
  }

  switchLocaleLogic(toLocale: string, i18nRouteParams: I18nRouteParams, to?: RouteLocationNamedRaw | RouteLocationResolvedGeneric | string) {
    const fromLocale = this.getCurrentLocale()

    let current: RouteLocationResolved | RouteLocationNamedRaw
    if (typeof to === 'string') {
      current = this.resolveRouteWithStrategy(to, toLocale, fromLocale)
    }
    else {
      current = to ?? this.getCurrentRoute() as RouteLocationResolved
    }

    this.updateCookies(toLocale)
    const switchedRoute = this.switchLocaleRoute(fromLocale, toLocale, current, i18nRouteParams)

    if (typeof switchedRoute === 'string' && switchedRoute.startsWith('http')) {
      return this.navigateTo(switchedRoute, { redirectCode: 200, external: true })
    }

    if (isNoPrefixStrategy(this.i18nConfig.strategy!)) {
      (switchedRoute as RouteLocationRaw & RouteLocationOptions).force = true
    }

    return this.router.push(switchedRoute)
  }

  resolveLocalizedRoute(
    to: RouteLocationNamedRaw | RouteLocationAsPathGeneric | string,
    locale?: string,
  ): RouteLocationResolved {
    const currentRoute = this.getCurrentRoute()
    const fromLocale = this.getCurrentLocale()
    const currentLocale = locale ?? fromLocale

    let current: RouteLocationResolved | RouteLocationNamedRaw | RouteLocationAsPathGeneric
    if (typeof to === 'string') {
      if (!to.startsWith('/')) {
        to = `/${to}`
      }
      current = this.resolveRouteWithStrategy(to, currentLocale, fromLocale)
    }
    else {
      current = to
    }

    return this.getLocalizedRoute(current, currentRoute, currentLocale)
  }
}
