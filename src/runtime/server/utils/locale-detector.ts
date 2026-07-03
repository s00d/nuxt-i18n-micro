import type { ModuleOptionsExtend } from '@i18n-micro/types'
import { getEnabledLocaleCodes } from '@i18n-micro/utils/active-locales'
import { withoutAppBaseURL } from '@i18n-micro/utils/app-path'
import { getLocaleCookieName } from '@i18n-micro/utils/cookie'
import { resolveServerLocale } from '@i18n-micro/utils/resolve-locale'
import type { H3Event } from 'h3'
import { getCookie, getQuery, getRequestURL } from 'h3'
import { useRuntimeConfig } from '#imports'

export interface DetectCurrentLocaleConfig {
  fallbackLocale?: string
  defaultLocale?: string
  locales?: { code: string }[]
  localeCookie?: string | null
  autoDetectLanguage?: boolean
}

/**
 * Detects the current locale based on various sources (server-only).
 * Thin wrapper around `resolveServerLocale` with configured cookie name.
 */
export const detectCurrentLocale = (event: H3Event, config: DetectCurrentLocaleConfig, defaultLocale?: string): string => {
  const { fallbackLocale, defaultLocale: configDefaultLocale, locales, localeCookie, autoDetectLanguage } = config

  if (event.context.params?.locale) {
    return event.context.params.locale.toString()
  }

  const resolvedDefault = defaultLocale || configDefaultLocale || 'en'
  const validLocales = getEnabledLocaleCodes(locales ?? [])
  const url = getRequestURL(event)
  const rawPath = url.pathname.split('?')[0]?.split('#')[0] ?? url.pathname
  const cleanPath = withoutAppBaseURL(rawPath, useRuntimeConfig(event).app.baseURL)
  const pathSegments = cleanPath.split('/').filter(Boolean)
  const firstSegment = pathSegments[0] ?? ''
  const hasLocaleInUrl = Boolean(firstSegment && validLocales.includes(firstSegment))
  const queryLocale = getQuery(event)?.locale ? String(getQuery(event).locale) : null
  const cookieName = getLocaleCookieName({ localeCookie } as ModuleOptionsExtend)
  const cookieLocale = cookieName ? getCookie(event, cookieName) : null

  const locale = resolveServerLocale({
    defaultLocale: resolvedDefault,
    validLocales,
    autoDetectLanguage,
    hasLocaleInUrl,
    urlLocale: firstSegment || null,
    queryLocale,
    cookieLocale,
    acceptLanguageHeader: event.headers.get('accept-language'),
  })

  return locale || fallbackLocale || resolvedDefault
}
