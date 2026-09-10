import {
  defaultPlural,
  interpolate,
  mergeTranslationLayers,
  setTranslationAtKey,
  useTranslationHelper,
  type TranslationStorage,
} from '@i18n-micro/core'
import type { MissingHandler, Params, Translation, TranslationKey, Translations } from '@i18n-micro/types'

export type LocaleCode = string

export interface Locale {
  code: LocaleCode
  disabled?: boolean
  iso?: string
  dir?: 'ltr' | 'rtl' | 'auto'
  displayName?: string
  baseUrl?: string
  baseDefault?: boolean
}

export type Getter = (key: TranslationKey, params?: Record<string, string | number | boolean>, defaultValue?: string) => unknown

export type SpyFn = <T>(fn: T) => T

export type TestStrategy = 'prefix' | 'prefix_except_default' | 'prefix_and_default' | 'no_prefix'

export interface ResetI18nOptions {
  locale?: string
  defaultLocale?: string | undefined
  localeName?: string | null
  locales?: Locale[]
  routeName?: string
  strategy?: TestStrategy
  /** Seed the active route chunk for `locale` after reset. */
  translations?: Record<string, unknown>
  /** Seed route chunks per locale code after reset. */
  messages?: Record<string, Record<string, unknown>>
}

export interface CreateI18nTestContextOptions extends ResetI18nOptions {
  /**
   * When `true`, uses a private translation `Map` (no shared module cache).
   * Prefer this for parallel suites / `setupNuxtI18nMock`.
   */
  isolated?: boolean
}

export interface CreateFakeI18nOptions extends CreateI18nTestContextOptions {
  /** Wrap each method (e.g. `vi.fn`). Defaults to identity — no Vitest dependency. */
  spy?: SpyFn
}

const DEFAULT_LOCALES: Locale[] = [{ code: 'en' }]

function routeNameFromUnknown(route: unknown, fallback: string): string {
  if (route === null || route === undefined) return fallback
  if (typeof route === 'string') return route
  if (typeof route === 'object' && 'name' in route) {
    const name = (route as { name?: string | symbol | null }).name
    if (name !== null && name !== undefined) return String(name)
  }
  return fallback
}

function normalizePathInput(to: unknown): string {
  if (typeof to === 'string') {
    const bare = to.split('?')[0]?.split('#')[0] ?? '/'
    if (!bare || bare === '/') return '/'
    return bare.startsWith('/') ? bare : `/${bare}`
  }
  if (to && typeof to === 'object') {
    const obj = to as { path?: string; name?: string | symbol | null }
    if (typeof obj.path === 'string' && obj.path.length > 0) {
      return obj.path.startsWith('/') ? obj.path : `/${obj.path}`
    }
    if (obj.name !== null && obj.name !== undefined) {
      const name = String(obj.name)
      return name.startsWith('/') ? name : `/${name}`
    }
  }
  return '/'
}

function joinLocalePath(code: string, path: string, strategy: TestStrategy, defaultLocale: string | undefined): string {
  const normalized = !path || path === '/' ? '/' : path.startsWith('/') ? path : `/${path}`

  if (strategy === 'no_prefix') {
    return normalized
  }

  if ((strategy === 'prefix_except_default' || strategy === 'prefix_and_default') && defaultLocale && code === defaultLocale) {
    return normalized
  }

  if (normalized === '/') return `/${code}`
  return `/${code}${normalized}`
}

function formatNumber(value: number, loc: string, options?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat(loc, options).format(value)
}

function formatDate(value: Date | number | string, loc: string, options?: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat(loc, options).format(new Date(value))
}

