import type { Locale, ModuleOptionsExtend } from '@i18n-micro/types'
import { getEnabledLocaleCodes, getEnabledLocales } from '@i18n-micro/utils/active-locales'
import { resolveI18nConfigWithRuntimeOverrides } from '@i18n-micro/utils/runtime-config'
import type { H3Event } from 'h3'
import { getI18nConfig } from '#i18n-internal/strategy'
import { useRuntimeConfig } from '#imports'
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
  const {
    locales,
    defaultLocale: configDefaultLocale,
    fallbackLocale,
  } = resolveI18nConfigWithRuntimeOverrides(getI18nConfig() as ModuleOptionsExtend, useRuntimeConfig(event).public as Record<string, unknown>)
  const enabledLocales = getEnabledLocales(locales)

  const detectedLocale =
    currentLocale ||
    detectCurrentLocale(
      event,
      {
        fallbackLocale,
        defaultLocale: defaultLocale || configDefaultLocale,
        locales: enabledLocales,
      },
      defaultLocale,
    )

  const localeConfig = enabledLocales.find((l) => l.code === detectedLocale) ?? null
  const availableLocales = getEnabledLocaleCodes(locales)
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
