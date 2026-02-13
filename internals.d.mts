declare module '#build/i18n.plural.mjs' {
  export function plural(key: string, count: number, params: Params, locale: string, getter: Getter): string | null
}

/** Приватный конфиг i18n (серверный): rootDir, rootDirs, debug, translationDir и т.д. Копия полей ModulePrivateOptionsExtend без импорта. */
interface I18nPrivateConfig {
  rootDir: string
  debug: boolean
  translationDir: string
  fallbackLocale?: string
  apiBaseUrl: string
  apiBaseClientHost?: string
  apiBaseServerHost?: string
  customRegexMatcher?: string
  routesLocaleLinks?: Record<string, string>
}

declare module '#build/i18n.config.mjs' {
  export function getI18nPrivateConfig(): I18nPrivateConfig
}

/**
 * Типы для #build/i18n.strategy.mjs — скопированы без импорта из @i18n-micro/path-strategy.
 */

/** Контекст стратегии (копия PathStrategyContext). */
interface I18nStrategyContextRouter {
  hasRoute: (name: string) => boolean
  resolve: (to: { name?: string | null, path?: string, params?: Record<string, unknown>, query?: Record<string, unknown>, hash?: string } | string) => I18nStrategyResolvedRoute
}

interface I18nStrategyContext {
  strategy: 'no_prefix' | 'prefix_except_default' | 'prefix' | 'prefix_and_default'
  defaultLocale: string
  locales: Array<{ code: string, [key: string]: unknown }>
  localizedRouteNamePrefix: string
  router: I18nStrategyContextRouter
  globalLocaleRoutes?: Record<string, Record<string, string> | false | boolean>
  routeLocales?: Record<string, string[]>
  routesLocaleLinks?: Record<string, string>
  noPrefixRedirect?: boolean
}

interface I18nStrategyResolvedRoute {
  name: string | null
  path: string
  fullPath: string
  params?: Record<string, unknown>
  query?: Record<string, unknown>
  hash?: string
}

interface I18nStrategySeoAttributes {
  canonical?: string
  hreflangs?: Array<{ rel: 'alternate', href: string, hreflang: string }>
}

/** Экземпляр стратегии (копия PathStrategy). */
export interface I18nStrategyInstance {
  getRedirect(currentPath: string, targetLocale: string): string | null
  getLocaleFromPath(path: string): string | null
  resolveLocaleFromPath(path: string): string | null
  localeRoute(targetLocale: string, routeOrPath: I18nStrategyResolvedRoute | string, currentRoute?: I18nStrategyResolvedRoute): I18nStrategyResolvedRoute | string
  switchLocaleRoute(fromLocale: string, toLocale: string, route: I18nStrategyResolvedRoute, options?: { i18nRouteParams?: Record<string, Record<string, unknown>> }): I18nStrategyResolvedRoute | string
  getCanonicalPath(route: I18nStrategyResolvedRoute, targetLocale: string): string | null
  getSeoAttributes(currentRoute: I18nStrategyResolvedRoute): I18nStrategySeoAttributes
  setRouter(router: I18nStrategyRouterLike): void
  getDefaultLocale(): string
  getLocales(): Array<{ code: string, [key: string]: unknown }>
  getStrategy(): 'no_prefix' | 'prefix_except_default' | 'prefix' | 'prefix_and_default'
  getLocalizedRouteNamePrefix(): string
  getGlobalLocaleRoutes(): Record<string, Record<string, string> | false | boolean> | undefined
  getRouteLocales(): Record<string, string[]> | undefined
  getRoutesLocaleLinks(): Record<string, string> | undefined
  getNoPrefixRedirect(): boolean | undefined
}

/** Роутер для createI18nStrategy (hasRoute, resolve). */
interface I18nStrategyRouterLike {
  hasRoute(name: string): boolean
  resolve(to: unknown): { name: string | null, path: string, fullPath: string, params?: Record<string, unknown>, query?: Record<string, unknown>, hash?: string }
}

declare module '#build/i18n.strategy.mjs' {
  /** Создаёт инстанс стратегии: контекст (build-time) уже в файле, при импорте передаётся только router. */
  export function createI18nStrategy(router: I18nStrategyRouterLike): I18nStrategyInstance
  export function getI18nConfig(): unknown
}

/** Nitro-алиасы: те же экспорты, что и #build/..., для server routes/plugins/middleware */
declare module '#i18n-internal/config' {
  export function getI18nPrivateConfig(): I18nPrivateConfig
}

declare module '#i18n-internal/strategy' {
  export function getI18nConfig(): unknown
  export function createI18nStrategy(router: I18nStrategyRouterLike): I18nStrategyInstance
}
