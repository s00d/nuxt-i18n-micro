import { interpolate, resolveTranslation } from '@i18n-micro/core'
import type { Params, Translations } from '@i18n-micro/types'
import type { H3Event } from 'h3'
import { getI18nServerConfig, getRequestLocale } from './locale-detector'
import { loadTranslationsFromServer } from './server-loader'

const I18N_CONTEXT_KEY = '__i18n_translations__'

/** The request's dictionaries, one per locale: a helper called for two locales gets two. */
type RequestDictionaries = Record<string, Translations>

async function dictionaryOf(event: H3Event, locale: string): Promise<Translations> {
  const loaded: RequestDictionaries = (event.context[I18N_CONTEXT_KEY] ??= Object.create(null))
  const own = loaded[locale]
  if (own) return own
  const page = event.context.i18n
  // the page render's preloaded index chunk, when it is in this locale
  const preloaded = page?.locale === locale && page.translations && Object.keys(page.translations).length > 0 ? page.translations : null
  if (preloaded) return (loaded[locale] = preloaded)
  // an outage costs a server route its strings (`t` answers the key or the default), not the response. The next request retries.
  const chunk = await loadTranslationsFromServer(locale, 'index').catch(() => null)
  if (!chunk) {
    console.warn('[i18n] Translation load failed:', locale, 'index')
    return {}
  }
  return (loaded[locale] = chunk.data)
}

export const useTranslationServerMiddleware = async (event: H3Event, defaultLocale?: string, currentLocale?: string) => {
  const locale = currentLocale || getRequestLocale(event, getI18nServerConfig(event), defaultLocale)
  const translations = await dictionaryOf(event, locale)

  function t(key: string, params?: Params, defaultValue?: string): string {
    const value = resolveTranslation(translations, key)

    if (value === null) return defaultValue && params ? interpolate(defaultValue, params) : defaultValue || key

    const str = typeof value === 'string' ? value : String(value)
    return params ? interpolate(str, params) : str
  }

  return t
}
