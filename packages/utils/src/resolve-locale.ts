import { detectLocaleFromAcceptLanguage } from './accept-language'
import { shouldAttemptLocaleRedirect } from './auto-detect-path'

/**
 * Every source a caller may have for the locale of a request or navigation. A caller passes only
 * the sources it has (and is allowed to use); the order between them lives here only.
 */
export interface ResolveLocaleInput {
  defaultLocale: string
  validLocales: readonly string[]
  autoDetectLanguage?: boolean
  /** Locale prefix of the URL, as the routing strategy reads it. */
  url?: string | null
  /** `?locale=` — only where the caller honours it (no_prefix pages, server API helpers). */
  query?: string | null
  /** A locale the app chose (`useState('i18n-locale')`). */
  state?: string | null
  cookie?: string | null
  acceptLanguage?: string | null
  /** `?locale=` before the URL: the documented order of the server API helpers. */
  queryFirst?: boolean
}

const valid = (code: string | null | undefined, validLocales: readonly string[]): code is string =>
  typeof code === 'string' && validLocales.includes(code)

const pick = (code: string | null | undefined, validLocales: readonly string[]) => (valid(code, validLocales) ? code : null)

/**
 * The first valid explicit source: url → query (query → url with `queryFirst`) → state → cookie;
 * null when none is valid. An invalid value never hides a valid one after it.
 */
export function explicitLocale(input: Omit<ResolveLocaleInput, 'defaultLocale'>): string | null {
  const { validLocales } = input
  const first = input.queryFirst ? input.query : input.url
  const second = input.queryFirst ? input.url : input.query
  return pick(first, validLocales) ?? pick(second, validLocales) ?? pick(input.state, validLocales) ?? pick(input.cookie, validLocales)
}

/**
 * The one precedence: `explicitLocale`, then Accept-Language (only with `autoDetectLanguage` and
 * no explicit source), then the default.
 */
export function resolveLocale(input: ResolveLocaleInput): string {
  const explicit = explicitLocale(input)
  if (explicit) return explicit
  const { validLocales } = input
  if (!input.autoDetectLanguage) return input.defaultLocale
  return detectLocaleFromAcceptLanguage(input.acceptLanguage ?? undefined, validLocales) ?? input.defaultLocale
}

export interface RedirectLocaleInput extends Omit<ResolveLocaleInput, 'url' | 'query' | 'queryFirst'> {
  path: string
  /** Locale prefix of `path`, or null. */
  urlLocale: string | null
  /** `ModuleOptions.autoDetectPath` (default `'/'`). */
  autoDetectPath?: string
  /** `prefix`: no page has an unprefixed URL, so such a URL always takes the preference. */
  alwaysPrefixed?: boolean
}

/** Whether cookie, state and Accept-Language decide this URL's redirect. */
export function preferenceCounts(input: Pick<RedirectLocaleInput, 'path' | 'urlLocale' | 'autoDetectPath' | 'alwaysPrefixed'>): boolean {
  if (input.alwaysPrefixed && !input.urlLocale) return true
  return shouldAttemptLocaleRedirect(input.path, { autoDetectPath: input.autoDetectPath, hasLocalePrefix: input.urlLocale !== null })
}

/**
 * The locale a locale redirect aims at: `resolveLocale` over state → cookie → Accept-Language
 * wherever `autoDetectPath` lets preference count (`'*'`: every path), and on every unprefixed URL
 * under `prefix`. Elsewhere an unprefixed URL keeps the default locale, so it still canonicalizes
 * (`localeRoutes` aliases). The URL is not a source here: it is what the redirect may move.
 */
export function redirectLocale(input: RedirectLocaleInput): string {
  if (!input.urlLocale && !preferenceCounts(input)) return input.defaultLocale
  return resolveLocale(input)
}

/** Locale code in the first path segment, or null. */
export function localeFromPath(path: string, validLocales: readonly string[]): string | null {
  const end = path.indexOf('/', 1)
  const segment = path.slice(1, end === -1 ? undefined : end)
  return valid(segment, validLocales) ? segment : null
}

/** A query value as one locale candidate: `?locale=a&locale=b` is `a`. */
export function firstQueryValue(value: unknown): string | null {
  const first = Array.isArray(value) ? value[0] : value
  return typeof first === 'string' && first ? first : null
}

