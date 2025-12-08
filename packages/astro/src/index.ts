// Import shim to ensure types are available
import './env.d'

// Main exports
export { i18nIntegration, createI18n } from './integration'
export { AstroI18n, type AstroI18nOptions } from './composer'
export { createI18nMiddleware, detectLocale } from './middleware'
export type { I18nMiddlewareOptions } from './middleware'

// Utilities
export {
  useI18n,
  getI18n,
  getLocale,
  getDefaultLocale,
  getLocales,
  useLocaleHead,
} from './utils'
export type { LocaleHeadOptions, LocaleHeadResult } from './utils'

// Routing utilities
export {
  getRouteName,
  getLocaleFromPath,
  switchLocalePath,
  localizePath,
  removeLocaleFromPath,
} from './routing'

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

// Export integration options type
export type { I18nIntegrationOptions } from './integration'

// Note: toolbar-app.ts is not exported to avoid SSR issues
// It's loaded directly by Astro via entrypoint in integration config
