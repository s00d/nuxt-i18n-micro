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
  const { locales, defaultLocale: configDefaultLocale, fallbackLocale } = config.public.i18nConfig as ModuleOptionsExtend

  // Определяем текущую локаль по приоритету
  const detectedLocale = currentLocale || detectCurrentLocale(event, { fallbackLocale, defaultLocale: defaultLocale || configDefaultLocale })

  // Находим конфигурацию текущей локали
  const localeConfig = locales?.find(l => l.code === detectedLocale) ?? null

  // Получаем список доступных локалей
  const availableLocales = locales?.map(l => l.code) ?? []

  // Проверяем, является ли текущая локаль дефолтной
  const isDefault = detectedLocale === (defaultLocale || configDefaultLocale || 'en')

  // Проверяем, является ли текущая локаль fallback
  const isFallback = detectedLocale === (fallbackLocale || defaultLocale || configDefaultLocale || 'en')

  return {
    current: detectedLocale,
    default: defaultLocale || configDefaultLocale || 'en',
    fallback: fallbackLocale || defaultLocale || configDefaultLocale || 'en',
    available: availableLocales,
    locale: localeConfig,
    isDefault,
    isFallback
  }
}
