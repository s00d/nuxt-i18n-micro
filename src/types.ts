export interface Locale {
  code: string
  disabled?: boolean
  iso?: string
  dir?: 'ltr' | 'rtl' | 'auto'
}

export interface DefineI18nRouteConfig {
  locales?: Record<string, Record<string, string>>
  localeRoutes?: Record<string, string>
}

export type Getter = (key: string, params?: Record<string, string | number | boolean>, defaultValue?: string) => unknown
export type PluralFunc = (key: string, count: number, locale: string, getter: Getter) => string | null

export interface ModuleOptions {
  locales?: Locale[]
  meta?: boolean
  metaBaseUrl?: string
  define?: boolean
  defaultLocale?: string
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
}

export interface ModuleOptionsExtend extends ModuleOptions {
  plural: string
  dateBuild: number
  baseURL: string
}

export interface ModulePrivateOptionsExtend extends ModuleOptions {
  rootDir: string
  rootDirs: string[]
}
