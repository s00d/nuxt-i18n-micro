// Main exports

export { I18nGroup } from './components/i18n-group'
export { I18nLink } from './components/i18n-link'
export { I18nSwitcher } from './components/i18n-switcher'
export { I18nT } from './components/i18n-t'
export type { UseLocaleHeadOptions } from './composables/use-locale-head'
// Composables
export { useLocaleHead } from './composables/use-locale-head'
export { VueI18n, type VueI18nOptions } from './composer'
export { I18nDefaultLocaleKey, I18nInjectionKey, I18nLocalesKey } from './injection'
export type { I18nPlugin } from './plugin'
export { createI18n } from './plugin'
export { type UseI18nOptions, useI18n } from './use-i18n'

// Router integration - should be implemented in playground

// Re-export utilities from core
export { defaultPlural, FormatService, interpolate } from '@i18n-micro/core'
// Re-export types from @i18n-micro/types
export type {
  CleanTranslation,
  Getter,
  Locale,
  LocaleCode,
  Params,
  PluralFunc,
  Translations,
} from '@i18n-micro/types'
export { createVueRouterAdapter } from './router/adapter'
// Router abstraction
export type { I18nRoutingStrategy } from './router/types'
