/**
 * Client-side locale redirects (SPA navigations). The decision is the strategy's
 * (`getClientRedirect`); preferences are read from the locale state and the cookie the main
 * plugin keeps, without creating cookie refs per navigation.
 */

import type { ResolvedRouteLike } from '@i18n-micro/path-strategy'
import { getEnabledLocaleCodes } from '@i18n-micro/utils/active-locales'
import { isInternalPath } from '@i18n-micro/utils/app-path'
import { decodeCookieValue, getPreferenceCookieName } from '@i18n-micro/utils/cookie'
import { redirectLocale } from '@i18n-micro/utils/resolve-locale'
import { applyTrailingSlash } from '../utils/trailing-slash'
import { defineNuxtRouteMiddleware, navigateTo, useNuxtApp, useState } from '#imports'

function readCookie(name: string | null): string | null {
  if (!name || typeof document === 'undefined') return null
  const prefix = `${encodeURIComponent(name)}=`
  const entry = document.cookie.split('; ').find((part) => part.startsWith(prefix))
  // a malformed cookie is absent (D2), not a throw on every navigation
  return entry ? decodeCookieValue(entry.slice(prefix.length)) : null
}

export default defineNuxtRouteMiddleware((to, from) => {
  if (import.meta.server) return

  const nuxtApp = useNuxtApp()
  const { $getI18nConfig: getRuntimeConfig, $i18nStrategy: i18nStrategy } = nuxtApp

  const i18nConfig = getRuntimeConfig()
  if (i18nConfig.redirects === false || to.path === from.path || isInternalPath(to.path, i18nConfig.excludePatterns, i18nConfig.apiBaseUrl)) return

  const defaultLocale = i18nConfig.defaultLocale || 'en'
  const autoDetectPath = i18nConfig.autoDetectPath || '/'
  const anyPath = autoDetectPath === '*'
  const path = to.path || '/'
  const urlLocale = i18nStrategy.getLocaleFromPath(path)

  // Same gate and order as the server (#242): state → cookie where `autoDetectPath` allows them;
  // an invalid state does not hide a valid cookie. The route still has the last word.
  const preference = redirectLocale({
    path,
    urlLocale,
    autoDetectPath,
    defaultLocale,
    validLocales: getEnabledLocaleCodes(i18nConfig.locales),
    state: useState<string | null>('i18n-locale', () => null).value,
    cookie: readCookie(getPreferenceCookieName(i18nConfig)),
  })
  const preferred = i18nStrategy.getCurrentLocale(to as unknown as ResolvedRouteLike, preference)

  const target = i18nStrategy.getClientRedirect(path, preferred, { switchPrefixed: anyPath })
  if (target)
    return navigateTo(
      { path: applyTrailingSlash(target, i18nConfig.trailingSlash), query: to.query, hash: to.hash },
      { replace: true, redirectCode: 302 },
    )
})
