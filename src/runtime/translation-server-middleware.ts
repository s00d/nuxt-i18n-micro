import type { H3Event } from 'h3'
import { getQuery, getCookie } from 'h3'
import { interpolate, useTranslationHelper } from 'nuxt-i18n-micro-core'
import type { Params, Translations } from 'nuxt-i18n-micro-types'
import { useRuntimeConfig } from '#imports'

async function fetchTranslations(locale: string): Promise<Translations> {
  try {
    const translations = await $fetch(`/_locales/general/${locale}/data.json`)
    return translations as Translations
  }
  catch (error) {
    console.error(`Error loading translation for locale "${locale}":`, error)
    return {}
  }
}

export const useTranslationServerMiddleware = async (event: H3Event, defaultLocale?: string, currentLocale?: string) => {
  const { getTranslation, loadTranslations, hasGeneralTranslation } = useTranslationHelper()
  const config = useRuntimeConfig(event).i18nConfig

  const locale = (
    currentLocale
    || event.context.params?.locale
    || getQuery(event)?.locale
    || getCookie(event, 'user-locale')
    || event.headers.get('accept-language')?.split(',')[0]
    || config.fallbackLocale
    || defaultLocale
    || 'en').toString()

  if (!hasGeneralTranslation(locale)) {
    const translations = await fetchTranslations(locale)
    await loadTranslations(locale, translations)
  }

  function t(key: string, params?: Params, defaultValue?: string): string {
    let translation = getTranslation<string>(locale, 'index', key)
    if (!translation) {
      translation = defaultValue || key
    }
    return typeof translation === 'string' && params ? interpolate(translation, params) : translation
  }

  return t
}
