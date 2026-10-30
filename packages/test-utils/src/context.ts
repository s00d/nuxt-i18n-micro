import { BaseI18n, localeIsoMap } from '@i18n-micro/core'
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

export type CreateI18nTestContextOptions = ResetI18nOptions

export interface CreateFakeI18nOptions extends CreateI18nTestContextOptions {
  /** A context of its own instead of the module's shared one. */
  isolated?: boolean
  /** Wrap each method (e.g. `vi.fn`). Defaults to identity — no Vitest dependency. */
  spy?: SpyFn
}

const DEFAULT_LOCALES: Locale[] = [{ code: 'en' }]

function routeNameFromUnknown(route: unknown, fallback: string): string {
  if (typeof route === 'string') return route
  const name = route && typeof route === 'object' ? (route as { name?: string | symbol | null }).name : undefined
  return name === null || name === undefined ? fallback : String(name)
}

function normalizePathInput(to: unknown): string {
  if (typeof to === 'string') {
    const bare = to.split('?')[0]?.split('#')[0] ?? '/'
    if (!bare || bare === '/') return '/'
    return bare.startsWith('/') ? bare : `/${bare}`
  }
  if (!to || typeof to !== 'object') return '/'
  const { path, name } = to as { path?: string; name?: string | symbol | null }
  const target = path || (name === null || name === undefined ? '' : String(name))
  if (!target) return '/'
  return target.startsWith('/') ? target : `/${target}`
}

function joinLocalePath(code: string, path: string, strategy: TestStrategy, defaultLocale: string | undefined): string {
  const normalized = !path || path === '/' ? '/' : path.startsWith('/') ? path : `/${path}`
  if (strategy === 'no_prefix') return normalized
  if ((strategy === 'prefix_except_default' || strategy === 'prefix_and_default') && defaultLocale && code === defaultLocale) return normalized
  return normalized === '/' ? `/${code}` : `/${code}${normalized}`
}

function createPathStrategyStub(ctx: I18nTestContext) {
  return {
    getStrategy: () => ctx.strategy,
    getDefaultLocale: () => ctx.defaultLocale() ?? 'en',
    getLocales: () => ctx.getLocales(),
    getLocalizedRouteNamePrefix: () => 'localized-',
    getRouteBaseName: () => null,
    pageLocales: () => null,
    isMetaDisabled: () => false,
    setRouter: () => {},
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
 * Stateful i18n mock. Translation, plural and format calls are `BaseI18n`'s own: a test answers
 * what the app answers. What is added here is the test state: setters, seeds and path stubs.
 * The package's default singleton backs the module-level helpers (`t`, `resetI18n`, …).
 */
export class I18nTestContext extends BaseI18n {
  strategy: TestStrategy = 'prefix'
  pagePath = '/'

  private locales: Locale[] = [...DEFAULT_LOCALES]
  private locale = 'en'
  private defLocale: string | undefined = 'en'
  private localeName: string | null = 'English'
  private routeName = 'test'
  private customMissingHandler: MissingHandler | null = null
  private i18nRouteParams: unknown = {}
  private readonly initial: Required<Pick<ResetI18nOptions, 'locale' | 'locales' | 'routeName' | 'localeName' | 'strategy'>> &
    Pick<ResetI18nOptions, 'defaultLocale' | 'translations' | 'messages'>

  constructor(options: CreateI18nTestContextOptions = {}) {
    super({ missingWarn: false, localeIso: localeIsoMap(options.locales ?? []) })
    this.getCustomMissingHandler = () => this.customMissingHandler
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

  getLocale(): string {
    return this.locale
  }

  getFallbackLocale(): string {
    return this.defLocale ?? this.locale
  }

  getRoute(): string {
    return this.routeName
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
    this.customMissingHandler = null
    this.i18nRouteParams = {}

    for (const [locale, dictionary] of Object.entries(options.messages ?? {})) {
      this.helper.setTranslations(locale, { ...dictionary } as Translations, this.routeName)
    }
    if (options.translations) this.helper.setTranslations(this.locale, { ...options.translations } as Translations, this.routeName)
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

  _t(route: unknown) {
    const boundRoute = routeNameFromUnknown(route, this.routeName)
    return (key: TranslationKey, params?: Params, defaultValue?: string | null): Translation =>
      this.t(key, params, defaultValue, boundRoute) as Translation
  }

  _ts(route: unknown) {
    const bound = this._t(route)
    return (key: TranslationKey, params?: Params, defaultValue?: string | null): string => {
      const value = bound(key, params, defaultValue)
      return value?.toString() ?? defaultValue ?? key
    }
  }

  async setTranslationsFromJson(locale: string, translations: Record<string, unknown>): Promise<void> {
    this.helper.setTranslations(locale, { ...translations } as Translations, this.routeName)
  }

  async loadPageTranslations(locale: string, page: string, translations: Translations): Promise<void> {
    this.helper.loadPageTranslations(locale, page, translations)
  }

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

  mergeTranslations = (newTranslations: Translations): void => {
    this.helper.mergeTranslation(this.locale, this.routeName, newTranslations, true)
  }

  setMissingHandler = (handler: MissingHandler | null): void => {
    this.customMissingHandler = handler
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
    const bound = <K extends 'getLocale' | 't' | 'ts' | 'tc' | 'tn' | 'td' | 'tdr' | 'has' | 'resolveTranslations' | 'setTranslation'>(name: K) =>
      spy(this[name].bind(this) as I18nTestContext[K])
    const injections = {
      $i18nStrategy: this.i18nStrategy,
      $getI18nConfig: spy(this.getI18nConfig),
      $getLocale: bound('getLocale'),
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
      $t: bound('t'),
      $_t: spy(this._t.bind(this)),
      $ts: bound('ts'),
      $_ts: spy(this._ts.bind(this)),
      $tc: bound('tc'),
      $tn: bound('tn'),
      $td: bound('td'),
      $tdr: bound('tdr'),
      $has: bound('has'),
      $resolveTranslations: bound('resolveTranslations'),
      $setTranslation: bound('setTranslation'),
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
