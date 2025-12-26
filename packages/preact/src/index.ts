// Main exports
export { createI18n, PreactI18n } from './i18n'
export type { PreactI18nOptions } from './i18n'

export { I18nProvider, useI18n } from './context'
export type { I18nProviderProps, UseI18nReturn, UseI18nOptions } from './context'

export { I18nT } from './components/I18nT'
export type { I18nTProps } from './components/I18nT'

export { I18nLink } from './components/I18nLink'
export type { I18nLinkProps } from './components/I18nLink'

export { I18nSwitcher } from './components/I18nSwitcher'
export type { I18nSwitcherProps } from './components/I18nSwitcher'

export { I18nGroup } from './components/I18nGroup'
export type { I18nGroupProps } from './components/I18nGroup'

// Injection helpers
export {
  I18nContext,
  I18nLocalesContext,
  I18nDefaultLocaleContext,
  I18nRouterContext,
  useI18nContext,
  useI18nLocales,
  useI18nDefaultLocale,
  useI18nRouter,
} from './injection'

// Router abstraction
export type { I18nRoutingStrategy } from './router/types'
export { createBrowserHistoryAdapter, createPreactRouterAdapter } from './router/adapter'

// Re-export types from @i18n-micro/types
export type {
  Translations,
  Params,
  PluralFunc,
  Getter,
  Locale,
  LocaleCode,
  CleanTranslation,
  TranslationKey,
  ModuleOptions,
} from '@i18n-micro/types'

// Re-export utilities from core
export { interpolate, FormatService, defaultPlural } from '@i18n-micro/core'
