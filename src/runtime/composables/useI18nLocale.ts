import type { ModuleOptionsExtend } from '@i18n-micro/types'
import { useState } from '#app'
import { getI18nConfig } from '#build/i18n.strategy.mjs'
import { useCookie } from '#imports'
import { getHashCookieName, getLocaleCookieName, getLocaleCookieOptions } from '../utils/cookie'

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
  const i18nConfig = getI18nConfig() as ModuleOptionsExtend
  const validLocales = i18nConfig.locales?.map((l) => l.code) || []

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

  const getPreferredLocale = (): string | null => {
    const preferred = localeState.value ?? (i18nConfig.hashMode ? hashCookie.value : localeCookie.value)
    return preferred && validLocales.includes(preferred) ? preferred : null
  }

  const getLocale = (): string | null => {
    return localeState.value ?? (i18nConfig.hashMode ? hashCookie.value : localeCookie.value) ?? null
  }

  /** Locale with fallback to serverContext (for noPrefix initialization) */
  const getLocaleWithServerFallback = (serverLocale?: string | null): string | null => {
    return localeState.value ?? localeCookie.value ?? serverLocale ?? null
  }

  /**
   * Effective locale for loading translations and rendering.
   * hashMode: localeState takes priority; otherwise — from route.
   */
  const getEffectiveLocale = (route: unknown, getLocaleFromRoute: GetLocaleFromRoute): string => {
    if (i18nConfig.hashMode && localeState.value != null) return localeState.value
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
    if (locale && !localeState.value) setLocale(locale)
    return locale ?? ''
  }

  const isValidLocale = (locale: string | null | undefined): locale is string => !!locale && validLocales.includes(locale)

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
