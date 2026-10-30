import type { Locale } from '@i18n-micro/types'
import { getEnabledLocaleCodes } from '@i18n-micro/utils/active-locales'
import { DEFAULT_COOKIE_MAX_AGE } from '@i18n-micro/utils/cookie'
import { resolveLocale } from '@i18n-micro/utils/resolve-locale'
import type { MiddlewareHandler } from 'astro'
import type { AstroI18n } from './composer'
import { header, localeOfPath, normalizeBase, type I18nRouting, type I18nRequest, resolveRequest, switchedFrom, withBase } from './request'
import { createAstroRouterAdapter } from './router/adapter'
import type { I18nRoutingStrategy } from './router/types'
// Import shim to ensure App.Locals is available
import './env.d'

export interface I18nMiddlewareOptions {
  i18n: AstroI18n
  defaultLocale: string
  locales: string[]
  localeObjects?: Locale[]
  /** `/` redirects to the locale the cookie / Accept-Language prefer (default `true`); pages keep the URL's locale. */
  autoDetect?: boolean
  /**
   * `/` also redirects when nothing prefers another locale: to the home `routingStrategy` resolves
   * for the default locale (default `false`). Without one `/` stays: it is the default locale's page.
   */
  redirectToDefault?: boolean
  routingStrategy?: I18nRoutingStrategy
  /** Cookie holding the visitor's locale (default `'i18n-locale'`); `null` disables it. */
  localeCookie?: string | null
  /** Astro's `base`, `config.base` of the virtual config. */
  base?: string
}

export const DEFAULT_ASTRO_LOCALE_COOKIE = 'i18n-locale'

interface CookieReader {
  get: (name: string) => { value: string } | undefined
}

function cookie(cookies: CookieReader, name: string | null): string | null {
  if (name === null) return null
  try {
    return cookies.get(name)?.value ?? null
  } catch {
    return null
  }
}

/** Every path method a strategy leaves out comes from the default adapter. Methods stay on the strategy, whatever its class. */
function completeStrategy(strategy: I18nRoutingStrategy | null | undefined, locales: Locale[], defaultLocale: string): I18nRoutingStrategy {
  const fallback = createAstroRouterAdapter(locales, defaultLocale)
  if (!strategy) return fallback
  const complete = Object.create(strategy) as Record<string, unknown>
  for (const [name, method] of Object.entries(fallback)) complete[name] ??= method
  return complete as unknown as I18nRoutingStrategy
}

/**
 * Locale a visitor prefers: URL prefix → cookie → Accept-Language → default, the one precedence of
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
  const strategy = completeStrategy(routingStrategy, locales.map((code) => ({ code })), defaultLocale)
  return resolveLocale({
    defaultLocale,
    validLocales: locales,
    autoDetectLanguage: autoDetect,
    url: localeOfPath(pathname, { defaultLocale, locales, strategy }),
    cookie: autoDetect ? cookie(cookies, localeCookie) : null,
    acceptLanguage: autoDetect ? header({ request: { headers } }, 'accept-language') : null,
  })
}

let warnedTwice = false

/** Two middlewares made by this function: the first wins, the second one's options would be lost silently. */
function warnTwice(): void {
  if (warnedTwice) return
  warnedTwice = true
  console.warn('[i18n-micro] i18nIntegration already installs the middleware: pass `middleware: false` to it to use your own createI18nMiddleware.')
}

/** Create Astro middleware for i18n locale detection */
export function createI18nMiddleware(options: I18nMiddlewareOptions): MiddlewareHandler {
  const { i18n: globalI18n, defaultLocale, localeObjects, autoDetect = true } = options
  const localeCookie = options.localeCookie === undefined ? DEFAULT_ASTRO_LOCALE_COOKIE : options.localeCookie
  const allLocales = localeObjects ?? options.locales.map((code) => ({ code }))
  const base = normalizeBase(options.base)
  const routing: I18nRouting = {
    defaultLocale,
    base,
    locales: getEnabledLocaleCodes(allLocales).filter((code) => options.locales.includes(code)),
    strategy: completeStrategy(options.routingStrategy, allLocales, defaultLocale),
  }
  const cookieOptions = { path: base || '/', maxAge: DEFAULT_COOKIE_MAX_AGE, sameSite: 'lax' as const }

  const handler: MiddlewareHandler = async (context, next) => {
    // A locale already in locals (Astro.rewrite) is kept, not redetected.
    if (context.locals.locale && context.locals.i18n) {
      if (context.locals.i18nHandler && context.locals.i18nHandler !== handler) warnTwice()
      return next()
    }

    const request = resolveRequest(context, routing)
    const { path, url, locale } = request

    // Coming from a page of another locale is the visitor's choice, whatever link took them here:
    // it is remembered, and it is no landing to redirect, or a switcher could never reach `/`.
    const switched = switchedFrom(context, request, routing) !== null
    if (switched && localeCookie !== null) context.cookies.set(localeCookie, locale, cookieOptions)

    // autoDetect is a redirect hint on the home page only (as the Nuxt module's autoDetectPath '/'):
    // a visitor whose cookie / Accept-Language prefers another locale is sent to that locale's home.
    // A prerendered page has no visitor: no cookie, no header, no redirect.
    const home = !context.isPrerendered && path === '/'
    const hinted = autoDetect && home && !switched
    const preferred = hinted
      ? detectLocale(path, context.cookies, context.request.headers, defaultLocale, routing.locales, localeCookie, routing.strategy)
      : locale
    const target = preferred !== locale || (home && options.redirectToDefault) ? homeOf(preferred, routing) : path
    if (target !== path) return withVary(context.redirect(withBase(target, base) + url.search, 302), hinted, localeCookie)

    Object.assign(context.locals, requestLocals(globalI18n, request, routing, allLocales, handler))
    // the home page is a redirect or not depending on the cookie and the header: shared caches key on them
    return withVary(await next(), hinted, localeCookie)
  }
  return handler
}

/** What a page reads: a per-request instance sharing the global dictionaries, and the request's model. */
function requestLocals(globalI18n: AstroI18n, request: I18nRequest, routing: I18nRouting, locales: Locale[], handler: MiddlewareHandler) {
  const { url, path, locale, route } = request
  const i18n = globalI18n.fork(locale)
  i18n.setRoute(route)
  const strategy = Object.create(routing.strategy) as I18nRoutingStrategy
  strategy.getCurrentPath = () => path
  strategy.getRoute = () => ({ fullPath: path + url.search, query: Object.fromEntries(url.searchParams) })
  return {
    i18n,
    locale,
    defaultLocale: routing.defaultLocale,
    locales,
    currentUrl: url,
    routingStrategy: strategy,
    i18nBase: routing.base,
    i18nHandler: handler,
  }
}

/** A locale's home: the strategy's path for `/` in that locale. */
function homeOf(locale: string, { strategy }: I18nRouting): string {
  const resolved = strategy.resolvePath!('/', locale)
  return (typeof resolved === 'string' ? resolved : resolved.path) || '/'
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
