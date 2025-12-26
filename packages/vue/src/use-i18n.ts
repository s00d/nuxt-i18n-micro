import { inject, computed } from 'vue'
import { I18nInjectionKey, I18nLocalesKey, I18nDefaultLocaleKey, I18nRouterKey } from './injection'
import type { VueI18n } from './composer'
import type { Locale } from '@i18n-micro/types'
import type { I18nRoutingStrategy } from './router/types'

export interface UseI18nOptions {
  locales?: Locale[]
  defaultLocale?: string
}

/**
 * Get the i18n instance from the Vue app context
 * Returns the same instance that was created with createI18n()
 */
export function useI18n(options?: UseI18nOptions) {
  const i18n = inject<VueI18n>(I18nInjectionKey)
  const router = inject<I18nRoutingStrategy | undefined>(I18nRouterKey, undefined)
  const injectedLocales = inject<Locale[] | undefined>(I18nLocalesKey, undefined)
  const injectedDefaultLocale = inject<string | undefined>(I18nDefaultLocaleKey, undefined)

  if (!i18n) {
    throw new Error('[i18n-micro] useI18n() must be called after app.use(i18n). Make sure i18n plugin is installed.')
  }

  if (!injectedLocales) {
    throw new Error('[i18n-micro] I18nLocalesKey not provided. Make sure app.provide(I18nLocalesKey, locales) is called.')
  }

  if (!injectedDefaultLocale) {
    throw new Error('[i18n-micro] I18nDefaultLocaleKey not provided. Make sure app.provide(I18nDefaultLocaleKey, defaultLocale) is called.')
  }

  const locales = options?.locales || injectedLocales
  const defaultLocale = options?.defaultLocale || injectedDefaultLocale

  const resolveLocalePath = (to: string | { path?: string }, localeCode?: string): string | { path?: string } => {
    if (!router?.resolvePath) {
      return to
    }
    return router.resolvePath(to, localeCode || i18n.locale.value)
  }

  return {
    // Direct access to instance
    instance: i18n,

    // Locale (reactive)
    locale: computed({
      get: () => i18n.locale.value,
      set: (val: string) => {
        i18n.locale.value = val
      },
    }),

    // Locale helpers
    getLocales: () => locales,
    defaultLocale: () => defaultLocale,
    getLocaleName: () => {
      const current = locales.find(l => l.code === i18n.locale.value)
      return current?.displayName || null
    },

    // Routing helpers
    localeRoute: resolveLocalePath,
    localePath: (to: string | { path?: string }, locale?: string): string => {
      const res = resolveLocalePath(to, locale)
      return typeof res === 'string' ? res : (res.path || '/')
    },
    switchLocale: (newLocale: string) => {
      i18n.locale.value = newLocale
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
    getLocale: () => i18n.locale.value,

    // Translation management
    addTranslations: i18n.addTranslations.bind(i18n),
    addRouteTranslations: i18n.addRouteTranslations.bind(i18n),
    mergeTranslations: i18n.mergeTranslations.bind(i18n),
    mergeGlobalTranslations: i18n.mergeGlobalTranslations.bind(i18n),
    clearCache: i18n.clearCache.bind(i18n),
  }
}
