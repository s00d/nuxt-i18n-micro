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
  request: { headers: Headers; method?: string }
}

export interface I18nRequest {
  /** The page this request is for: another URL than `context.url` for a server island or action. */
  url: URL
  /** A server island or action: it belongs to the page in `url`, and is no page view itself. */
  partOfPage: boolean
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

/** The URL of the page this request comes from. A malformed header is no page, and prerendering has no visitor. */
function refererUrl(context: RequestContext): URL | null {
  const referer = context.isPrerendered ? null : header(context, 'referer')
  if (!referer) return null
  try {
    return new URL(referer)
  } catch {
    return null
  }
}

/**
 * Whether `from` is this site. The browser's word first: behind a TLS proxy `context.url` may be the
 * internal URL. Without that header the host decides, and a proxy needs `security.allowedDomains`.
 */
function isSameSite(context: RequestContext, from: URL): boolean {
  const site = header(context, 'sec-fetch-site')
  return site ? site === 'same-origin' : from.host === context.url.host
}

/**
 * A server island or action has no locale in its URL: it is a part of the page that asked for it.
 * Any origin counts here: a forged `Referer` changes only the forger's own answer, and the internal
 * URL behind a proxy matches no public one. The page's path, on this server's origin.
 * ponytail: without a `Referer` (a `no-referrer` policy) it renders in the default locale, and on a
 * dynamic page its route name comes from the URL; route patterns in the config would settle that.
 */
function pageOfPart(context: RequestContext): URL | null {
  const from = refererUrl(context)
  return from && new URL(from.pathname + from.search, context.url)
}

const isPartOfPage = (pattern: string | undefined): boolean =>
  pattern?.startsWith('/_server-islands/') === true || pattern?.startsWith('/_actions/') === true

/** The route's pattern, a `[locale]` param replaced by its value so the locale drops out of the name. */
function pagePattern(context: RequestContext, locales: string[]): string | undefined {
  const { routePattern: pattern, params } = context
  if (!pattern) return undefined
  const first = /^\/\[([^\].]+)\]/.exec(pattern)
  const value = first ? params?.[first[1]!] : undefined
  if (!value) return pattern
  const rest = pattern.slice(first![0].length)
  if (locales.includes(value)) return `/${value}${rest}`
  // a disabled locale still matches `[locale]`: it is no part of the page's name
  return first![1] === 'locale' ? rest || '/' : pattern
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
  const url = (partOfPage && pageOfPart(context)) || context.url
  const path = withoutAppBaseURL(url.pathname, base)
  const urlLocale = localeOfPath(path, routing)
  const pattern = partOfPage ? undefined : pagePattern(context, locales)
  return { url, partOfPage, path, urlLocale, locale: urlLocale ?? defaultLocale, route: strategy.getRouteName!(path, locales, pattern) }
}

/** Whether the visitor comes from a page of this site in another locale. */
export function isSwitch(context: RequestContext, request: I18nRequest, routing: I18nRouting): boolean {
  const from = refererUrl(context)
  if (!from || !isSameSite(context, from)) return false
  const locale = localeOfPath(withoutAppBaseURL(from.pathname, routing.base), routing) ?? routing.defaultLocale
  return locale !== request.locale
}

/** A document may be asked for by this request: an island, an action or a form post is no landing. */
export function asksForPage(context: RequestContext, request: I18nRequest): boolean {
  const method = context.request.method ?? 'GET'
  return !request.partOfPage && !context.isPrerendered && (method === 'GET' || method === 'HEAD')
}

/**
 * The visitor did see this response as a page: no endpoint, image, 404 or redirect, and not a
 * prefetch of a link they may never follow.
 * ponytail: a `fetch` of an HTML fragment from a page of another locale still counts; `<ClientRouter>`
 * navigates by `fetch` too, and the two look the same from here.
 */
export function isPageView(context: RequestContext, response: Response): boolean {
  if (!response.ok || !response.headers.get('content-type')?.startsWith('text/html')) return false
  return !/prefetch/.test(`${header(context, 'sec-purpose')} ${header(context, 'purpose')}`)
}

/** A scheme this router has no business with: `sms:`, `ftp:`, `javascript:`. `externalLinkHref` handles the common ones. */
const SCHEME = /^[a-z][a-z\d+.-]*:/i

/** `/a/b/../c` → `/a/c`, or a `../` would climb out of the locale prefix once one is added. `%2e` counts: a browser reads it as a dot. */
function withoutDots(path: string): string {
  if (!/\/(\.|%2e)/i.test(path)) return path
  const kept: string[] = []
  for (const segment of path.split('/')) {
    const plain = segment.replace(/%2e/gi, '.')
    if (plain === '..') kept.pop()
    else if (plain !== '.' && segment !== '') kept.push(segment)
  }
  return `/${kept.join('/')}`
}

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
  const path = withoutDots(raw[0] === '/' ? withoutAppBaseURL(raw, base) : `${from.replace(/\/+$/, '')}/${raw}`)
  const localized = strategy.localizePath!(path, locale, codes, defaultLocale)
  const slash = raw.length > 1 && raw.endsWith('/') && !localized.endsWith('/') ? '/' : ''
  return `${withBase(localized + slash, base)}${cut === -1 ? '' : href.slice(cut)}`
}
