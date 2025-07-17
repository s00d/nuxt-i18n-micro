import type { H3Event } from 'h3'
import { getQuery, getCookie } from 'h3'

/**
 * Detects the current locale based on various sources
 * @param event - H3Event object
 * @param config - Runtime configuration with i18n settings
 * @param defaultLocale - Optional default locale override
 * @returns The detected locale code
 */
export const detectCurrentLocale = (
  event: H3Event,
  config: { fallbackLocale?: string, defaultLocale?: string },
  defaultLocale?: string,
): string => {
  const { fallbackLocale, defaultLocale: configDefaultLocale } = config

  return (
    event.context.params?.locale
    || getQuery(event)?.locale
    || getCookie(event, 'user-locale')
    || event.headers.get('accept-language')?.split(',')[0]
    || fallbackLocale
    || defaultLocale
    || configDefaultLocale
    || 'en'
  ).toString()
}
