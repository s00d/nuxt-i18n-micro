import { createMemo } from 'solid-js'
import { useI18nContext, useI18nLocales, useI18nDefaultLocale, useI18nRouter } from './injection'
import type { Locale } from '@i18n-micro/types'

export interface UseI18nOptions {
  locales?: Locale[]
  defaultLocale?: string
}

export function useI18n(options?: UseI18nOptions) {
  const i18n = useI18nContext()
  const router = useI18nRouter()
  const injectedLocales = useI18nLocales()
  const injectedDefaultLocale = useI18nDefaultLocale()

  const locales = options?.locales || injectedLocales
  const defaultLocale = options?.defaultLocale || injectedDefaultLocale

  const resolveLocalePath = (to: string | { path?: string }, localeCode?: string): string | { path?: string } => {
    if (!router?.resolvePath) {
      return to
    }
    return router.resolvePath(to, localeCode || i18n.getLocale())
  }

  return {
    // Direct access to instance
    instance: i18n,

    // Locale (reactive) - используем accessor для отслеживания изменений
    locale: createMemo(() => i18n.localeAccessor()),

    // Locale helpers
    getLocales: () => locales,
    defaultLocale: () => defaultLocale,
    getLocaleName: () => {
      // Используем accessor для реактивности
      const current = locales.find(l => l.code === i18n.localeAccessor())
      return current?.displayName || null
    },

    // Routing helpers
    localeRoute: resolveLocalePath,
    localePath: (to: string | { path?: string }, locale?: string): string => {
      const res = resolveLocalePath(to, locale)
      return typeof res === 'string' ? res : (res.path || '/')
    },
    switchLocale: (newLocale: string) => {
      i18n.locale = newLocale
      if (router) {
        const currentPath = router.getCurrentPath()
        const newPath = resolveLocalePath(currentPath, newLocale)
        router.push(typeof newPath === 'string' ? { path: newPath } : { path: newPath.path || '/' })
      }
    },

    // Translation methods (delegate to instance)
    t: i18n.t.bind(i18n),
    ts: i18n.ts.bind(i18n),
    tc: i18n.tc.bind(i18n),
    tn: i18n.tn.bind(i18n),
    td: i18n.td.bind(i18n),
    tdr: i18n.tdr.bind(i18n),
    has: i18n.has.bind(i18n),

    // Route management
    setRoute: i18n.setRoute.bind(i18n),
    getRoute: i18n.getRoute.bind(i18n),
    getLocale: () => i18n.getLocale(),

    // Translation management
    addTranslations: i18n.addTranslations.bind(i18n),
    addRouteTranslations: i18n.addRouteTranslations.bind(i18n),
    clearCache: i18n.clearCache.bind(i18n),
  }
}
