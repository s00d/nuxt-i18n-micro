// Main exports

// Re-export utilities from core
export { defaultPlural, FormatService, interpolate } from '@i18n-micro/core'
// Re-export types from @i18n-micro/types
export type {
  CleanTranslation,
  Getter,
  Locale,
  LocaleCode,
  ModuleOptions,
  Params,
  PluralFunc,
  TranslationKey,
  Translations,
} from '@i18n-micro/types'
export type { I18nGroupProps } from './components/I18nGroup'
export { I18nGroup } from './components/I18nGroup'
export type { I18nLinkProps } from './components/I18nLink'
export { I18nLink } from './components/I18nLink'
export type { I18nSwitcherProps } from './components/I18nSwitcher'
export { I18nSwitcher } from './components/I18nSwitcher'
export type { I18nTProps } from './components/I18nT'
export { I18nT } from './components/I18nT'
export type { I18nProviderProps, UseI18nOptions, UseI18nReturn } from './context'
export { I18nProvider, useI18n } from './context'
export type { ReactI18nOptions } from './i18n'
export { createI18n, ReactI18n } from './i18n'
// Injection helpers
export {
  I18nContext,
  I18nDefaultLocaleContext,
  I18nLocalesContext,
  I18nRouterContext,
  useI18nContext,
  useI18nDefaultLocale,
  useI18nLocales,
  useI18nRouter,
} from './injection'
export { createReactRouterAdapter } from './router/adapter'
// Router abstraction
export type { I18nRoutingStrategy } from './router/types'
