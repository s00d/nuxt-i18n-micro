import type { Locale, ModuleOptionsExtend } from '@i18n-micro/types'
import type { H3Event } from 'h3'
import { getI18nConfig } from '#i18n-internal/strategy'
import { detectCurrentLocale } from './locale-detector'

export interface LocaleInfo {
  current: string
  default: string
  fallback: string
  available: string[]
  locale: Locale | null
  isDefault: boolean
  isFallback: boolean
}

export const useLocaleServerMiddleware = (event: H3Event, defaultLocale?: string, currentLocale?: string): LocaleInfo => {
  const { locales, defaultLocale: configDefaultLocale, fallbackLocale } = getI18nConfig() as ModuleOptionsExtend

  const detectedLocale =
    currentLocale ||
    detectCurrentLocale(
      event,
      {
        fallbackLocale,
        defaultLocale: defaultLocale || configDefaultLocale,
        locales,
      },
      defaultLocale,
    )

  const localeConfig = locales?.find((l) => l.code === detectedLocale) ?? null
  const availableLocales = locales?.map((l) => l.code) ?? []
  const isDefault = detectedLocale === (defaultLocale || configDefaultLocale || 'en')
  const isFallback = detectedLocale === (fallbackLocale || defaultLocale || configDefaultLocale || 'en')

  return {
    current: detectedLocale,
    default: defaultLocale || configDefaultLocale || 'en',
    fallback: fallbackLocale || defaultLocale || configDefaultLocale || 'en',
    available: availableLocales,
    locale: localeConfig,
    isDefault,
    isFallback,
  }
}
