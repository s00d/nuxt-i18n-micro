/**
 * Nitro middleware: locale detection and event.context.i18n setup only.
 * Redirect logic is handled by plugins and Vue Router redirect routes.
 */

import type { ModuleOptionsExtend } from '@i18n-micro/types'
import { defineEventHandler, getCookie, getHeader, getQuery, getRequestURL } from 'h3'
import { getI18nConfig } from '#i18n-internal/strategy'
import { useRuntimeConfig } from '#imports'
import { getEnabledLocaleCodes } from '../../utils/active-locales'
import { getLocaleCookieName } from '../../utils/cookie'
import { resolveServerLocale } from '../../utils/resolve-server-locale'
import { resolveI18nConfigWithRuntimeOverrides } from '../../utils/runtime-i18n-config'

export default defineEventHandler(async (event) => {
  const path = event.path || getRequestURL(event).pathname

  // Fast early exits — skip internal/static paths
  if (path.startsWith('/api') || path.startsWith('/_nuxt') || path.startsWith('/_locales') || path.startsWith('/__')) return
  if (path.includes('.') && !path.endsWith('.html')) return

  const config = resolveI18nConfigWithRuntimeOverrides(
    getI18nConfig() as ModuleOptionsExtend,
    useRuntimeConfig(event).public as Record<string, unknown>,
  )
  const validLocales = getEnabledLocaleCodes(config.locales)
  const defaultLocale = config.defaultLocale || 'en'

  const pathSegments = path.split('/').filter(Boolean)
  const firstSegment = pathSegments[0]
  const hasLocaleInUrl = Boolean(firstSegment && validLocales.includes(firstSegment))

  const cookieName = getLocaleCookieName(config)
  const queryLocale = getQuery(event).locale ? String(getQuery(event).locale) : null
  const cookieLocale = cookieName ? getCookie(event, cookieName) : null

  const locale = resolveServerLocale({
    defaultLocale,
    validLocales,
    autoDetectLanguage: config.autoDetectLanguage,
    hasLocaleInUrl,
    urlLocale: firstSegment ?? null,
    queryLocale,
    cookieLocale,
    acceptLanguageHeader: getHeader(event, 'accept-language'),
  })

  // Set i18n context for plugins
  event.context.i18n = {
    locale,
    translations: {},
  }
})
