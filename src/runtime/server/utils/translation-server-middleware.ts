import { BaseI18n, interpolate, localeIsoMap, resolveTranslation, translationCacheKey } from '@i18n-micro/core'
import type { ResolvedI18nConfig, TranslateParams, Translations } from '@i18n-micro/types'
import type { H3Event } from 'h3'
import { plural } from '#i18n-internal/plural'
import { formatterFor } from '../../utils/formatter'
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

/**
 * `BaseI18n` over the one dictionary the server helper loads: `tc`, `tn`, `td`, `tdr` and `has` answer
 * as on the page, with the build's plural rule and the config's shared formatters. No vue.
 * The dictionary is premerged (its fallback keys are in it), so the locale is its own fallback.
 */
class DictionaryI18n extends BaseI18n {
  constructor(
    private readonly locale: string,
    translations: Translations,
    config: ResolvedI18nConfig,
  ) {
    super({
      storage: { translations: new Map([[translationCacheKey(locale, 'index'), translations]]) },
      plural,
      formatter: formatterFor(config),
      missingWarn: false,
      localeIso: localeIsoMap(config.linkLocales ?? config.locales),
    })
  }

  getLocale(): string {
    return this.locale
  }

  getFallbackLocale(): string {
    return this.locale
  }

  getRoute(): string {
    return 'index'
  }
}

type Helpers = Pick<BaseI18n, 'tc' | 'tn' | 'td' | 'tdr' | 'has'>

export const useTranslationServerMiddleware = async (event: H3Event, defaultLocale?: string, currentLocale?: string) => {
  const config = getI18nServerConfig(event)
  const locale = currentLocale || getRequestLocale(event, config, defaultLocale)
  const translations = await dictionaryOf(event, locale)

  function t(key: string, params?: TranslateParams, defaultValue?: string): string {
    const value = resolveTranslation(translations, key)

    if (value === null) return defaultValue && params ? interpolate(defaultValue, params) : defaultValue || key

    const str = typeof value === 'string' ? value : String(value)
    return params ? interpolate(str, params) : str
  }

  // made on the first helper call: a route that only calls `t` pays for no instance
  let i18n: DictionaryI18n | undefined
  const own = () => (i18n ??= new DictionaryI18n(locale, translations, config))
  const helpers: Helpers = {
    tc: (...args) => own().tc(...args),
    tn: ((...args: Parameters<BaseI18n['tn']>) => own().tn(...args)) as BaseI18n['tn'],
    td: ((...args: Parameters<BaseI18n['td']>) => own().td(...args)) as BaseI18n['td'],
    tdr: (...args) => own().tdr(...args),
    has: (...args) => own().has(...args),
  }
  return Object.assign(t, helpers)
}

/** `t` of `useTranslationServerMiddleware`, with the page's `tc`, `tn`, `td`, `tdr` and `has`. */
export type ServerTranslate = Awaited<ReturnType<typeof useTranslationServerMiddleware>>
