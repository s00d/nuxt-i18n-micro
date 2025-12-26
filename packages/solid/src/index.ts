// Main exports
export { createI18n, SolidI18n } from './i18n'
export type { SolidI18nOptions } from './i18n'

export { I18nProvider } from './context'
export type { I18nProviderProps } from './context'

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

export { useI18n } from './use-i18n'
export type { UseI18nOptions } from './use-i18n'

export { I18nT } from './components/I18nT'
export { I18nLink } from './components/I18nLink'
export { I18nSwitcher } from './components/I18nSwitcher'
export { I18nGroup } from './components/I18nGroup'

// Router abstraction
export type { I18nRoutingStrategy } from './router/types'
export { createSolidRouterAdapter } from './router/adapter'

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
