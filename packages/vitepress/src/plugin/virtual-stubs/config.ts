import type { Locale } from '@i18n-micro/types'

/** Typecheck stub — real module is provided by `withI18n` Vite plugin. */
export const config: {
  defaultLocale: string
  fallbackLocale: string
  locales: Locale[]
  localeCodes: string[]
  missingWarn: boolean
  syncWithVitePress: boolean
  translationDir: string
  disablePageLocales: boolean
  localeKeyToCode: Record<string, string>
  base?: string
} = {
  defaultLocale: 'en',
  fallbackLocale: 'en',
  locales: [],
  localeCodes: [],
  missingWarn: true,
  syncWithVitePress: true,
  translationDir: 'locales',
  disablePageLocales: false,
  localeKeyToCode: {},
}
