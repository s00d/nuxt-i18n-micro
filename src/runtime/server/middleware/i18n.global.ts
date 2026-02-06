/**
 * Nitro middleware: locale detection and event.context.i18n setup only.
 * Redirect logic is handled by plugins and Vue Router redirect routes.
 */
import { defineEventHandler, getCookie, getQuery, getRequestURL, getHeader } from 'h3'
import { getI18nConfig } from '#i18n-internal/strategy'
import type { ModuleOptionsExtend } from '@i18n-micro/types'
import { getLocaleCookieName } from '../../utils/cookie'

function parseAcceptLanguage(header: string | undefined): string[] {
  if (!header) return []
  return header
    .split(',')
    .map((entry) => {
      const [lang] = entry.split(';')
      return (lang ?? '').trim()
    })
    .filter((s): s is string => s.length > 0)
}

export default defineEventHandler(async (event) => {
  const path = event.path || getRequestURL(event).pathname

  // Fast early exits — skip internal/static paths
  if (path.startsWith('/api') || path.startsWith('/_nuxt') || path.startsWith('/_locales') || path.startsWith('/__')) return
  if (path.includes('.') && !path.endsWith('.html')) return

  const config = getI18nConfig() as ModuleOptionsExtend
  const validLocales = config.locales?.map(l => l.code) || []
  const defaultLocale = config.defaultLocale || 'en'

  const pathSegments = path.split('/').filter(Boolean)
  const firstSegment = pathSegments[0]
  const hasLocaleInUrl = Boolean(firstSegment && validLocales.includes(firstSegment))

  // Determine current locale
  let locale = defaultLocale

  if (hasLocaleInUrl) {
    locale = firstSegment!
  }
  else if (getQuery(event).locale && validLocales.includes(String(getQuery(event).locale))) {
    locale = String(getQuery(event).locale)
  }
  else {
    const cookieName = getLocaleCookieName(config)
    if (cookieName) {
      const cookieVal = getCookie(event, cookieName)
      if (cookieVal && validLocales.includes(cookieVal)) locale = cookieVal
    }
  }

  // Apply Accept-Language detection if no explicit locale found
  if (config.autoDetectLanguage && locale === defaultLocale) {
    const acceptHeader = getHeader(event, 'accept-language')
    const langs = parseAcceptLanguage(acceptHeader)
    for (const lang of langs) {
      const lowerCaseLanguage = lang.toLowerCase()
      const primaryLanguage = lowerCaseLanguage.split('-')[0]
      const found = validLocales.find(l => l.toLowerCase() === lowerCaseLanguage || l.toLowerCase() === primaryLanguage)
      if (found) {
        locale = found
        break
      }
    }
  }

  // Set i18n context for plugins
  event.context.i18n = {
    locale,
    translations: {},
  }
})
