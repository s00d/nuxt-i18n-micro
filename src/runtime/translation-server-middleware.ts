import type { H3Event } from 'h3'
import { interpolate, useTranslationHelper } from 'nuxt-i18n-micro-core'
import type { TranslationCache } from 'nuxt-i18n-micro-core/dist/translation' // <-- Direct type import
import type { ModuleOptionsExtend, ModulePrivateOptionsExtend, Params, Translations } from 'nuxt-i18n-micro-types'
import { detectCurrentLocale } from './utils/locale-detector'
import { useRuntimeConfig } from '#imports'

// Constant for the request context key to avoid typos
const I18N_CONTEXT_KEY = '__i18n_cache__'

async function fetchTranslations(locale: string): Promise<Translations> {
  try {
    const config = useRuntimeConfig() as { i18nConfig?: ModulePrivateOptionsExtend }
    const i18nConfig = config.i18nConfig
    const apiBaseUrl = i18nConfig?.apiBaseUrl ?? '/_locales'
    // IMPORTANT: On the server, use a full URL or a configured baseURL for $fetch.
    // If the endpoint is on the same server, Nuxt/Nitro will handle it internally.
    const translations = await $fetch(`${apiBaseUrl}/general/${locale}/data.json`)
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

  const config = useRuntimeConfig(event).i18nConfig as unknown as ModuleOptionsExtend
  const locale = currentLocale || detectCurrentLocale(event, config, defaultLocale)

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