function createPathStrategyStub(ctx: I18nTestContext) {
  return {
    getStrategy: () => ctx.strategy,
    getDefaultLocale: () => ctx.defaultLocale() ?? 'en',
    getLocales: () => ctx.getLocales(),
    getLocalizedRouteNamePrefix: () => 'localized-',
    getGlobalLocaleRoutes: () => undefined,
    getRouteLocales: () => undefined,
    getRoutesLocaleLinks: () => undefined,
    getNoPrefixRedirect: () => undefined,
    getRouteBaseName: () => null,
    formatPathForResolve: (path: string) => path,
    setRouter: () => {},
    getCanonicalPath: () => null,
    getRedirect: () => null,
    shouldReturn404: () => null,
    getClientRedirect: () => null,
    resolveLocaleFromPath(path: string): string | null {
      const segment = path.split('/').filter(Boolean)[0]
      if (!segment) return null
      return ctx.getLocales().some((l) => l.code === segment) ? segment : null
    },
    getLocaleFromPath(path: string): string | null {
      return this.resolveLocaleFromPath(path)
    },
    getCurrentLocale: () => ctx.getLocale(),
    getPluginRouteName: () => ctx.getRouteName(),
    getCurrentLocaleName: () => ctx.getLocaleName(),
    localeRoute(targetLocale: string, routeOrPath: unknown) {
      const path = joinLocalePath(targetLocale, normalizePathInput(routeOrPath), ctx.strategy, ctx.defaultLocale())
      return { path, fullPath: path }
    },
    switchLocaleRoute(_fromLocale: string, toLocale: string, route?: unknown) {
      const pathInput = route !== undefined ? normalizePathInput(route) : ctx.pagePath
      const path = joinLocalePath(toLocale, pathInput, ctx.strategy, ctx.defaultLocale())
      return { path, fullPath: path }
    },
  }
}

/**
 * Stateful i18n mock: translations, locale, and path stubs.
 * Use {@link createI18nTestContext} for isolation; the package default singleton
 * backs module-level helpers (`t`, `resetI18n`, …).
 */
export class I18nTestContext {
  readonly helper: ReturnType<typeof useTranslationHelper>
  strategy: TestStrategy = 'prefix'
  pagePath = '/'

  private locales: Locale[] = [...DEFAULT_LOCALES]
  private locale = 'en'
  private defLocale: string | undefined = 'en'
  private localeName: string | null = 'English'
  private routeName = 'test'
  private missingHandler: MissingHandler | null = null
  private i18nRouteParams: unknown = {}
  private readonly initial: Required<Pick<ResetI18nOptions, 'locale' | 'locales' | 'routeName' | 'localeName' | 'strategy'>> &
    Pick<ResetI18nOptions, 'defaultLocale' | 'translations' | 'messages'>

  constructor(options: CreateI18nTestContextOptions = {}) {
    const storage: TranslationStorage | undefined = options.isolated ? { translations: new Map() } : undefined
    this.helper = useTranslationHelper(storage)
    this.initial = {
      locale: options.locale ?? 'en',
      defaultLocale: options.defaultLocale !== undefined ? options.defaultLocale : 'en',
      localeName: options.localeName !== undefined ? options.localeName : 'English',
      locales: options.locales ? [...options.locales] : [...DEFAULT_LOCALES],
      routeName: options.routeName ?? 'test',
      strategy: options.strategy ?? 'prefix',
      translations: options.translations,
      messages: options.messages,
    }
    this.applyReset(this.initial)
  }

  private applyReset(options: ResetI18nOptions): void {
    this.helper.clearCache()
    this.locale = options.locale ?? this.initial.locale
    this.defLocale = options.defaultLocale !== undefined ? options.defaultLocale : this.initial.defaultLocale
    this.localeName = options.localeName !== undefined ? options.localeName : this.initial.localeName
    this.locales = options.locales ? [...options.locales] : [...this.initial.locales]
    this.routeName = options.routeName ?? this.initial.routeName
    this.strategy = options.strategy ?? this.initial.strategy
    this.pagePath = '/'
    this.missingHandler = null
    this.i18nRouteParams = {}

    if (options.messages) {
      for (const [loc, dict] of Object.entries(options.messages)) {
        this.helper.setTranslations(loc, { ...dict } as Translations, this.routeName)
      }
    }

    if (options.translations) {
      this.helper.setTranslations(this.locale, { ...options.translations } as Translations, this.routeName)
    }
  }

  /**
   * Clear cache and restore locale/route defaults.
   * Pass `reseed: true` (or explicit `translations` / `messages`) to reload factory seeds.
   */
  reset(options: ResetI18nOptions & { reseed?: boolean } = {}): void {
    const reseed = options.reseed === true
    this.applyReset({
      locale: options.locale ?? this.initial.locale,
      defaultLocale: options.defaultLocale !== undefined ? options.defaultLocale : this.initial.defaultLocale,
      localeName: options.localeName !== undefined ? options.localeName : this.initial.localeName,
      locales: options.locales ?? this.initial.locales,
      routeName: options.routeName ?? this.initial.routeName,
      strategy: options.strategy ?? this.initial.strategy,
      translations: options.translations ?? (reseed ? this.initial.translations : undefined),
      messages: options.messages ?? (reseed ? this.initial.messages : undefined),
    })
  }

