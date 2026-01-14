import type { H3Event } from 'h3'
import { interpolate, useTranslationHelper } from '@i18n-micro/core'
import type { TranslationCache } from '@i18n-micro/core/dist/translation' // <-- Direct type import
import type { ModuleOptionsExtend, ModulePrivateOptionsExtend, Params, Translations, MessageCompilerFunc } from '@i18n-micro/types'
import { detectCurrentLocale } from './utils/locale-detector'
import { useRuntimeConfig } from '#imports'

let messageCompiler: MessageCompilerFunc | undefined
let messageCompilerLoaded = false

async function getMessageCompiler(): Promise<MessageCompilerFunc | undefined> {
  if (messageCompilerLoaded) {
    return messageCompiler
  }
  messageCompilerLoaded = true
  try {
    // bypass vite pre-import optimization
    const modName = '#build/i18n.message-compiler.mjs'
    const mod = await import(modName)
    messageCompiler = mod.messageCompiler
  }
  catch {
    // No messageCompiler configured - this is fine
  }
  return messageCompiler
}

// Constant for the request context key to avoid typos
const I18N_CONTEXT_KEY = '__i18n_cache__'

async function fetchTranslations(locale: string): Promise<Translations> {
  try {
    const config = useRuntimeConfig() as { i18nConfig?: ModulePrivateOptionsExtend }
    const i18nConfig = config.i18nConfig
    const apiBaseUrl = i18nConfig?.apiBaseUrl ?? '_locales'
    const apiBaseServerHost = i18nConfig?.apiBaseServerHost ?? undefined
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

  const config = useRuntimeConfig(event).public.i18nConfig as unknown as ModuleOptionsExtend // Changed to public.i18nConfig, as locales are there
  const { locales, fallbackLocale, defaultLocale: configDefaultLocale } = config

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

  // Load messageCompiler lazily (if configured)
  const compiler = await getMessageCompiler()

  // Get or create compiled message cache for this request
  const compiledCacheKey = '__compiled_cache__'
  if (!requestScopedCache.serverTranslationCache[compiledCacheKey]) {
    requestScopedCache.serverTranslationCache[compiledCacheKey] = new Map<string, (params?: Params) => string>()
  }
  const compiledCache = requestScopedCache.serverTranslationCache[compiledCacheKey] as Map<string, (params?: Params) => string>

  function t(key: string, params?: Params, defaultValue?: string): string {
    // getTranslation will also operate on requestScopedCache
    let translation = getTranslation<string>(locale, 'index', key)
    if (!translation) {
      translation = defaultValue || key
    }

    // Compile/Interpolate
    // If messageCompiler is set, ALWAYS use it (even without params) for consistency with ICU formatters
    if (typeof translation === 'string' && compiler) {
      const cacheKey = `${locale}:${key}`

      let compiledFn = compiledCache.get(cacheKey)
      if (!compiledFn) {
        // Compile once and cache
        compiledFn = compiler(translation, locale, key)
        compiledCache.set(cacheKey, compiledFn)
      }

      // Execute compiled function with params (or empty object)
      return compiledFn(params ?? {})
    }

    // Fallback to simple interpolation (existing behavior when no messageCompiler)
    return typeof translation === 'string' && params ? interpolate(translation, params) : translation
  }

  return t
}
