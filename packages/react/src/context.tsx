import { localeIsoMap } from '@i18n-micro/core'
import { createI18n, type I18n, type I18nOptions } from '@i18n-micro/runtime'
import type { CleanTranslation, Locale, Params, TranslationKey, Translations } from '@i18n-micro/types'
import { h, type HostElement, type HostNode, useContext, useMemo, useRef, useState, useStore } from '#host'
import { type I18nConfig, I18nConfigContext, I18nContext, type I18nRoutingStrategy, type RouteTarget, useI18nContext } from './injection'

export interface I18nProviderProps extends Partial<I18nOptions> {
  /** An instance you created. Without it, the outer provider's; without that, one built from the options next to it: plain data, so a server component can pass them. */
  i18n?: I18n
  locales?: Locale[]
  defaultLocale?: string
  routingStrategy?: I18nRoutingStrategy
  children?: HostNode
}

function buildInstance(options: Partial<I18nOptions>): I18n {
  if (!options.locale) throw new Error('[i18n-micro] I18nProvider needs an `i18n` instance, an outer provider, or a `locale`.')
  return createI18n(options as I18nOptions)
}

export function I18nProvider({ i18n, locales, defaultLocale, routingStrategy, children, ...options }: I18nProviderProps): HostElement {
  const outerInstance = useContext(I18nContext)
  const outer = useContext(I18nConfigContext)
  const inherited = i18n ?? outerInstance
  // A new `locale` prop comes with its own messages. Keyed by it alone: an inline `messages` object must not reset the instance.
  const instance = useMemo(() => inherited ?? buildInstance(options), [inherited, options.locale])
  const methods = useRef<TranslationMethods | null>(null)
  const config = useMemo<I18nConfig>(() => {
    if (locales) instance.addLocaleIso(localeIsoMap(locales))
    return {
      // an omitted prop leaves the outer provider's value in place
      locales: locales ?? outer?.locales ?? null,
      defaultLocale: defaultLocale ?? outer?.defaultLocale ?? null,
      router: routingStrategy ?? outer?.router ?? null,
      api: null,
      methods,
    }
  }, [instance, locales, defaultLocale, routingStrategy, outer])
  return h(I18nContext.Provider, { value: instance }, h(I18nConfigContext.Provider, { value: config }, children))
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

export type TranslationMethods = Pick<UseI18nReturn, 't' | 'ts' | 'tc' | 'tn' | 'td' | 'tdr' | 'has'> & { i18n: I18n; snapshot: string }

/** Bound per snapshot: the identity changes when the text can, so `memo` and effect deps stay right. */
function translationMethods(i18n: I18n, snapshot: string, cache: I18nConfig['methods'] | undefined): TranslationMethods {
  const known = cache?.current
  if (known && known.i18n === i18n && known.snapshot === snapshot) return known
  const methods = {
    i18n,
    snapshot,
    t: i18n.t.bind(i18n),
    ts: i18n.ts.bind(i18n),
    tc: i18n.tc.bind(i18n),
    tn: i18n.tn.bind(i18n),
    td: i18n.td.bind(i18n),
    tdr: i18n.tdr.bind(i18n),
    has: i18n.has.bind(i18n),
  }
  if (cache) cache.current = methods
  return methods
}

function createApi(
  i18n: I18n,
  { locales, defaultLocale, router }: Pick<I18nConfig, 'locales' | 'defaultLocale' | 'router'>,
  methods: TranslationMethods,
): UseI18nReturn {
  const list = locales ?? []
  const localeRoute = (to: RouteTarget, code?: string): RouteTarget => (router?.resolvePath ? router.resolvePath(to, code || i18n.locale) : to)
  const { t, ts, tc, tn, td, tdr, has } = methods
  return {
    t,
    ts,
    tc,
    tn,
    td,
    tdr,
    has,

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
  const i18n = useI18nContext()
  const config = useContext(I18nConfigContext)
  const snapshot = useStore(i18n.subscribe, i18n.getSnapshot)
  const locales = options?.locales ?? config?.locales ?? null
  const defaultLocale = options?.defaultLocale ?? config?.defaultLocale ?? null
  const router = config?.router ?? null
  // one object for all consumers, unless this hook overrides the provider or stands under a bare `I18nContext`
  const shared = config && !options?.locales && !options?.defaultLocale ? config : null
  const own = useMemo(
    () => (shared ? null : createApi(i18n, { locales, defaultLocale, router }, translationMethods(i18n, snapshot, config?.methods))),
    [shared, i18n, snapshot, locales, defaultLocale, router],
  )
  if (own || !shared) return own!
  if (shared.api?.snapshot !== snapshot) shared.api = { snapshot, value: createApi(i18n, shared, translationMethods(i18n, snapshot, shared.methods)) }
  return shared.api.value
}

/**
 * One translation as a value: the component renders only when this string changes, not on every
 * locale or message write, nor when a provider gets a new adapter object.
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
  // the router may have moved during the load: switch with the adapter of the last render
  const current = useRef(switchLocale)
  current.current = switchLocale
  const run = async (locale: string): Promise<void> => {
    const call = ++latest.current
    setPending(true)
    try {
      await load(locale)
      if (call === latest.current) current.current(locale)
    } finally {
      if (call === latest.current) setPending(false)
    }
  }
  return [run, pending]
}
