import { applyAutoDetectLanguage } from './accept-language'

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

export function resolveServerLocale(input: ResolveServerLocaleInput): string {
  const { defaultLocale, validLocales, autoDetectLanguage, hasLocaleInUrl, urlLocale, queryLocale, cookieLocale, acceptLanguageHeader } = input

  let locale = defaultLocale
  let hasExplicitPreference = false

  if (hasLocaleInUrl && urlLocale && validLocales.includes(urlLocale)) {
    locale = urlLocale
    hasExplicitPreference = true
  } else if (queryLocale && validLocales.includes(queryLocale)) {
    locale = queryLocale
    hasExplicitPreference = true
  } else if (cookieLocale && validLocales.includes(cookieLocale)) {
    locale = cookieLocale
    hasExplicitPreference = true
  }

  return applyAutoDetectLanguage(locale, hasExplicitPreference, autoDetectLanguage, acceptLanguageHeader ?? undefined, validLocales)
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

export function resolvePreferredLocale(input: ResolvePreferredLocaleInput): string {
  const { defaultLocale, validLocales, autoDetectLanguage, stateLocale, cookieLocale, acceptLanguageHeader, ignoreStateLocale = false } = input

  let preferredLocale = defaultLocale
  let hasExplicitPreference = false

  if (!ignoreStateLocale && stateLocale && validLocales.includes(stateLocale)) {
    preferredLocale = stateLocale
    hasExplicitPreference = true
  } else if (cookieLocale && validLocales.includes(cookieLocale)) {
    preferredLocale = cookieLocale
    hasExplicitPreference = true
  }

  return applyAutoDetectLanguage(preferredLocale, hasExplicitPreference, autoDetectLanguage, acceptLanguageHeader ?? undefined, validLocales)
}
