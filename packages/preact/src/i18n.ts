import { I18n as RuntimeI18n, type I18nOptions as RuntimeI18nOptions } from '@i18n-micro/runtime'

export interface PreactI18nOptions extends RuntimeI18nOptions {}

/**
 * Preact-facing i18n instance. Same surface as `@i18n-micro/runtime`, kept as a
 * named subclass so `instanceof PreactI18n` and context typing stay stable.
 */
export class PreactI18n extends RuntimeI18n {}

export function createI18n(options: PreactI18nOptions): PreactI18n {
  return new PreactI18n(options)
}
