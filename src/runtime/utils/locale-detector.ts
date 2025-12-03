import type { H3Event } from 'h3'
import { getQuery, getCookie, getRequestURL } from 'h3'

/**
 * Detects the current locale based on various sources
 * @param event - H3Event object
 * @param config - Runtime configuration with i18n settings
 * @param config.fallbackLocale - Fallback locale from config
 * @param config.defaultLocale - Default locale from config
 * @param config.locales - List of available locales
 * @param defaultLocale - Optional default locale override
 * @returns The detected locale code
 */
export const detectCurrentLocale = (
  event: H3Event,
  config: { fallbackLocale?: string, defaultLocale?: string, locales?: { code: string }[] },
  defaultLocale?: string,
): string => {
  const { fallbackLocale, defaultLocale: configDefaultLocale, locales } = config

  // 1. Priority: route parameters (if Nitro has already determined them)
  if (event.context.params?.locale) {
    return event.context.params.locale.toString()
  }

  // 2. Priority: Query parameters (?locale=de)
  const queryLocale = getQuery(event)?.locale
  if (queryLocale) {
    return queryLocale.toString()
  }

  // 3. Manual URL path check (for prefix strategy)
  // This is critical if event.context.params is empty but URL contains a prefix
  if (locales && locales.length > 0) {
    const url = getRequestURL(event)
    // Remove query params and hash to ensure clean path comparison
    const cleanPath = url.pathname.split('?')[0].split('#')[0]
    const firstSegment = cleanPath.split('/').filter(Boolean)[0] // Get the first non-empty segment after the slash

    // If the first segment matches one of the locale codes, use it
    if (firstSegment && locales.some(l => l.code === firstSegment)) {
      return firstSegment
    }
  }

  // 4. Other fallbacks (Cookie, Header, Default)
  return (
    getCookie(event, 'user-locale')
    || event.headers.get('accept-language')?.split(',')[0]
    || fallbackLocale
    || defaultLocale
    || configDefaultLocale
    || 'en'
  ).toString()
}
