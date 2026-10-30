import type { Locale } from '@i18n-micro/types'
import type { Accessor } from 'solid-js'
import type { SolidI18n } from './i18n'
import { type I18nContextValue, useI18nContextValue } from './injection'
import type { RouteTarget } from './router/types'

export interface UseI18nOptions {
  locales?: Locale[]
  defaultLocale?: string
}

export const routePath = (target: RouteTarget): string => (typeof target === 'string' ? target : target.path || '/')

function createApi(context: I18nContextValue, options?: UseI18nOptions) {
  const i18n = context.i18n
  const locales = (): Locale[] => options?.locales ?? context.locales ?? []
  const localeRoute = (to: RouteTarget, code?: string): RouteTarget => {
    const resolve = context.router?.resolvePath
    return resolve ? resolve(to, code || i18n.locale) : to
  }

  return {
    // Direct access to instance
    instance: i18n as SolidI18n,

    // An accessor, the Solid way: `locale()` in JSX stays reactive, a plain value would not.
    locale: i18n.localeAccessor as Accessor<string>,

    getLocales: locales,
    defaultLocale: (): string => options?.defaultLocale ?? context.defaultLocale ?? i18n.fallbackLocale,
    getLocaleName: (): string | null => locales().find((l) => l.code === i18n.locale)?.displayName || null,

    // Routing helpers: they read the reactive locale, so an effect or memo follows it
    localeRoute,
    localePath: (to: RouteTarget, locale?: string): string => routePath(localeRoute(to, locale)),
    switchLocale: (newLocale: string): void => {
      i18n.locale = newLocale
      const router = context.router
      if (router) router.push({ path: routePath(localeRoute(router.getCurrentPath(), newLocale)) })
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
    getRoute: (): string => i18n.currentRoute,
    getLocale: (): string => i18n.locale,

    // Translation management
    addTranslations: i18n.addTranslations.bind(i18n),
    addRouteTranslations: i18n.addRouteTranslations.bind(i18n),
    resolveTranslations: i18n.resolveTranslations.bind(i18n),
    setTranslation: i18n.setTranslation.bind(i18n),
    clearCache: i18n.clearCache.bind(i18n),
  }
}

export type UseI18nReturn = ReturnType<typeof createApi>

/** One object per provider; hook options make their own, and win over the provider. */
export function useI18n(options?: UseI18nOptions): UseI18nReturn {
  const context = useI18nContextValue()
  if (options?.locales || options?.defaultLocale) return createApi(context, options)
  return (context.api ??= createApi(context))
}
