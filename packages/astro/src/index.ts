// Import shim to ensure types are available
import './env.d'

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
export { AstroI18n, type AstroI18nOptions } from './composer'
// Export integration options type
export type { I18nIntegrationOptions } from './integration'
// Main exports
export { createI18n, i18nIntegration } from './integration'
export type { LoadedTranslations, LoadTranslationsOptions } from './load-translations'
// Export translation loading utilities
export {
  loadTranslationsFromDir,
  loadTranslationsIntoI18n,
} from './load-translations'
export type { I18nMiddlewareOptions } from './middleware'
export { createI18nMiddleware, detectLocale } from './middleware'
export { createAstroRouterAdapter } from './router/adapter'
// Router abstraction
export type { I18nRoutingStrategy } from './router/types'
// Legacy routing utilities (deprecated, use routingStrategy instead)
// Kept for backward compatibility
export {
  getLocaleFromPath,
  getRouteName,
  localizePath,
  removeLocaleFromPath,
  switchLocalePath,
} from './routing'
export type { I18nClientProps, LocaleHeadOptions, LocaleHeadResult } from './utils'
// Utilities
export {
  getDefaultLocale,
  getI18n,
  getI18nProps,
  getLocale,
  getLocales,
  useI18n,
  useLocaleHead,
} from './utils'
// It's loaded directly by Astro via entrypoint in integration config
