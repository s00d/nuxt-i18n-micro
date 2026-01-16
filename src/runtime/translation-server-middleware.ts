import type { H3Event } from 'h3'
import { useTranslationHelper, compileOrInterpolate, createCompiledCache } from '@i18n-micro/core'
import type { TranslationCache } from '@i18n-micro/core/dist/translation' // <-- Direct type import
import type { ModuleOptionsExtend, ModulePrivateOptionsExtend, Params, Translations, MessageCompilerFunc } from '@i18n-micro/types'
import { detectCurrentLocale } from './utils/locale-detector'
import { useRuntimeConfig } from '#imports'

// Lazy load messageCompiler (with proper error handling)
let messageCompiler: MessageCompilerFunc | undefined
let messageCompilerLoaded = false

async function getMessageCompiler(): Promise<MessageCompilerFunc | undefined> {
  if (messageCompilerLoaded) return messageCompiler
  messageCompilerLoaded = true
  try {
    const modName = '#build/i18n.message-compiler.mjs'
    const mod = await import(/* @vite-ignore */ modName)
    messageCompiler = mod.messageCompiler
  }
  catch (err: unknown) {
    // Определяем, является ли ошибка ошибкой "модуль не найден"
    const isModuleMissing
      = err
        && typeof err === 'object'
        && (('code' in err && (err as NodeJS.ErrnoException).code === 'MODULE_NOT_FOUND')
          || ('message' in err && (err as Error).message?.includes('Cannot find module')))

    // Игнорируем только если модуль действительно отсутствует.
    // Все остальные ошибки (например, синтаксические) выводим в консоль.
    if (!isModuleMissing) {
      console.error('[i18n] Failed to load message compiler. Check for errors in your messageCompiler function in nuxt.config:', err)
    }
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

  // Load messageCompiler lazily
  const compiler = await getMessageCompiler()

  // Get or create compiled message cache for this request
  // Store in event.context to avoid type issues with serverTranslationCache
  const compiledCacheContextKey = '__i18n_compiled_cache__'
  if (!event.context[compiledCacheContextKey]) {
    event.context[compiledCacheContextKey] = createCompiledCache()
  }
  const compiledCache = event.context[compiledCacheContextKey] as ReturnType<typeof createCompiledCache>

  function t(key: string, params?: Params, defaultValue?: string): string {
    // getTranslation will also operate on requestScopedCache
    let translation = getTranslation<string>(locale, 'index', key)
    if (!translation) {
      translation = defaultValue || key
    }

    // Compile/Interpolate (using centralized utility)
    if (typeof translation === 'string') {
      return compileOrInterpolate(
        translation,
        locale,
        'index', // routeName for server middleware
        key,
        params,
        compiler,
        compiledCache,
      )
    }

    return translation
  }

  return t
}
