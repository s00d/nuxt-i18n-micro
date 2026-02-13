import { interpolate } from '@i18n-micro/core'
import type { ModuleOptionsExtend, Params, Translations } from '@i18n-micro/types'
import type { H3Event } from 'h3'
import { getI18nConfig } from '#i18n-internal/strategy'
import { detectCurrentLocale } from './locale-detector'
import { loadTranslationsFromServer } from './server-loader'

const I18N_CONTEXT_KEY = '__i18n_translations__'

export const useTranslationServerMiddleware = async (event: H3Event, defaultLocale?: string, currentLocale?: string) => {
  const { locales, fallbackLocale, defaultLocale: configDefaultLocale } = getI18nConfig() as ModuleOptionsExtend

  const locale =
    currentLocale ||
    event.context.i18n?.locale ||
    detectCurrentLocale(
      event,
      {
        fallbackLocale,
        defaultLocale: defaultLocale || configDefaultLocale,
        locales,
      },
      defaultLocale,
    )

  // Load translations once per request
  if (!event.context[I18N_CONTEXT_KEY]) {
    let translations: Translations
    if (event.context.i18n?.translations && Object.keys(event.context.i18n.translations).length > 0) {
      translations = event.context.i18n.translations
    } else {
      const { data } = await loadTranslationsFromServer(locale, 'index')
      translations = data
    }
    event.context[I18N_CONTEXT_KEY] = translations
  }

  const translations: Translations = event.context[I18N_CONTEXT_KEY]

  function t(key: string, params?: Params, defaultValue?: string): string {
    // Direct key lookup
    let value: unknown = translations[key]

    // Dot-path lookup
    if (value === undefined && key.includes('.')) {
      const parts = key.split('.')
      let current: unknown = translations
      for (const part of parts) {
        if (current && typeof current === 'object' && part in (current as object)) {
          current = (current as Translations)[part]
        } else {
          current = undefined
          break
        }
      }
      value = current
    }

    if (value === undefined || value === null) {
      return defaultValue || key
    }

    const str = typeof value === 'string' ? value : String(value)
    return params ? interpolate(str, params) : str
  }

  return t
}
