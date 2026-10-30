import { externalLinkHref } from '@i18n-micro/core'
import { withoutAppBaseURL } from '@i18n-micro/utils/app-path'
import { localeFromPath } from '@i18n-micro/utils/resolve-locale'
import type { I18nRoutingStrategy } from './router/types'

/**
 * The one request model. Everything below works on the page's path without Astro's `base`:
 * the middleware strips it once, every URL that goes out gets it back from {@link withBase}.
 */
export interface I18nRouting {
  defaultLocale: string
  /** Codes of the locales in service: a disabled one is neither a URL's locale nor a redirect target. */
  locales: string[]
  /** `''` or `/docs`, no trailing slash. */
  base: string
  strategy: I18nRoutingStrategy
}

/** The parts of an Astro context a request is read from: also a mock in tests. */
export interface RequestContext {
  url: URL
  params?: Record<string, string | undefined>
  routePattern?: string
  isPrerendered?: boolean
  request: { headers: Headers }
}

export interface I18nRequest {
  /** The page this request is for: another URL than `context.url` for a server island or action. */
  url: URL
  /** `url.pathname` without `base`. */
  path: string
  /** The locale `url` names, `null` for an unprefixed URL. */
  urlLocale: string | null
  /** The URL's locale, else the default one: an unprefixed URL is the default locale's page. */
  locale: string
  route: string
}

export const normalizeBase = (base: string | undefined): string => (base ?? '').replace(/\/+$/, '')

/** `path`, which has no `base`, as a URL of the site. */
export function withBase(path: string, base: string): string {
  if (!base) return path
  return path === '/' ? base : `${base}${path}`
}

/** A request header, or null where there is none (static prerendering). */
export function header(context: Pick<RequestContext, 'request'>, name: string): string | null {
  try {
    return context.request.headers.get(name)
  } catch {
    return null
  }
}

/**
 * The URL of the page this request comes from. Same origin only: another site's link says
 * nothing about this visitor, and a malformed header is no page. Prerendering has no visitor.
 */
export function refererUrl(context: RequestContext): URL | null {
  if (context.isPrerendered) return null
  const referer = header(context, 'referer')
  if (!referer) return null
  try {
    const url = new URL(referer)
    return url.origin === context.url.origin ? url : null
  } catch {
    return null
  }
}

/**
 * A server island or action has no locale in its URL: it is a part of the page that asked for it.
 * ponytail: without a `Referer` (a `no-referrer` policy) it renders in the default locale, and on a
 * dynamic page its route name comes from the URL; route patterns in the config would settle that.
 */
const isPartOfPage = (pattern: string | undefined): boolean => pattern?.startsWith('/_server-islands/') === true || pattern?.startsWith('/_actions/') === true

/** The route's pattern, a `[locale]` param replaced by its value so the locale drops out of the name. */
function pagePattern(context: RequestContext, locales: string[]): string | undefined {
  const { routePattern: pattern, params } = context
  if (!pattern) return undefined
  const first = /^\/\[([^\].]+)\]/.exec(pattern)
  const value = first ? params?.[first[1]!] : undefined
  return value && locales.includes(value) ? `/${value}${pattern.slice(first![0].length)}` : pattern
}

/**
 * Locale a path names: its prefix, or what the strategy reads from it when that is not the default
 * (a strategy's `getLocaleFromPath` answers the default for a URL without a locale).
 */
export function localeOfPath(path: string, { defaultLocale, locales, strategy }: Omit<I18nRouting, 'base'>): string | null {
  const prefix = localeFromPath(path, locales)
  if (prefix) return prefix
  const read = strategy.getLocaleFromPath?.(path, defaultLocale, locales) ?? null
  return read !== defaultLocale && read !== null && locales.includes(read) ? read : null
}

export function resolveRequest(context: RequestContext, routing: I18nRouting): I18nRequest {
  const { strategy, locales, defaultLocale, base } = routing
  const partOfPage = isPartOfPage(context.routePattern)
  const url = (partOfPage && refererUrl(context)) || context.url
  const path = withoutAppBaseURL(url.pathname, base)
  const urlLocale = localeOfPath(path, routing)
  const pattern = partOfPage ? undefined : pagePattern(context, locales)
  return { url, path, urlLocale, locale: urlLocale ?? defaultLocale, route: strategy.getRouteName!(path, locales, pattern) }
}

/** The locale of the same-origin page the visitor comes from, when it is not the one of this request: they just switched. */
export function switchedFrom(context: RequestContext, request: I18nRequest, routing: I18nRouting): string | null {
  const from = refererUrl(context)
  if (!from || isPartOfPage(context.routePattern)) return null
  const locale = localeOfPath(withoutAppBaseURL(from.pathname, routing.base), routing) ?? routing.defaultLocale
  return locale === request.locale ? null : locale
}

/** A scheme this router has no business with: `sms:`, `ftp:`, `javascript:`. `externalLinkHref` handles the common ones. */
const SCHEME = /^[a-z][a-z\d+.-]*:/i

export interface HrefContext extends Pick<I18nRouting, 'base' | 'defaultLocale' | 'strategy'> {
  codes: string[]
  /** What a relative `href` resolves against: the page's path. */
  from?: string
}

/**
 * `href` as a link to `locale`. What leaves the app, and a bare `#hash` or `?query`, stays as
 * written; a route is localized and keeps its query, hash and trailing slash.
 */
export function localizeHref(href: string, locale: string, context: HrefContext): string {
  if (href === '' || href[0] === '#' || href[0] === '?') return href
  const external = externalLinkHref(href) ?? (SCHEME.test(href) ? href : undefined)
  if (external) return external
  const { strategy, codes, defaultLocale, base, from = '/' } = context
  const cut = href.search(/[?#]/)
  const raw = cut === -1 ? href : href.slice(0, cut)
  const path = raw[0] === '/' ? withoutAppBaseURL(raw, base) : `${from === '/' ? '' : from}/${raw}`
  const localized = strategy.localizePath!(path, locale, codes, defaultLocale)
  const slash = raw.length > 1 && raw.endsWith('/') && !localized.endsWith('/') ? '/' : ''
  return `${withBase(localized + slash, base)}${cut === -1 ? '' : href.slice(cut)}`
}
