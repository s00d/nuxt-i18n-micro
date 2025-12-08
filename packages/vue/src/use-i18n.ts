import { inject, computed, getCurrentInstance } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { I18nInjectionKey, I18nLocalesKey, I18nDefaultLocaleKey } from './injection'
import type { VueI18n } from './composer'
import type { Params, CleanTranslation, Locale, TranslationKey } from '@i18n-micro/types'
import { switchLocaleRoute, getRouteName, getLocaleFromRoute } from './router'
import type { RouteLocationRaw } from 'vue-router'

export interface UseI18nOptions {
  locales?: Locale[]
  defaultLocale?: string
}

export function useI18n(options?: UseI18nOptions) {
  const i18n = inject<VueI18n>(I18nInjectionKey)

  if (!i18n) {
    throw new Error('VueI18n instance not found. Did you use app.use(i18n)?')
  }

  let router: ReturnType<typeof useRouter> | undefined
  let route: ReturnType<typeof useRoute> | undefined

  // Check if we're in a component context before trying to use router
  // This prevents Vue warnings when router is not installed
  const instance = getCurrentInstance()
  if (instance) {
    // Only try to use router if we're in a component context
    // Note: This may still produce warnings in development, but they're expected
    // when router is not installed (e.g., in tests). The warnings are harmless.
    try {
      router = useRouter()
      route = useRoute()
    }
    catch {
      // Router not available - this is expected in tests or when router is not installed
    }
  }

  // Try to get locales from injection, fallback to options
  let locales: Locale[] = options?.locales || []
  let defaultLocaleValue: string = options?.defaultLocale || i18n.locale.value

  try {
    const injectedLocales = inject<Locale[] | undefined>(I18nLocalesKey, undefined)
    const injectedDefault = inject<string | undefined>(I18nDefaultLocaleKey, undefined)
    if (injectedLocales) {
      locales = injectedLocales
    }
    if (injectedDefault) {
      defaultLocaleValue = injectedDefault
    }
  }
  catch {
    // Injection not available
  }

  const defaultLocale = defaultLocaleValue

  const getLocaleFromRouteHelper = (r?: ReturnType<typeof useRoute>): string => {
    if (r) {
      return getLocaleFromRoute(r, defaultLocale, locales.map(l => l.code))
    }
    if (route) {
      return getLocaleFromRoute(route, defaultLocale, locales.map(l => l.code))
    }
    return i18n.locale.value
  }

  const getRouteNameHelper = (r?: ReturnType<typeof useRoute>): string => {
    if (r) {
      return getRouteName(r)
    }
    if (route) {
      return getRouteName(route)
    }
    return i18n.getRoute()
  }

  const localeRouteHelper = (to: RouteLocationRaw | string, locale?: string): RouteLocationRaw | string => {
    if (!router || !route) {
      return to
    }
    const targetLocale = locale || i18n.locale.value
    const currentRoute = route
    const path = typeof to === 'string' ? to : ((to as { path?: string }).path || currentRoute.path)
    const pathSegments = path.split('/').filter(Boolean)
    const localeCodes = locales.map(loc => loc.code)

    // If path starts with locale, replace it
    const firstSegment = pathSegments[0]
    if (firstSegment && localeCodes.includes(firstSegment)) {
      pathSegments[0] = targetLocale
      const resolved = router.resolve(`/${pathSegments.join('/')}`)
      return resolved.fullPath
    }
    // Otherwise prepend locale
    const resolved = router.resolve(`/${targetLocale}${path}`)
    return resolved.fullPath
  }

  return {
    // Locale (reactive, can be changed)
    locale: computed({
      get: () => i18n.locale.value,
      set: (val: string) => {
        i18n.locale.value = val
      },
    }),
    fallbackLocale: computed({
      get: () => i18n.fallbackLocale.value,
      set: (val: string) => {
        i18n.fallbackLocale.value = val
      },
    }),
    currentRoute: computed({
      get: () => i18n.getRoute(),
      set: (val: string) => {
        i18n.setRoute(val)
      },
    }),

    // Translation methods
    t: (key: TranslationKey, params?: Params, defaultValue?: string | null, routeName?: string): CleanTranslation => {
      return i18n.t(key, params, defaultValue, routeName)
    },
    ts: (key: TranslationKey, params?: Params, defaultValue?: string, routeName?: string): string => {
      return i18n.ts(key, params, defaultValue, routeName)
    },
    tc: (key: TranslationKey, count: number | Params, defaultValue?: string): string => {
      return i18n.tc(key, count, defaultValue)
    },
    tn: (value: number, options?: Intl.NumberFormatOptions): string => {
      return i18n.tn(value, options)
    },
    td: (value: Date | number | string, options?: Intl.DateTimeFormatOptions): string => {
      return i18n.td(value, options)
    },
    tdr: (value: Date | number | string, options?: Intl.RelativeTimeFormatOptions): string => {
      return i18n.tdr(value, options)
    },
    has: (key: TranslationKey, routeName?: string): boolean => {
      return i18n.has(key, routeName)
    },

    // Route management
    setRoute: (routeName: string): void => {
      i18n.setRoute(routeName)
    },
    getRoute: (): string => {
      return i18n.getRoute()
    },
    getRouteName: (r?: ReturnType<typeof useRoute>): string => {
      return getRouteNameHelper(r)
    },
    getLocale: (r?: ReturnType<typeof useRoute>): string => {
      return getLocaleFromRouteHelper(r)
    },
    getLocales: (): Locale[] => {
      return locales
    },
    defaultLocale: (): string => {
      return defaultLocale
    },
    getLocaleName: (): string | null => {
      const current = locales.find(l => l.code === i18n.locale.value)
      return current?.displayName || null
    },

    // Router methods (if router is available)
    switchLocaleRoute: router
      ? (locale: string): RouteLocationRaw => {
          if (router) {
            switchLocaleRoute(router, i18n, locale, locales.map(l => l.code))
            return router.currentRoute.value as RouteLocationRaw
          }
          return {} as RouteLocationRaw
        }
      : undefined,
    switchLocalePath: router
      ? (locale: string): string => {
          if (router) {
            switchLocaleRoute(router, i18n, locale, locales.map(l => l.code))
            if (route) {
              return route.fullPath
            }
          }
          return ''
        }
      : undefined,
    switchLocale: router
      ? (locale: string): void => {
          if (router) {
            switchLocaleRoute(router, i18n, locale, locales.map(l => l.code))
          }
        }
      : undefined,
    localeRoute: router
      ? (to: RouteLocationRaw | string, locale?: string): RouteLocationRaw | string => {
          return localeRouteHelper(to, locale)
        }
      : undefined,
    localePath: router
      ? (to: RouteLocationRaw | string, locale?: string): string => {
          const result = localeRouteHelper(to, locale)
          return typeof result === 'string' ? result : ''
        }
      : undefined,

    // Translation management
    addTranslations: (locale: string, translations: Record<string, unknown>, merge: boolean = true): void => {
      i18n.addTranslations(locale, translations, merge)
    },
    addRouteTranslations: (locale: string, routeName: string, translations: Record<string, unknown>, merge: boolean = true): void => {
      i18n.addRouteTranslations(locale, routeName, translations, merge)
    },
    mergeTranslations: (locale: string, routeName: string, translations: Record<string, unknown>): void => {
      i18n.mergeTranslations(locale, routeName, translations)
    },
    mergeGlobalTranslations: (locale: string, translations: Record<string, unknown>): void => {
      i18n.mergeGlobalTranslations(locale, translations)
    },
    clearCache: (): void => {
      i18n.clearCache()
    },
  }
}
