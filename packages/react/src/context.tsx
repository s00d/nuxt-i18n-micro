import React from 'react'
// Use shim for React 17 compatibility
import { useSyncExternalStore } from 'use-sync-external-store/shim'
import type { ReactI18n } from './i18n'
import type {
  Translations,
  Params,
  TranslationKey,
  CleanTranslation,
  Locale,
} from '@i18n-micro/types'
import {
  I18nContext,
  I18nLocalesContext,
  I18nDefaultLocaleContext,
  I18nRouterContext,
  useI18nContext,
  useI18nLocales,
  useI18nDefaultLocale,
  useI18nRouter,
} from './injection'
import type { I18nRoutingStrategy } from './router/types'

export interface I18nProviderProps {
  i18n: ReactI18n
  locales?: Locale[]
  defaultLocale?: string
  routingStrategy?: I18nRoutingStrategy
  children: React.ReactNode
}

export function I18nProvider({ i18n, locales, defaultLocale, routingStrategy, children }: I18nProviderProps): React.ReactElement {
  return React.createElement(
    I18nContext.Provider,
    { value: i18n },
    locales
      ? React.createElement(
          I18nLocalesContext.Provider,
          { value: locales },
          defaultLocale
            ? React.createElement(
                I18nDefaultLocaleContext.Provider,
                { value: defaultLocale },
                routingStrategy
                  ? React.createElement(
                      I18nRouterContext.Provider,
                      { value: routingStrategy },
                      children,
                    )
                  : children,
              )
            : children,
        )
      : children,
  )
}

export interface UseI18nOptions {
  locales?: Locale[]
  defaultLocale?: string
}

export interface UseI18nReturn {
  // Translation methods
  t: (key: TranslationKey, params?: Params, defaultValue?: string | null, routeName?: string) => CleanTranslation
  ts: (key: TranslationKey, params?: Params, defaultValue?: string, routeName?: string) => string
  tc: (key: TranslationKey, count: number | Params, defaultValue?: string) => string
  tn: (value: number, options?: Intl.NumberFormatOptions) => string
  td: (value: Date | number | string, options?: Intl.DateTimeFormatOptions) => string
  tdr: (value: Date | number | string, options?: Intl.RelativeTimeFormatOptions) => string
  has: (key: TranslationKey, routeName?: string) => boolean

  // Locale management
  locale: string
  fallbackLocale: string
  currentRoute: string
  setLocale: (locale: string) => void

  // Route management
  setRoute: (routeName: string) => void
  getRoute: () => string
  getLocales: () => Locale[]
  defaultLocale: () => string
  getLocaleName: () => string | null

  // Router methods (if router is available)
  switchLocale?: (locale: string) => void
  localeRoute?: (to: string | { path?: string }, locale?: string) => string | { path?: string }
  localePath?: (to: string | { path?: string }, locale?: string) => string

  // Translation management
  addTranslations: (locale: string, translations: Translations, merge?: boolean) => void
  addRouteTranslations: (locale: string, routeName: string, translations: Translations, merge?: boolean) => void
  clearCache: () => void
}

export const useI18n = (options?: UseI18nOptions): UseI18nReturn => {
  const i18n = useI18nContext()
  const router = useI18nRouter()
  const injectedLocales = useI18nLocales()
  const injectedDefaultLocale = useI18nDefaultLocale()

  // Reactivity! Component will re-render if i18n notifies about changes
  useSyncExternalStore(i18n.subscribe, i18n.getSnapshot)

  const locales = options?.locales || injectedLocales || []
  const defaultLocale = options?.defaultLocale || injectedDefaultLocale || i18n.locale

  const resolveLocalePath = (to: string | { path?: string }, localeCode?: string): string | { path?: string } => {
    if (!router?.resolvePath) {
      return to
    }
    return router.resolvePath(to, localeCode || i18n.locale)
  }

  const switchLocaleHelper = (newLocale: string): void => {
    i18n.locale = newLocale
    if (router) {
      const currentPath = router.getCurrentPath()
      const newPath = resolveLocalePath(currentPath, newLocale)
      router.push(typeof newPath === 'string' ? { path: newPath } : { path: newPath.path || '/' })
    }
  }

  return {
    // Translation methods
    t: i18n.t.bind(i18n),
    ts: i18n.ts.bind(i18n),
    tc: i18n.tc.bind(i18n),
    tn: i18n.tn.bind(i18n),
    td: i18n.td.bind(i18n),
    tdr: i18n.tdr.bind(i18n),
    has: i18n.has.bind(i18n),

    // Locale management
    get locale() {
      return i18n.locale
    },
    get fallbackLocale() {
      return i18n.fallbackLocale
    },
    get currentRoute() {
      return i18n.currentRoute
    },
    setLocale: (locale: string) => {
      i18n.locale = locale
    },

    // Route management
    setRoute: i18n.setRoute.bind(i18n),
    getRoute: i18n.getRoute.bind(i18n),
    getLocales: () => locales,
    defaultLocale: () => defaultLocale,
    getLocaleName: () => {
      const current = locales.find(l => l.code === i18n.locale)
      return current?.displayName || null
    },

    // Router methods (always available, but navigation handled by components)
    switchLocale: switchLocaleHelper,
    localeRoute: resolveLocalePath,
    localePath: (to: string | { path?: string }, locale?: string) => {
      const res = resolveLocalePath(to, locale)
      return typeof res === 'string' ? res : (res.path || '/')
    },

    // Translation management
    addTranslations: i18n.addTranslations.bind(i18n),
    addRouteTranslations: i18n.addRouteTranslations.bind(i18n),
    clearCache: i18n.clearCache.bind(i18n),
  }
}

// Export context for advanced usage
export { I18nContext } from './injection'
