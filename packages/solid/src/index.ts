// Main exports

// Re-export utilities from core
export { defaultPlural, FormatService, interpolate } from '@i18n-micro/core'
// Re-export types from @i18n-micro/types
export type { CleanTranslation, Getter, Locale, LocaleCode, ModuleOptions, Params, PluralFunc, TranslationKey, Translations } from '@i18n-micro/types'
export type { I18nGroupProps } from './components/I18nGroup'
export { I18nGroup } from './components/I18nGroup'
export type { I18nLinkProps } from './components/I18nLink'
export { I18nLink } from './components/I18nLink'
export type { I18nSwitcherProps } from './components/I18nSwitcher'
export { I18nSwitcher } from './components/I18nSwitcher'
export type { I18nTComponent, I18nTProps } from './components/I18nT'
export { I18nT } from './components/I18nT'
export type { I18nProviderProps } from './context'
export { I18nProvider } from './context'
export type { SolidI18nOptions } from './i18n'
export { createI18n, SolidI18n } from './i18n'
// Injection helpers
export type { I18nContextValue } from './injection'
export { I18nContext, useI18nContext, useI18nDefaultLocale, useI18nLocales, useI18nRouter } from './injection'
// Router adapter: `@i18n-micro/solid/router` (keeps the optional router peer out of this entry)
// Router abstraction
export type { I18nRoutingStrategy, RouteTarget } from './router/types'
export type { UseI18nOptions, UseI18nReturn } from './use-i18n'
export { useI18n } from './use-i18n'
