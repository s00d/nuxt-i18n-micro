import type { H3Event } from 'h3'
import { interpolate, useTranslationHelper } from '@i18n-micro/core'
import type { TranslationCache } from '@i18n-micro/core'
import type { ModuleOptionsExtend, Params, Translations } from '@i18n-micro/types'
import { detectCurrentLocale } from './locale-detector'
import { getI18nConfig } from '#i18n-internal/strategy'
import { loadLayerTranslations } from './load-from-storage'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - #imports are available in Nitro
import { useStorage } from '#imports'

const I18N_CONTEXT_KEY = '__i18n_cache__'

export const useTranslationServerMiddleware = async (event: H3Event, defaultLocale?: string, currentLocale?: string) => {
  if (!event.context[I18N_CONTEXT_KEY]) {
    event.context[I18N_CONTEXT_KEY] = {
      generalLocaleCache: {},
      routeLocaleCache: {},
      dynamicTranslationsCaches: [],
      serverTranslationCache: {},
    } as TranslationCache
  }

  const requestScopedCache: TranslationCache = event.context[I18N_CONTEXT_KEY]
  const { getTranslation, loadTranslations, hasGeneralTranslation } = useTranslationHelper(requestScopedCache)
  const { locales, fallbackLocale, defaultLocale: configDefaultLocale } = getI18nConfig() as ModuleOptionsExtend

  const locale = currentLocale || (event.context.i18n?.locale) || detectCurrentLocale(event, {
    fallbackLocale,
    defaultLocale: defaultLocale || configDefaultLocale,
    locales,
  }, defaultLocale)

  if (!hasGeneralTranslation(locale)) {
    let translations: Translations = {}
    if (event.context.i18n?.translations && Object.keys(event.context.i18n.translations).length > 0) {
      translations = event.context.i18n.translations
    }
    else {
      const storage = useStorage()
      translations = await loadLayerTranslations(storage, locale)
    }
    await loadTranslations(locale, translations)
  }

  function t(key: string, params?: Params, defaultValue?: string): string {
    let translation = getTranslation<string>(locale, 'index', key)
    if (!translation) translation = defaultValue || key
    return typeof translation === 'string' && params ? interpolate(translation, params) : translation
  }

  return t
}
