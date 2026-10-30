import type { Locale } from '@i18n-micro/types'
import { getEnabledLocales } from '@i18n-micro/utils/active-locales'
import type { H3Event } from 'h3'
import { getI18nServerConfig, getRequestLocale } from './locale-detector'

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
  const config = getI18nServerConfig(event)
  const enabledLocales = getEnabledLocales(config.locales)
  const resolvedDefault = defaultLocale || config.defaultLocale || 'en'
  const fallback = config.fallbackLocale || resolvedDefault
  const current = currentLocale || getRequestLocale(event, config, defaultLocale)

  return {
    current,
    default: resolvedDefault,
    fallback,
    available: enabledLocales.map((l) => l.code),
    locale: enabledLocales.find((l) => l.code === current) ?? null,
    isDefault: current === resolvedDefault,
    isFallback: current === fallback,
  }
}
