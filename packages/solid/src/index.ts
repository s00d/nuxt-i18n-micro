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
export { I18nGroup } from './components/I18nGroup'
export { I18nLink } from './components/I18nLink'
export { I18nSwitcher } from './components/I18nSwitcher'
export { I18nT } from './components/I18nT'
export type { I18nProviderProps } from './context'
export { I18nProvider } from './context'
export type { SolidI18nOptions } from './i18n'
export { createI18n, SolidI18n } from './i18n'
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
export { createSolidRouterAdapter } from './router/adapter'
// Router abstraction
export type { I18nRoutingStrategy } from './router/types'
export type { UseI18nOptions } from './use-i18n'
export { useI18n } from './use-i18n'
