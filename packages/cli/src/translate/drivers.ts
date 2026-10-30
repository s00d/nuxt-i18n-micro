import { type RequestOptions, jsonBody, requestJson } from '../http'
import { decodeEntities } from './protect'
import { aiDriver } from './ai'

export type DriverOptions = Record<string, string>

export interface BatchRequest {
  texts: string[]
  from: string
  to: string
  token: string
  options: DriverOptions
  http: Pick<RequestOptions, 'retries' | 'retryDelayMs' | 'timeoutMs'>
}

export interface Driver {
  label: string
  /** Most strings one request may carry. */
  maxBatch: number
  /** Most characters one request may carry. */
  maxChars?: number
  /** Works without a key (free tier or a self-hosted server). */
  keyOptional?: boolean
  /** Language codes as the service spells them. */
  sourceLang?: (code: string) => string
  targetLang?: (code: string) => string
  translate(request: BatchRequest): Promise<string[]>
}

const base = (options: DriverOptions, fallback: string): string => (options.baseUrl ?? fallback).replace(/\/+$/, '')

const bareLanguage = (code: string): string => code.split(/[-_]/)[0]!.toLowerCase()

const fromTable =
  (table: Record<string, string>) =>
  (code: string): string =>
    table[code.toLowerCase()] ?? table[bareLanguage(code)] ?? bareLanguage(code)

const google: Driver = {
  label: 'Google Translate',
  maxBatch: 128,
  async translate({ texts, from, to, token, options, http }) {
    const url = `${base(options, 'https://translation.googleapis.com')}/language/translate/v2?key=${encodeURIComponent(token)}`
    const body = { q: texts, target: to, source: from, format: options.format ?? 'html', model: options.model }
    const data = await requestJson<{ data?: { translations?: Array<{ translatedText: string }> } }>(url, {
      method: 'POST',
      ...http,
      ...jsonBody(body),
    })
    return (data.data?.translations ?? []).map((item) => decodeEntities(item.translatedText))
  },
}

const DEEPL_TARGETS: Record<string, string> = {
  en: 'EN-US',
  'en-us': 'EN-US',
  'en-gb': 'EN-GB',
  es: 'ES',
  'es-419': 'ES-419',
  pt: 'PT-PT',
  'pt-pt': 'PT-PT',
  'pt-br': 'PT-BR',
  zh: 'ZH-HANS',
  'zh-cn': 'ZH-HANS',
  'zh-hans': 'ZH-HANS',
  'zh-tw': 'ZH-HANT',
  'zh-hant': 'ZH-HANT',
}

const deeplHost = (token: string): string => (token.endsWith(':fx') ? 'https://api-free.deepl.com' : 'https://api.deepl.com')

const deepl: Driver = {
  label: 'DeepL',
  maxBatch: 50,
  maxChars: 100_000,
  sourceLang: (code) => bareLanguage(code).toUpperCase(),
  targetLang: (code) => DEEPL_TARGETS[code.toLowerCase()] ?? bareLanguage(code).toUpperCase(),
  async translate({ texts, from, to, token, options, http }) {
    const body = {
      text: texts,
      source_lang: from,
      target_lang: to,
      tag_handling: options.tagHandling ?? 'xml',
      formality: options.formality,
      glossary_id: options.glossaryId,
      context: options.context,
      model_type: options.modelType,
    }
    const { headers, ...payload } = jsonBody(body)
    const data = await requestJson<{ translations: Array<{ text: string }> }>(`${base(options, deeplHost(token))}/v2/translate`, {
      method: 'POST',
      ...http,
      ...payload,
      headers: { ...headers, Authorization: `DeepL-Auth-Key ${token}` },
    })
    return data.translations.map((item) => item.text)
  },
}

const yandexcloud: Driver = {
  label: 'Yandex Cloud Translate',
  maxBatch: 100,
  maxChars: 10_000,
  sourceLang: bareLanguage,
  targetLang: bareLanguage,
  async translate({ texts, from, to, token, options, http }) {
    const scheme = options.authScheme ?? 'Api-Key'
    const { headers, ...payload } = jsonBody({
      texts,
      sourceLanguageCode: from,
      targetLanguageCode: to,
      format: 'HTML',
      folderId: options.folderId,
      model: options.model,
    })
    const data = await requestJson<{ translations?: Array<{ text?: string }> }>(
      `${base(options, 'https://translate.api.cloud.yandex.net')}/translate/v2/translate`,
      {
        method: 'POST',
        ...http,
        ...payload,
        headers: { ...headers, Authorization: `${scheme} ${token}` },
      },
    )
    return (data.translations ?? []).map((item) => item.text ?? '')
  },
}

const azureLang = fromTable({ zh: 'zh-Hans', 'zh-cn': 'zh-Hans', 'zh-tw': 'zh-Hant', 'zh-hant': 'zh-Hant', 'pt-br': 'pt', 'pt-pt': 'pt-pt' })

const azure: Driver = {
  label: 'Azure Translator',
  maxBatch: 1000,
  maxChars: 50_000,
  sourceLang: azureLang,
  targetLang: azureLang,
  async translate({ texts, from, to, token, options, http }) {
    const query = new URLSearchParams({ 'api-version': '3.0', from, to, textType: 'html' })
    const { headers, ...payload } = jsonBody(texts.map((text) => ({ Text: text })))
    const auth: Record<string, string> = { 'Ocp-Apim-Subscription-Key': token }
    if (options.region) auth['Ocp-Apim-Subscription-Region'] = options.region
    const data = await requestJson<Array<{ translations: Array<{ text: string }> }>>(
      `${base(options, 'https://api.cognitive.microsofttranslator.com')}/translate?${query}`,
      { method: 'POST', ...http, ...payload, headers: { ...headers, ...auth } },
    )
    return data.map((item) => item.translations[0]?.text ?? '')
  },
}

const libretranslate: Driver = {
  label: 'LibreTranslate',
  maxBatch: 100,
  keyOptional: true,
  async translate({ texts, from, to, token, options, http }) {
    const body = { q: texts, source: from, target: to, format: 'html', api_key: token || undefined }
    const data = await requestJson<{ translatedText: string[] | string }>(`${base(options, 'https://libretranslate.com')}/translate`, {
      method: 'POST',
      ...http,
      ...jsonBody(body),
    })
    return [data.translatedText].flat()
  },
}

export const drivers: Record<string, Driver> = {
  ai: aiDriver,
  azure,
  deepl,
  google,
  libretranslate,
  yandexcloud,
}

/** Services the old `nuxt-i18n-micro-cli` had: each name fails with the reason it is gone. */
export const removedServices: Record<string, string> = {
  googlefree: 'it used an undocumented endpoint. Use libretranslate for free translation.',
  yandex: 'Yandex closed the v1.5 API. Use yandexcloud.',
  ibm: 'IBM withdrew Watson Language Translator in 2024.',
  lingvatranslate: 'public instances return the source text unchanged. Use libretranslate.',
  modernmt: 'ModernMT sunsets on 2026-12-31.',
  lilt: 'its API needs a translation memory per language pair, which this CLI has no model for.',
  unbabel: 'its public API no longer answers.',
  reverso: 'the unofficial endpoint is blocked.',
  baidu: 'it was dropped from the CLI. Use ai, deepl, google or azure.',
  papago: 'it was dropped from the CLI. Use ai, deepl, google or azure.',
  tencent: 'it was dropped from the CLI. Use ai, deepl, google or azure.',
  systran: 'it was dropped from the CLI. Use ai, deepl, google or azure.',
  mymemory: 'its 500-character limit and missing markup mode break placeholders. Use libretranslate for free translation.',
}
