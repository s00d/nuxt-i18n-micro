// Main exports
export { createI18n } from './plugin'
export type { I18nPlugin } from './plugin'
export { useI18n, type UseI18nOptions } from './use-i18n'
export { VueI18n, type VueI18nOptions } from './composer'
export { I18nT } from './components/i18n-t'
export { I18nLink } from './components/i18n-link'
export { I18nGroup } from './components/i18n-group'
export { I18nSwitcher } from './components/i18n-switcher'
export { I18nInjectionKey, I18nLocalesKey, I18nDefaultLocaleKey } from './injection'

// Composables
export { useLocaleHead } from './composables/use-locale-head'
export type { UseLocaleHeadOptions } from './composables/use-locale-head'

// Router integration - should be implemented in playground

// Router abstraction
export type { I18nRoutingStrategy } from './router/types'
export { createVueRouterAdapter } from './router/adapter'

// Re-export types from @i18n-micro/types
export type {
  Translations,
  Params,
  PluralFunc,
  Getter,
  Locale,
  LocaleCode,
  CleanTranslation,
} from '@i18n-micro/types'

// Re-export utilities from core
export { interpolate, FormatService, defaultPlural } from '@i18n-micro/core'
