import { I18n as RuntimeI18n, type I18nOptions as RuntimeI18nOptions } from '@i18n-micro/runtime'

export interface ReactI18nOptions extends RuntimeI18nOptions {}

/**
 * React-facing i18n instance. Same surface as `@i18n-micro/runtime`, kept as a
 * named subclass so `instanceof ReactI18n` and context typing stay stable.
 */
export class ReactI18n extends RuntimeI18n {}

export function createI18n(options: ReactI18nOptions): ReactI18n {
  return new ReactI18n(options)
}
