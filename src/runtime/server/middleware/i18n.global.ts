/**
 * Nitro middleware: locale detection and event.context.i18n setup only.
 * Redirect logic is handled by plugins and Vue Router redirect routes.
 */

import type { ModuleOptionsExtend } from '@i18n-micro/types'
import { getEnabledLocaleCodes } from '@i18n-micro/utils/active-locales'
import { isInternalPath, withoutAppBaseURL } from '@i18n-micro/utils/app-path'
import { getLocaleCookieName } from '@i18n-micro/utils/cookie'
import { resolveServerLocale } from '@i18n-micro/utils/resolve-locale'
import { resolveI18nConfigWithRuntimeOverrides } from '@i18n-micro/utils/runtime-config'
import { defineEventHandler, getCookie, getHeader, getQuery, getRequestURL } from 'h3'
import { getI18nPrivateConfig } from '#i18n-internal/config'
import { getI18nConfig } from '#i18n-internal/strategy'
import { useRuntimeConfig } from '#imports'
import { loadTranslationsFromServer } from '../utils/server-loader'

export default defineEventHandler(async (event) => {
  const appBaseURL = useRuntimeConfig(event).app.baseURL
  const rawPath = getRequestURL(event).pathname
  const path = withoutAppBaseURL(rawPath, appBaseURL)

  if (isInternalPath(path)) return

  const config = resolveI18nConfigWithRuntimeOverrides(
    getI18nConfig() as ModuleOptionsExtend,
    useRuntimeConfig(event).public as Record<string, unknown>,
  )
  const privateConfig = getI18nPrivateConfig()
  const validLocales = getEnabledLocaleCodes(config.locales)
  const defaultLocale = config.defaultLocale || 'en'

  const firstSegment = path.split('/').filter(Boolean)[0]
  const queryLocale = getQuery(event).locale ? String(getQuery(event).locale) : null
  // The URL decides wherever the router does: a prefix, or the default locale for an unprefixed
  // URL under prefix_except_default (a cookie must not render `de` on the `en` page). An explicit
  // `?locale=` still wins, for server routes that read event.context.i18n.
  const urlLocale =
    firstSegment && validLocales.includes(firstSegment)
      ? firstSegment
      : config.strategy === 'prefix_except_default' && !config.hashMode && !queryLocale
        ? defaultLocale
        : null

  const cookieName = getLocaleCookieName(config)
  const cookieLocale = cookieName ? getCookie(event, cookieName) : null

  const locale = resolveServerLocale({
    defaultLocale,
    validLocales,
    autoDetectLanguage: config.autoDetectLanguage,
    hasLocaleInUrl: urlLocale !== null,
    urlLocale,
    queryLocale,
    cookieLocale,
    acceptLanguageHeader: getHeader(event, 'accept-language'),
  })

  let translations = {}
  if (privateConfig.serverTranslationPreload) {
    try {
      const loaded = await loadTranslationsFromServer(locale, 'index')
      translations = loaded.data
    } catch {
      translations = {}
    }
  }

  event.context.i18n = {
    locale,
    translations,
  }
})
