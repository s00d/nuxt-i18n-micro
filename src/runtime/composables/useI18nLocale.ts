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
    return localeState.value ?? preferenceCookie.value ?? serverLocale ?? null
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
   * Resolves initial locale: localeState → serverContext → route.
   * Syncs to localeState when needed.
   */
  const resolveInitialLocale = (options: ResolveInitialLocaleOptions): string => {
    let locale = localeState.value
    if (!locale && options.serverLocale) locale = options.serverLocale
    if (!locale) locale = options.getLocaleFromRoute(options.route)
    if (locale && !localeState.value) {
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
