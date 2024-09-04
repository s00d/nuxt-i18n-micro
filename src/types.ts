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
  disableWatcher?: boolean
  includeDefaultLocaleRoute?: boolean
  routesLocaleLinks?: Record<string, string>
  plural?: string
  disablePageLocales?: boolean
  localeCookie?: string
}

export interface ModuleOptionsExtend extends ModuleOptions {
  rootDir: string
  plural: string
  rootDirs: string[]
  dateBuild: number
  baseURL: string
}
