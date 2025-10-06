export type LocaleCode = string

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
  locales?: Record<LocaleCode, Record<string, string>>
  localeRoutes?: Record<LocaleCode, string>
}
export type I18nRouteParams = Record<LocaleCode, Record<string, string>> | null

export type Params = Record<string, string | number | boolean>

export type Getter = (key: string, params?: Record<string, string | number | boolean>, defaultValue?: string) => unknown
export type PluralFunc = (key: string, count: number, params: Params, locale: string, getter: Getter) => string | null

export type GlobalLocaleRoutes = Record<string, Record<LocaleCode, string> | false | boolean> | null | undefined

export type Strategies = 'no_prefix' | 'prefix_except_default' | 'prefix' | 'prefix_and_default'

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
  translationDir?: string
  autoDetectLanguage?: boolean
  autoDetectPath?: string
  disableWatcher?: boolean
  disableUpdater?: boolean
  types?: boolean
  includeDefaultLocaleRoute?: boolean
  routesLocaleLinks?: { [key: string]: string }
  plural?: string | PluralFunc
  disablePageLocales?: boolean
  fallbackLocale?: string
  localeCookie?: string
  debug?: boolean
  globalLocaleRoutes?: GlobalLocaleRoutes
  customRegexMatcher?: string | RegExp
  noPrefixRedirect?: boolean
  canonicalQueryWhitelist?: string[]
  excludePatterns?: (string | RegExp)[]
  routeLocales?: Record<string, string[]>
  experimental?: {
    i18nPreviousPageFallback?: boolean
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
  customRegexMatcher?: string | RegExp
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
