import type { H3Event } from 'h3'
import { getQuery, getCookie } from 'h3'
import type { ModuleOptions } from '../types'
import type { Translations } from './plugins/01.plugin'
import { useTranslationHelper } from './translationHelper'
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

export const useTranslationServerMiddleware = async (event: H3Event, currentLocale?: string) => {
  const { getTranslation, loadTranslations, hasGeneralTranslation } = useTranslationHelper()
  const runtimeI18n = useRuntimeConfig().public.i18nConfig as unknown as ModuleOptions

  const locale = (
    currentLocale
    || event.context.params?.locale
    || getQuery(event)?.locale
    || getCookie(event, 'user-locale')
    || event.headers.get('accept-language')?.split(',')[0]
    || runtimeI18n.defaultLocale
    || 'en').toString()

  if (!hasGeneralTranslation(locale)) {
    const translations = await fetchTranslations(locale)
    await loadTranslations(locale, translations)
  }

  function t(key: string): string {
    const translation = getTranslation<string>(locale, 'index', key)
    return translation ?? key
  }

  return t
}
