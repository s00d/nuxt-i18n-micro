export type LocaleCode = string

export interface Locale {
  code: LocaleCode
  disabled?: boolean
  iso?: string
  dir?: 'ltr' | 'rtl' | 'auto'
  displayName: string
}

export interface DefineI18nRouteConfig {
  locales?: Record<LocaleCode, Record<string, string>>
  localeRoutes?: Record<LocaleCode, string>
}
export type I18nRouteParams = Record<LocaleCode, Record<string, string>> | null

export type Getter = (key: string, params?: Record<string, string | number | boolean>, defaultValue?: string) => unknown
export type PluralFunc = (key: string, count: number, locale: string, getter: Getter) => string | null

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
  includeDefaultLocaleRoute?: boolean
  routesLocaleLinks?: Record<string, string>
  plural?: string | PluralFunc
  disablePageLocales?: boolean
  fallbackLocale?: string
  localeCookie?: string
  globalLocaleRoutes?: GlobalLocaleRoutes
}

export interface ModuleOptionsExtend extends ModuleOptions {
  plural: string
  dateBuild: number
  baseURL: string
  hashMode: boolean
  apiBaseUrl: string
}

export interface ModulePrivateOptionsExtend extends ModuleOptions {
  rootDir: string
  rootDirs: string[]
}
