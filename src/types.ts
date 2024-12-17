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

export interface DefineI18nRouteConfig {
  locales?: Record<LocaleCode, Record<string, string>>
  localeRoutes?: Record<LocaleCode, string>
}
export type I18nRouteParams = Record<LocaleCode, Record<string, string>> | null

export type Params = Record<string, string | number | boolean>

export type Getter = (key: string, params?: Record<string, string | number | boolean>, defaultValue?: string) => unknown
export type PluralFunc = (key: string, count: number, params: Params, locale: string, getter: Getter) => string | null

export type GlobalLocaleRoutes = Record<string, Record<LocaleCode, string> | false | boolean> | null | undefined

export interface ModuleOptions {
  locales?: Locale[]
  meta?: boolean
  metaBaseUrl?: string
  define?: boolean
  defaultLocale?: string
  apiBaseUrl?: string
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
  localeCookie?: string
  debug?: boolean
  globalLocaleRoutes?: GlobalLocaleRoutes
  customRegexMatcher?: string | RegExp
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
}