  t(key: TranslationKey, params?: Params, defaultValue?: string | null): Translation {
    let value = this.helper.getTranslation(this.locale, this.routeName, key)
    if (value === null && this.defLocale && this.locale !== this.defLocale) {
      value = this.helper.getTranslation(this.defLocale, this.routeName, key)
    }

    if (value === null || value === undefined) {
      this.missingHandler?.(this.locale, key, this.routeName)
      console.warn(`Missing translation key: ${key}`)
      return (defaultValue ?? key) as Translation
    }

    return typeof value === 'string' && params ? interpolate(value, params) : value
  }

  tc(key: TranslationKey, params: number | Params, defaultValue?: string): string {
    const { count, ...otherParams } = typeof params === 'number' ? { count: params } : params
    if (count === undefined) {
      return defaultValue ?? key
    }

    return defaultPlural(key, Number.parseInt(count.toString(), 10), otherParams, this.locale, this.t.bind(this)) ?? defaultValue ?? key
  }

  ts(key: TranslationKey, params?: Params, defaultValue?: string | null): string {
    const value = this.t(key, params, defaultValue)
    return value?.toString() ?? defaultValue ?? key
  }

  _t(route: unknown) {
    const boundRoute = routeNameFromUnknown(route, this.routeName)
    return (key: TranslationKey, params?: Params, defaultValue?: string | null): Translation => {
      const previous = this.routeName
      this.routeName = boundRoute
      try {
        return this.t(key, params, defaultValue)
      } finally {
        this.routeName = previous
      }
    }
  }

  _ts(route: unknown) {
    const bound = this._t(route)
    return (key: TranslationKey, params?: Params, defaultValue?: string | null): string => {
      const value = bound(key, params, defaultValue)
      return value?.toString() ?? defaultValue ?? key
    }
  }

  async setTranslationsFromJson(loc: string, translations: Record<string, unknown>): Promise<void> {
    this.helper.setTranslations(loc, { ...translations } as Translations, this.routeName)
  }

  async loadPageTranslations(loc: string, page: string, translations: Translations): Promise<void> {
    this.helper.loadPageTranslations(loc, page, translations)
  }

  getLocale = (_route?: unknown) => this.locale
  setLocale = (val: string) => {
    this.locale = val
  }

  getLocaleName = () => this.localeName
  setLocaleName = (val: string | null) => {
    this.localeName = val
  }

  getLocales = () => this.locales
  setLocales = (val: Locale[]) => {
    this.locales = val
  }

  defaultLocale = () => this.defLocale
  setDefaultLocale = (val: string | undefined) => {
    this.defLocale = val
  }

  getRouteName = (_route?: unknown, _locale?: string) => this.routeName
  /** @deprecated Typo kept for compatibility — prefer `setRouteName`. */
  settRouteName = (val: string) => {
    this.routeName = val
  }
  setRouteName = (val: string) => {
    this.routeName = val
  }

  tn = (value: number, options?: Intl.NumberFormatOptions) => formatNumber(value, this.locale, options)
  td = (value: Date | number | string, options?: Intl.DateTimeFormatOptions) => formatDate(value, this.locale, options)

  tdr(value: Date | number | string, options?: Intl.RelativeTimeFormatOptions): string {
    const date = new Date(value)
    const diffMs = date.getTime() - Date.now()
    const abs = Math.abs(diffMs)
    const units: [Intl.RelativeTimeFormatUnit, number][] = [
      ['year', 365 * 24 * 60 * 60 * 1000],
      ['month', 30 * 24 * 60 * 60 * 1000],
      ['day', 24 * 60 * 60 * 1000],
      ['hour', 60 * 60 * 1000],
      ['minute', 60 * 1000],
      ['second', 1000],
    ]
    for (const [unit, ms] of units) {
      if (abs >= ms || unit === 'second') {
        return new Intl.RelativeTimeFormat(this.locale, { numeric: 'auto', ...options }).format(Math.round(diffMs / ms), unit)
      }
    }
    return ''
  }

  has = (key: TranslationKey): boolean => this.helper.hasTranslation(this.locale, key)

  mergeTranslations = (newTranslations: Translations): void => {
    this.helper.mergeTranslation(this.locale, this.routeName, newTranslations, true)
  }

