// Everything React and Preact export under one name; `index.ts` of each adds the names that differ.

// Re-export utilities from core
export { defaultPlural, FormatService, interpolate } from '@i18n-micro/core'
export { createI18n } from '@i18n-micro/runtime'
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
export type { I18nProviderProps, UseI18nOptions, UseI18nReturn } from './context'
export { I18nProvider, useI18n, useLocaleSwitch, useT } from './context'
// Injection helpers
export type { I18nContextValue, I18nRoutingStrategy, RouteTarget } from './injection'
export { I18nContext, useI18nContext, useI18nDefaultLocale, useI18nLocales, useI18nRouter } from './injection'
