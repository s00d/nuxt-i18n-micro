import { createI18n, I18n, type I18nOptions } from './i18n'
import { fetchJsonTranslations, type LoadFromUrlEntry, type LoadFromUrlOptions } from './loader'

export type { I18nOptions, LoadFromUrlEntry, LoadFromUrlOptions }

export { I18n, createI18n, fetchJsonTranslations }

// Re-export utilities from core
export { FormatService, interpolate } from '@i18n-micro/core'
export type { TranslationStorage } from '@i18n-micro/core'
// Re-export types from @i18n-micro/types
export type { CleanTranslation, Getter, Locale, LocaleCode, Params, PluralFunc, Translations } from '@i18n-micro/types'