  resolveTranslations = (): Record<string, unknown> => {
    const active = (this.helper.getCache(this.locale, this.routeName) ?? {}) as Record<string, unknown>
    const fallback = this.defLocale
    if (!fallback || this.locale === fallback) return active

    const fb = (this.helper.getCache(fallback, this.routeName) ?? {}) as Record<string, unknown>
    return mergeTranslationLayers(fb, active)
  }

  setTranslation = (key: TranslationKey, value: unknown): void => {
    const current = (this.helper.getCache(this.locale, this.routeName) ?? {}) as Record<string, unknown>
    this.helper.setTranslations(this.locale, setTranslationAtKey(current, String(key), value), this.routeName)
  }

  setMissingHandler = (handler: MissingHandler | null): void => {
    this.missingHandler = handler
  }

  getI18nConfig = () => ({
    locales: this.locales,
    defaultLocale: this.defLocale,
    strategy: this.strategy,
  })

  i18nStrategy = createPathStrategyStub(this)

  localePath = (to: unknown, loc?: string): string => {
    const code = loc ?? this.locale
    const path = normalizePathInput(to)
    this.pagePath = path
    return joinLocalePath(code, path, this.strategy, this.defLocale)
  }

  /**
   * Returns a locale-prefixed path for the last `localePath` target.
   * Does **not** change the active locale (matches Nuxt runtime).
   */
  switchLocalePath = (loc: string): string => {
    return joinLocalePath(loc, this.pagePath, this.strategy, this.defLocale)
  }

  localeRoute = (to: unknown, loc?: string) => {
    const path = this.localePath(to, loc)
    const name = to && typeof to === 'object' && 'name' in to ? (to as { name?: string | symbol | null }).name : undefined
    return { path, ...(name !== null && name !== undefined ? { name } : {}) }
  }

  switchLocaleRoute = (loc: string) => {
    return { path: joinLocalePath(loc, this.pagePath, this.strategy, this.defLocale), name: this.routeName }
  }

  switchLocale = (val: string): void => {
    this.locale = val
  }

  switchRoute = (route: unknown, toLocale?: string): void => {
    if (toLocale) this.locale = toLocale
    this.pagePath = normalizePathInput(route)
  }

  setI18nRouteParams = (value: unknown) => {
    this.i18nRouteParams = value
    return value
  }

  createFake(spy: SpyFn = (fn) => fn) {
    const injections = {
      $i18nStrategy: this.i18nStrategy,
      $getI18nConfig: spy(this.getI18nConfig),
      $getLocale: spy(this.getLocale),
      $setLocale: spy(this.setLocale),
      $getLocaleName: spy(this.getLocaleName),
      $setLocaleName: spy(this.setLocaleName),
      $getLocales: spy(this.getLocales),
      $setLocales: spy(this.setLocales),
      $defaultLocale: spy(this.defaultLocale),
      $setDefaultLocale: spy(this.setDefaultLocale),
      $getRouteName: spy(this.getRouteName),
      $settRouteName: spy(this.settRouteName),
      $setRouteName: spy(this.setRouteName),
      $t: spy(this.t.bind(this)),
      $_t: spy(this._t.bind(this)),
      $ts: spy(this.ts.bind(this)),
      $_ts: spy(this._ts.bind(this)),
      $tc: spy(this.tc.bind(this)),
      $tn: spy(this.tn),
      $td: spy(this.td),
      $tdr: spy(this.tdr.bind(this)),
      $has: spy(this.has),
      $resolveTranslations: spy(this.resolveTranslations),
      $setTranslation: spy(this.setTranslation),
      $mergeTranslations: spy(this.mergeTranslations),
      $switchLocaleRoute: spy(this.switchLocaleRoute),
      $switchLocalePath: spy(this.switchLocalePath),
      $switchLocale: spy(this.switchLocale),
      $switchRoute: spy(this.switchRoute),
      $localeRoute: spy(this.localeRoute),
      $localePath: spy(this.localePath),
      $setI18nRouteParams: spy(this.setI18nRouteParams),
      $loadPageTranslations: spy(this.loadPageTranslations.bind(this)),
      $setMissingHandler: spy(this.setMissingHandler),
      $setTranslationsFromJson: spy(this.setTranslationsFromJson.bind(this)),
      helper: this.helper,
    } as const

    const bare = Object.fromEntries(Object.entries(injections).map(([key, value]) => [key.startsWith('$') ? key.slice(1) : key, value]))

    return {
      ...injections,
      ...bare,
    }
  }
}

export function createI18nTestContext(options: CreateI18nTestContextOptions = {}): I18nTestContext {
  return new I18nTestContext(options)
}
