import { getEnabledLocaleCodes } from '@i18n-micro/utils/active-locales'
import { getHashCookieName, getLocaleCookieName, getLocaleCookieOptions } from '@i18n-micro/utils/cookie'
import { explicitLocale } from '@i18n-micro/utils/resolve-locale'
import { useCookie, useNuxtApp, useState } from '#app'
import { useResolvedI18nConfig } from '../utils/i18n-config'

type CookieRef = { value: string | null }

/** Callback to get locale from route (RouteService.getCurrentLocale) */
export type GetLocaleFromRoute = (route?: unknown) => string

export interface ResolveInitialLocaleOptions {
  route: unknown
  /** The locale the URL names, under a strategy that has one. */
  urlLocale?: string | null
  serverLocale?: string | null
  getLocaleFromRoute: GetLocaleFromRoute
}

/**
 * Centralized entry point for i18n locale management.
 * Combines useState('i18n-locale'), locale cookie, and sync utilities.
 */
export function useI18nLocale() {
  const nuxtApp = useNuxtApp()
  // the same config the plugin routes with, runtime overrides included, even before the plugin provides it
  const i18nConfig = useResolvedI18nConfig(nuxtApp)
  const validLocales = getEnabledLocaleCodes(i18nConfig.locales)

  const localeState = useState<string | null>('i18n-locale', () => null)

  const localeCookieName = getLocaleCookieName(i18nConfig)
  const hashCookieName = getHashCookieName(i18nConfig)

  const localeCookie = localeCookieName ? useCookie<string | null>(localeCookieName, getLocaleCookieOptions()) : ({ value: null } as CookieRef)

  const hashCookie = hashCookieName ? useCookie<string | null>(hashCookieName, getLocaleCookieOptions()) : ({ value: null } as CookieRef)

  const syncLocale = (locale: string | null) => {
    if (!locale) return
    if (hashCookieName) hashCookie.value = locale
    if (localeCookieName) localeCookie.value = locale
  }

  const setLocale = (locale: string | null) => {
    if (locale) {
      localeState.value = locale
      syncLocale(locale)
    }
  }

  /** The preference cookie: the hash cookie under hashMode (as the server reads it). */
  const preferenceCookie = i18nConfig.hashMode ? hashCookie : localeCookie

  const isValidLocale = (locale: string | null | undefined): locale is string => !!locale && validLocales.includes(locale)

  /** The state or the cookie, whichever is first valid (an invalid state does not hide a valid cookie). */
  const getPreferredLocale = (): string | null => explicitLocale({ validLocales, state: localeState.value, cookie: preferenceCookie.value })

  const getLocale = (): string | null => {
    return localeState.value ?? preferenceCookie.value ?? null
  }

  /** Locale with fallback to serverContext (for noPrefix initialization) */
  const getLocaleWithServerFallback = (serverLocale?: string | null): string | null => {
    return getPreferredLocale() ?? serverLocale ?? null
  }

  /**
   * Effective locale for loading translations and rendering.
   * hashMode: localeState takes priority; otherwise — from route.
   */
  const getEffectiveLocale = (route: unknown, getLocaleFromRoute: GetLocaleFromRoute): string => {
    if (i18nConfig.hashMode && localeState.value !== null && localeState.value !== undefined) return localeState.value
    return getLocaleFromRoute(route)
  }

  /**
   * Resolves initial locale: URL → valid localeState → serverContext → route. The page renders
   * the URL's locale, so a state set by a plugin must not load another locale's chunk for it.
   * Syncs to localeState when it holds no valid locale.
   */
  const resolveInitialLocale = (options: ResolveInitialLocaleOptions): string => {
    const state = isValidLocale(localeState.value) ? localeState.value : null
    const locale = options.urlLocale || state || options.serverLocale || options.getLocaleFromRoute(options.route)
    if (locale && !state) {
      // On server, avoid persisting cookie during initial resolution.
      // Redirect plugin owns cookie writes for redirect flows.
      if (import.meta.server) {
        localeState.value = locale
      } else {
        setLocale(locale)
      }
    }
    return locale ?? ''
  }

  return {
    locale: localeState,
    localeCookie,
    hashCookie,
    getPreferredLocale,
    getLocale,
    getLocaleWithServerFallback,
    getEffectiveLocale,
    resolveInitialLocale,
    setLocale,
    syncLocale,
    isValidLocale,
    validLocales,
  }
}
