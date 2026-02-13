import { createI18n, I18n, type I18nOptions } from './i18n'
import { type LoadedTranslations, loadRootTranslations, loadTranslations } from './loader'

export type { LoadedTranslations, I18nOptions }

export { I18n, createI18n, loadTranslations, loadRootTranslations }

// Re-export utilities from core
export { FormatService, interpolate } from '@i18n-micro/core'
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
