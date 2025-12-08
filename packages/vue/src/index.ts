// Main exports
export { createI18n } from './plugin'
export { useI18n } from './use-i18n'
export { VueI18n, type VueI18nOptions } from './composer'
export { I18nT } from './components/i18n-t'
export { I18nLink } from './components/i18n-link'
export { I18nGroup } from './components/i18n-group'
export { I18nSwitcher } from './components/i18n-switcher'
export { I18nInjectionKey, I18nLocalesKey, I18nDefaultLocaleKey } from './injection'

// Composables
export { useLocaleHead } from './composables/use-locale-head'
export type { UseLocaleHeadOptions } from './composables/use-locale-head'

// Router integration
export {
  setupRouterIntegration,
  switchLocaleRoute,
  getRouteName,
  getLocaleFromRoute,
  type RouterIntegrationOptions,
} from './router'

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

// DevTools integration
export { setupVueDevTools } from './devtools'
export type { VueDevToolsOptions } from './devtools'
export { createVueBridge } from './devtools/bridge/vue-bridge'
export type { VueBridgeOptions } from './devtools/bridge/vue-bridge'
