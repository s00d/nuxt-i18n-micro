import type { H3Event } from 'h3'
import type { Locale, ModuleOptionsExtend } from 'nuxt-i18n-micro-types'
import { detectCurrentLocale } from './utils/locale-detector'
import { useRuntimeConfig } from '#imports'

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
  const config = useRuntimeConfig(event)
  const { locales, defaultLocale: configDefaultLocale, fallbackLocale } = config.public.i18nConfig as unknown as ModuleOptionsExtend

  // Determine current locale by priority
  // Pass locales to config for URL path check
  const detectedLocale = currentLocale || detectCurrentLocale(event, {
    fallbackLocale,
    defaultLocale: defaultLocale || configDefaultLocale,
    locales, // Pass the list of locales
  })

  // Find configuration for current locale
  const localeConfig = locales?.find(l => l.code === detectedLocale) ?? null

  // Get list of available locales
  const availableLocales = locales?.map(l => l.code) ?? []

  // Check if current locale is default
  const isDefault = detectedLocale === (defaultLocale || configDefaultLocale || 'en')

  // Check if current locale is fallback
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
