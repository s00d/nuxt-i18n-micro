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
  getI18nProps,
} from './utils'
export type { LocaleHeadOptions, LocaleHeadResult, I18nClientProps } from './utils'

// Router abstraction
export type { I18nRoutingStrategy } from './router/types'
export { createAstroRouterAdapter } from './router/adapter'

// Legacy routing utilities (deprecated, use routingStrategy instead)
// Kept for backward compatibility
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

// Export translation loading utilities
export {
  loadTranslationsFromDir,
  loadTranslationsIntoI18n,
} from './load-translations'
export type { LoadTranslationsOptions, LoadedTranslations } from './load-translations'
// It's loaded directly by Astro via entrypoint in integration config
