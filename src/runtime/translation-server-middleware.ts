import type { H3Event } from 'h3'
import { interpolate, useTranslationHelper } from '@i18n-micro/core'
import type { TranslationCache } from '@i18n-micro/core'
import type { ModuleOptionsExtend, Params, Translations } from '@i18n-micro/types'
import { detectCurrentLocale } from './utils/locale-detector'
import { getI18nConfig } from '#i18n-internal/strategy'

// Constant for the request context key to avoid typos
const I18N_CONTEXT_KEY = '__i18n_cache__'

async function fetchTranslations(locale: string): Promise<Translations> {
  try {
    const i18nConfig = getI18nConfig() as ModuleOptionsExtend
    const apiBaseUrl = i18nConfig.apiBaseUrl ?? '_locales'
    const apiBaseServerHost = i18nConfig.apiBaseServerHost ?? undefined
    // IMPORTANT: On the server, use a full URL or a configured baseURL for $fetch.
    // If the endpoint is on the same server, Nuxt/Nitro will handle it internally.
    let url = `/${apiBaseUrl}/general/${locale}/data.json`
    if (apiBaseServerHost) {
      url = `${apiBaseServerHost}${url}`
    }
    const translations = await $fetch(url)
    return translations as Translations
  }
  catch (error) {
    console.error(`Error loading translation for locale "${locale}":`, error)
    return {}
  }
}

export const useTranslationServerMiddleware = async (event: H3Event, defaultLocale?: string, currentLocale?: string) => {
  // --- STEP 1: Create or retrieve an isolated cache for this request ---

  // Check if the cache has already been created for this request (e.g., by another middleware)
  if (!event.context[I18N_CONTEXT_KEY]) {
    // If not, create a "clean" cache and store it in event.context.
    // This object will live only for the duration of this request.
    event.context[I18N_CONTEXT_KEY] = {
      generalLocaleCache: {},
      routeLocaleCache: {},
      dynamicTranslationsCaches: [],
      serverTranslationCache: {},
    } as TranslationCache
  }

  // Get a reference to this request's cache
  const requestScopedCache: TranslationCache = event.context[I18N_CONTEXT_KEY]

  // --- STEP 2: Pass the isolated cache to useTranslationHelper ---

  // The helper will now operate on data unique to this request
  const { getTranslation, loadTranslations, hasGeneralTranslation } = useTranslationHelper(requestScopedCache)

  const { locales, fallbackLocale, defaultLocale: configDefaultLocale } = getI18nConfig() as ModuleOptionsExtend

  // Pass locales for URL path check
  const locale = currentLocale || detectCurrentLocale(event, {
    fallbackLocale,
    defaultLocale: defaultLocale || configDefaultLocale,
    locales,
  }, defaultLocale)

  // --- STEP 3: Logic remains the same, but now it's safe ---

  if (!hasGeneralTranslation(locale)) {
    const translations = await fetchTranslations(locale)
    // loadTranslations will now mutate requestScopedCache instead of a global object
    await loadTranslations(locale, translations)
  }

  function t(key: string, params?: Params, defaultValue?: string): string {
    // getTranslation will also operate on requestScopedCache
    let translation = getTranslation<string>(locale, 'index', key)
    if (!translation) {
      translation = defaultValue || key
    }
    return typeof translation === 'string' && params ? interpolate(translation, params) : translation
  }

  return t
}
