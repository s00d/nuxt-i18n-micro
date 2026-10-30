import { createI18n, type I18n, type I18nOptions } from '@i18n-micro/runtime'
import type { CleanTranslation, Locale, Params, TranslationKey, Translations } from '@i18n-micro/types'
import { h, type HostElement, type HostNode, useContext, useMemo, useRef, useState, useStore } from '#host'
import { I18nContext, type I18nContextValue, type I18nRoutingStrategy, type RouteTarget, useI18nContext, useI18nContextValue } from './injection'

export interface I18nProviderProps extends Partial<I18nOptions> {
  /** An instance you created. Without it, the provider builds one from the options next to it: plain data, so a server component can pass them. */
  i18n?: I18n
  locales?: Locale[]
  defaultLocale?: string
  routingStrategy?: I18nRoutingStrategy
  children?: HostNode
}

export function I18nProvider({ i18n, locales, defaultLocale, routingStrategy, children, ...options }: I18nProviderProps): HostElement {
  const outer = useContext(I18nContext)
  // A new `locale` prop comes with its own messages. Keyed by it alone: an inline `messages` object must not reset the instance.
  const own = useMemo(() => (i18n ? null : createI18n(options as I18nOptions)), [i18n, options.locale])
  const value = useMemo<I18nContextValue>(
    () => ({
      i18n: i18n ?? own!,
      // an omitted prop leaves the outer provider's value in place
      locales: locales ?? outer?.locales ?? null,
      defaultLocale: defaultLocale ?? outer?.defaultLocale ?? null,
      router: routingStrategy ?? outer?.router ?? null,
      api: null,
    }),
    [i18n, own, locales, defaultLocale, routingStrategy, outer],
  )
  return h(I18nContext.Provider, { value }, children)
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

  // Router methods; without a router they answer the input and only switch the locale
  switchLocale: (locale: string) => void
  localeRoute: (to: RouteTarget, locale?: string) => RouteTarget
  localePath: (to: RouteTarget, locale?: string) => string

  // Translation management
  addTranslations: (locale: string, translations: Translations, merge?: boolean) => void
  addRouteTranslations: (locale: string, routeName: string, translations: Translations, merge?: boolean) => void
  clearCache: () => void
}

export const routePath = (target: RouteTarget): string => (typeof target === 'string' ? target : target.path || '/')

function createApi({ i18n, locales, defaultLocale, router }: Omit<I18nContextValue, 'api'>): UseI18nReturn {
  const list = locales ?? []
  const localeRoute = (to: RouteTarget, code?: string): RouteTarget => (router?.resolvePath ? router.resolvePath(to, code || i18n.locale) : to)
  return {
    // Bound per snapshot: the identity changes when the text can, so `memo` and effect deps stay right.
    t: i18n.t.bind(i18n),
    ts: i18n.ts.bind(i18n),
    tc: i18n.tc.bind(i18n),
    tn: i18n.tn.bind(i18n),
    td: i18n.td.bind(i18n),
    tdr: i18n.tdr.bind(i18n),
    has: i18n.has.bind(i18n),

    get locale() {
      return i18n.locale
    },
    get fallbackLocale() {
      return i18n.fallbackLocale
    },
    get currentRoute() {
      return i18n.currentRoute
    },
    setLocale: (locale) => {
      i18n.locale = locale
    },

    setRoute: i18n.setRoute.bind(i18n),
    getRoute: i18n.getRoute.bind(i18n),
    getLocales: () => list,
    defaultLocale: () => defaultLocale ?? i18n.fallbackLocale,
    getLocaleName: () => list.find((l) => l.code === i18n.locale)?.displayName || null,

    switchLocale: (locale) => {
      i18n.locale = locale
      if (router) router.push({ path: routePath(localeRoute(router.getCurrentPath(), locale)) })
    },
    localeRoute,
    localePath: (to, locale) => routePath(localeRoute(to, locale)),

    addTranslations: i18n.addTranslations.bind(i18n),
    addRouteTranslations: i18n.addRouteTranslations.bind(i18n),
    clearCache: i18n.clearCache.bind(i18n),
  }
}

export const useI18n = (options?: UseI18nOptions): UseI18nReturn => {
  const context = useI18nContextValue()
  const snapshot = useStore(context.i18n.subscribe, context.i18n.getSnapshot)
  const locales = options?.locales
  const defaultLocale = options?.defaultLocale
  const own = useMemo(
    () => (locales || defaultLocale ? createApi({ ...context, locales: locales ?? context.locales, defaultLocale: defaultLocale ?? context.defaultLocale }) : null),
    [context, snapshot, locales, defaultLocale],
  )
  if (own) return own
  if (context.api?.snapshot !== snapshot) context.api = { snapshot, value: createApi(context) }
  return context.api.value
}

/**
 * One translation as a value: the component renders only when this string changes, not on every
 * locale or message write.
 */
export function useT(key: TranslationKey, params?: Params, defaultValue?: string, routeName?: string): string {
  const i18n = useI18nContext()
  return useStore(i18n.subscribe, () => i18n.ts(key, params, defaultValue, routeName))
}

/**
 * `setLocale` that loads first. A store write is synchronous for React, even inside
 * `startTransition`, so a reader that suspends on a missing dictionary would show its fallback:
 * this keeps the old UI until the messages are in. The last call wins; a failed `load` rejects
 * and leaves the locale as it was.
 */
export function useLocaleSwitch(load: (locale: string) => unknown): [(locale: string) => Promise<void>, boolean] {
  const { switchLocale } = useI18n()
  const [pending, setPending] = useState(false)
  const latest = useRef(0)
  const run = async (locale: string): Promise<void> => {
    const call = ++latest.current
    setPending(true)
    try {
      await load(locale)
      if (call === latest.current) switchLocale(locale)
    } finally {
      if (call === latest.current) setPending(false)
    }
  }
  return [run, pending]
}
