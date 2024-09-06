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
  plural?: string
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
