import type { Locale } from '@i18n-micro/types'
import { localeFromPath, resolveLocale } from '@i18n-micro/utils/resolve-locale'
import type { MiddlewareHandler } from 'astro'
import type { AstroI18n } from './composer'
import { routeNameFromPath } from './router/adapter'
import { getGlobalRoutingStrategy, runWithRoutingStrategy } from './routing-context'
import type { I18nRoutingStrategy } from './router/types'
// Import shim to ensure App.Locals is available
import './env.d'

export interface I18nMiddlewareOptions {
  i18n: AstroI18n
  defaultLocale: string
  locales: string[]
  localeObjects?: Locale[]
  /** Cookie and Accept-Language may pick the locale of a URL without a locale prefix (default `true`). */
  autoDetect?: boolean
  redirectToDefault?: boolean
  routingStrategy?: I18nRoutingStrategy
  /** Cookie holding the visitor's locale (default `'i18n-locale'`); `null` disables it. */
  localeCookie?: string | null
}

export const DEFAULT_ASTRO_LOCALE_COOKIE = 'i18n-locale'

interface CookieReader {
  get: (name: string) => { value: string } | undefined
}

/** A request header, or null where there is none (static prerendering). */
function header(headers: Headers, name: string): string | null {
  try {
    return headers.get(name)
  } catch {
    return null
  }
}

function cookie(cookies: CookieReader, name: string | null): string | null {
  if (name === null) return null
  try {
    return cookies.get(name)?.value ?? null
  } catch {
    return null
  }
}

/**
 * Locale a URL names: its prefix, or what the strategy reads from it when that is not the default
 * (a strategy's `getLocaleFromPath` answers the default for a URL without a locale).
 */
function urlLocale(pathname: string, defaultLocale: string, locales: string[], strategy?: I18nRoutingStrategy | null): string | null {
  const prefix = localeFromPath(pathname, locales)
  if (prefix || !strategy?.getLocaleFromPath) return prefix
  const read = strategy.getLocaleFromPath(pathname, defaultLocale, locales)
  return read !== defaultLocale ? read : null
}

/**
 * Locale of a request: URL prefix → cookie → Accept-Language → default, the one precedence of
 * `resolveLocale`. An explicit prefix always wins; `autoDetect: false` leaves only the URL.
 */
export function detectLocale(
  pathname: string,
  cookies: { get: (name: string) => { value: string } | undefined },
  headers: Headers,
  defaultLocale: string,
  locales: string[],
  localeCookie: string | null = DEFAULT_ASTRO_LOCALE_COOKIE,
  routingStrategy?: I18nRoutingStrategy | null,
  autoDetect = true,
): string {
  const strategy = routingStrategy ?? getGlobalRoutingStrategy()
  return resolveLocale({
    defaultLocale,
    validLocales: locales,
    autoDetectLanguage: autoDetect,
    url: urlLocale(pathname, defaultLocale, locales, strategy),
    cookie: autoDetect ? cookie(cookies, localeCookie) : null,
    acceptLanguage: autoDetect ? header(headers, 'accept-language') : null,
  })
}

/**
 * Create Astro middleware for i18n locale detection
 */
export function createI18nMiddleware(options: I18nMiddlewareOptions): MiddlewareHandler {
  const { i18n: globalI18n, defaultLocale, locales, localeObjects, autoDetect = true, routingStrategy } = options
  const localeCookie = options.localeCookie === undefined ? DEFAULT_ASTRO_LOCALE_COOKIE : options.localeCookie
  const strategy = routingStrategy || getGlobalRoutingStrategy()

  return async (context, next) => {
    // A locale already in locals (Astro.rewrite) is kept, not redetected.
    if (context.locals.locale && context.locals.i18n) return next()

    const url = context.url
    const pathname = url.pathname
    // a prerendered page has no visitor: no cookie, no header
    const detect = autoDetect && !context.isPrerendered
    const locale = detectLocale(pathname, context.cookies, context.request.headers, defaultLocale, locales, localeCookie, strategy, detect)

    // per-request instance sharing the global cache
    const requestI18n = globalI18n.clone(locale)
    requestI18n.setRoute(strategy?.getRouteName ? strategy.getRouteName(pathname, locales) : routeNameFromPath(pathname, locales))

    // @ts-ignore private property mismatch between src and dist types
    context.locals.i18n = requestI18n
    context.locals.locale = locale
    context.locals.defaultLocale = defaultLocale
    context.locals.locales = localeObjects || locales.map((code) => ({ code }))
    context.locals.currentUrl = url
    // without a URL locale the page depends on the cookie and the header: shared caches must key on them
    const varies = detect && urlLocale(pathname, defaultLocale, locales, strategy) === null
    if (!strategy) return withVary(await next(), varies, localeCookie)

    const contextStrategy: I18nRoutingStrategy = {
      ...strategy,
      getCurrentPath: () => pathname,
      getRoute: () => ({ fullPath: url.pathname + url.search, query: Object.fromEntries(url.searchParams) }),
    }
    context.locals.routingStrategy = contextStrategy
    return withVary(await runWithRoutingStrategy(contextStrategy, () => next()), varies, localeCookie)
  }
}

function withVary(response: Response, varies: boolean, localeCookie: string | null): Response {
  if (!varies) return response
  try {
    response.headers.append('Vary', localeCookie === null ? 'Accept-Language' : 'Cookie, Accept-Language')
  } catch {
    // immutable headers (a fetched Response): left as they are
  }
  return response
}
