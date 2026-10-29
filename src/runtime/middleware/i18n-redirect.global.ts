/**
 * Client-side locale redirects (SPA navigations). The decision is the strategy's
 * (`getClientRedirect`); preferences are read from the locale state and the cookie the main
 * plugin keeps, without creating cookie refs per navigation.
 */

import type { ModuleOptionsExtend } from '@i18n-micro/types'
import type { PathStrategy, ResolvedRouteLike } from '@i18n-micro/path-strategy'
import { getEnabledLocaleCodes } from '@i18n-micro/utils/active-locales'
import { isInternalPath } from '@i18n-micro/utils/app-path'
import { shouldAttemptLocaleRedirect } from '@i18n-micro/utils/auto-detect-path'
import { getHashCookieName, getLocaleCookieName } from '@i18n-micro/utils/cookie'
import { defineNuxtRouteMiddleware, navigateTo, useNuxtApp, useState } from '#imports'

function readCookie(name: string | null): string | null {
  if (!name || typeof document === 'undefined') return null
  const prefix = `${encodeURIComponent(name)}=`
  const entry = document.cookie.split('; ').find((part) => part.startsWith(prefix))
  return entry ? decodeURIComponent(entry.slice(prefix.length)) : null
}

export default defineNuxtRouteMiddleware((to, from) => {
  if (import.meta.server) return

  const nuxtApp = useNuxtApp()
  const getRuntimeConfig = (nuxtApp as unknown as { $getI18nConfig?: () => ModuleOptionsExtend }).$getI18nConfig
  const i18nStrategy = (nuxtApp as unknown as { $i18nStrategy?: PathStrategy }).$i18nStrategy
  if (typeof getRuntimeConfig !== 'function' || !i18nStrategy) return

  const i18nConfig = getRuntimeConfig()
  if (i18nConfig.redirects === false || to.path === from.path || isInternalPath(to.path, i18nConfig.excludePatterns)) return

  const defaultLocale = i18nConfig.defaultLocale || 'en'
  const autoDetectPath = i18nConfig.autoDetectPath || '/'
  const anyPath = autoDetectPath === '*'
  const path = to.path || '/'
  const urlLocale = i18nStrategy.getLocaleFromPath(path)

  const validLocales = getEnabledLocaleCodes(i18nConfig.locales)
  const stored =
    useState<string | null>('i18n-locale', () => null).value ??
    readCookie(i18nConfig.hashMode ? getHashCookieName(i18nConfig) : getLocaleCookieName(i18nConfig))
  const preference = stored && validLocales.includes(stored) ? stored : null

  // Cookie / Accept-Language preference is gated by autoDetectPath (#242); unprefixed deep links
  // still canonicalize with the default locale (localeRoutes aliases).
  const allowed = shouldAttemptLocaleRedirect(path, { autoDetectPath, hasLocalePrefix: urlLocale !== null })
  const preferred =
    !urlLocale && (anyPath || !allowed)
      ? defaultLocale
      : i18nStrategy.getCurrentLocale(to as unknown as ResolvedRouteLike, preference) || preference || defaultLocale

  const target = i18nStrategy.getClientRedirect(path, preferred, { switchPrefixed: anyPath })
  if (target) return navigateTo({ path: target, query: to.query, hash: to.hash }, { replace: true, redirectCode: 302 })
})
