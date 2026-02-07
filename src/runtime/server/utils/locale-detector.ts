import type { H3Event } from 'h3'
import { getCookie, getQuery, getRequestURL } from 'h3'

/**
 * Detects the current locale based on various sources (server-only).
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
  config: { fallbackLocale?: string; defaultLocale?: string; locales?: { code: string }[] },
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
  if (locales && locales.length > 0) {
    const url = getRequestURL(event)
    const querySplit = url.pathname.split('?')
    const cleanPath = querySplit[0]?.split('#')[0]
    if (cleanPath) {
      const pathSegments = cleanPath.split('/').filter(Boolean)
      const firstSegment = pathSegments[0] || ''
      if (firstSegment && locales.some((l) => l.code === firstSegment)) {
        return firstSegment
      }
    }
  }

  // 4. Other fallbacks (Cookie, Header, Default)
  return (
    getCookie(event, 'user-locale') ||
    event.headers.get('accept-language')?.split(',')[0] ||
    fallbackLocale ||
    defaultLocale ||
    configDefaultLocale ||
    'en'
  ).toString()
}
