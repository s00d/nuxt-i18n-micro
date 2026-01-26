export type LocaleCode = string

// Реестр ключей. Пользователь (через генератор) будет делать module augmentation этого интерфейса.
export interface DefineLocaleMessage {
  // Module augmentation point - will be extended by @i18n-micro/types-generator
  readonly __augmentation?: never
}

// Логика определения типа ключа.
// Если интерфейс пустой (генератор не подключен), тип ключа — string.
// Если в интерфейсе есть ключи, тип ключа — объединение этих ключей и string (Union Type).
// Это позволяет использовать как строгие типы (автокомплит), так и обычные строки (динамические ключи).
export type TranslationKey = keyof DefineLocaleMessage extends never
  ? string
  : keyof DefineLocaleMessage | string

/**
 * Хелпер для создания типизированных префиксов.
 * Позволяет безопасно использовать динамические ключи.
 *
 * @example
 * ```typescript
 * // Допустим, есть ключи: 'errors.404', 'errors.500', 'btn.save'
 * function getErrorText(code: string) {
 *   return t(`errors.${code}` as ScopedKey<'errors'>)
 * }
 * ```
 */
export type ScopedKey<Scope extends string> = Extract<TranslationKey, `${Scope}.${string}`>

export interface Locale {
  code: LocaleCode
  disabled?: boolean
  iso?: string
  dir?: 'ltr' | 'rtl' | 'auto'
  displayName?: string
  baseUrl?: string
  baseDefault?: boolean
  fallbackLocale?: string
  [key: string]: unknown
}

export interface DefineI18nRouteConfig {
  locales?: string[] | Record<LocaleCode, Translations>
  localeRoutes?: Record<LocaleCode, string>
  disableMeta?: boolean | string[]
}
export type I18nRouteParams = Record<LocaleCode, Record<string, string>> | null

export type Params = Record<string, string | number | boolean>

export type Getter = (key: TranslationKey, params?: Record<string, string | number | boolean>, defaultValue?: string) => unknown
export type PluralFunc = (key: TranslationKey, count: number, params: Params, locale: string, getter: Getter) => string | null

export type GlobalLocaleRoutes = Record<string, Record<LocaleCode, string> | false | boolean> | null | undefined

export type Strategies = 'no_prefix' | 'prefix_except_default' | 'prefix' | 'prefix_and_default'

export type MissingHandler = (
  locale: string,
  key: TranslationKey,
  routeName: string,
  instance?: unknown,
  type?: string
) => void

export interface ModuleOptions {
  locales?: Locale[]
  meta?: boolean
  strategy?: Strategies
  metaBaseUrl?: string
  define?: boolean
  redirects?: boolean
  plugin?: boolean
  hooks?: boolean
  defaultLocale?: string
  apiBaseUrl?: string
  apiBaseClientHost?: string
  apiBaseServerHost?: string
  translationDir?: string
  autoDetectLanguage?: boolean
  autoDetectPath?: string
  disableWatcher?: boolean
  types?: boolean
  includeDefaultLocaleRoute?: boolean
  routesLocaleLinks?: { [key: string]: string }
  plural?: string | PluralFunc
  disablePageLocales?: boolean
  fallbackLocale?: string
  localeCookie?: string | null
  debug?: boolean
  globalLocaleRoutes?: GlobalLocaleRoutes
  customRegexMatcher?: string | RegExp
  noPrefixRedirect?: boolean
  canonicalQueryWhitelist?: string[]
  excludePatterns?: (string | RegExp)[]
  routeLocales?: Record<string, string[]>
  routeDisableMeta?: Record<string, boolean | string[]>
  missingWarn?: boolean
  experimental?: {
    i18nPreviousPageFallback?: boolean
    hmr?: boolean
  }
}

export interface ModuleOptionsExtend extends ModuleOptions {
  dateBuild: number
  hashMode: boolean
  isSSG: boolean
  apiBaseUrl: string
  disablePageLocales: boolean
}

export interface ModulePrivateOptionsExtend extends ModuleOptions {
  rootDir: string
  rootDirs: string[]
  debug: boolean
  translationDir: string
  fallbackLocale: string
  apiBaseUrl: string
  apiBaseClientHost?: string
  apiBaseServerHost?: string
  customRegexMatcher?: string | RegExp
  routesLocaleLinks?: { [key: string]: string }
}

export interface PluralTranslations {
  singular: string
  plural: string
}

export type CleanTranslation = string | number | boolean | Translations | PluralTranslations | null
export type Translation = CleanTranslation | unknown

export interface Translations {
  [key: string]: Translation
}

const init = () => {}

export { init }
