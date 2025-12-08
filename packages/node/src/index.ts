import { loadTranslations, loadGlobalTranslations, type LoadedTranslations } from './loader'
import { I18n, createI18n, type I18nOptions } from './i18n'

export type { LoadedTranslations, I18nOptions }

export { I18n, createI18n, loadTranslations, loadGlobalTranslations }

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
export { interpolate, FormatService } from '@i18n-micro/core'
