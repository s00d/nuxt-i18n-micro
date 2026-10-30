import { detectLocaleFromAcceptLanguage } from './accept-language'

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
}

const valid = (code: string | null | undefined, validLocales: readonly string[]): code is string =>
  typeof code === 'string' && validLocales.includes(code)

/**
 * The one precedence: url → query → state → cookie → Accept-Language (only with
 * `autoDetectLanguage` and no explicit source) → default. Invalid values are skipped.
 */
export function resolveLocale(input: ResolveLocaleInput): string {
  const { validLocales } = input
  const explicit = [input.url, input.query, input.state, input.cookie].find((code) => valid(code, validLocales))
  if (explicit) return explicit
  if (!input.autoDetectLanguage) return input.defaultLocale
  return detectLocaleFromAcceptLanguage(input.acceptLanguage ?? undefined, validLocales) ?? input.defaultLocale
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

export interface ResolveServerLocaleInput {
  defaultLocale: string
  validLocales: string[]
  autoDetectLanguage?: boolean
  hasLocaleInUrl: boolean
  urlLocale?: string | null
  queryLocale?: string | null
  cookieLocale?: string | null
  acceptLanguageHeader?: string | null
}

/** @deprecated `resolveLocale` with `url`, `query`, `cookie`. */
export function resolveServerLocale(input: ResolveServerLocaleInput): string {
  return resolveLocale({
    defaultLocale: input.defaultLocale,
    validLocales: input.validLocales,
    autoDetectLanguage: input.autoDetectLanguage,
    url: input.hasLocaleInUrl ? input.urlLocale : null,
    query: input.queryLocale,
    cookie: input.cookieLocale,
    acceptLanguage: input.acceptLanguageHeader,
  })
}

export interface ResolvePreferredLocaleInput {
  defaultLocale: string
  validLocales: string[]
  autoDetectLanguage?: boolean
  stateLocale?: string | null
  cookieLocale?: string | null
  acceptLanguageHeader?: string | null
  ignoreStateLocale?: boolean
}

/** @deprecated `resolveLocale` with `state`, `cookie`. */
export function resolvePreferredLocale(input: ResolvePreferredLocaleInput): string {
  return resolveLocale({
    defaultLocale: input.defaultLocale,
    validLocales: input.validLocales,
    autoDetectLanguage: input.autoDetectLanguage,
    state: input.ignoreStateLocale ? null : input.stateLocale,
    cookie: input.cookieLocale,
    acceptLanguage: input.acceptLanguageHeader,
  })
}
