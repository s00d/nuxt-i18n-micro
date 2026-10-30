import { createHash, createHmac } from 'node:crypto'
import { usageError } from '../errors'
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

const baiduLang = fromTable({
  ja: 'jp',
  ko: 'kor',
  fr: 'fra',
  es: 'spa',
  ar: 'ara',
  vi: 'vie',
  sv: 'swe',
  fi: 'fin',
  da: 'dan',
  ro: 'rom',
  bg: 'bul',
  'zh-tw': 'cht',
  'zh-hant': 'cht',
})

const splitCredentials = (token: string, id: string | undefined, label: string, field: string): [id: string, secret: string] => {
  if (id) return [id, token]
  const [first, ...rest] = token.split(':')
  if (first && rest.length > 0) return [first, rest.join(':')]
  throw usageError(`${label} needs an id and a secret.`, [`Pass --token <secret> --options ${field}:<id>, or --token <id>:<secret>.`])
}

const baidu: Driver = {
  label: 'Baidu Translate',
  maxBatch: 1,
  maxChars: 6000,
  sourceLang: baiduLang,
  targetLang: baiduLang,
  async translate({ texts, from, to, token, options, http }) {
    const [appId, secret] = splitCredentials(token, options.appId, 'Baidu Translate', 'appId')
    const text = texts[0] ?? ''
    const salt = options.salt ?? String(Date.now())
    const sign = createHash('md5').update(`${appId}${text}${salt}${secret}`).digest('hex')
    const form = new URLSearchParams({ q: text, from, to, appid: appId, salt, sign })
    const data = await requestJson<{ trans_result?: Array<{ dst: string }>; error_code?: string; error_msg?: string }>(
      `${base(options, 'https://fanyi-api.baidu.com')}/api/trans/vip/translate`,
      { method: 'POST', ...http, body: form, headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
    )
    // Failures arrive as HTTP 200 with an error code in the body.
    if (data.error_code && data.error_code !== '52000') throw usageError(`Baidu Translate: ${data.error_msg} (${data.error_code})`)
    // One entry per line of the input.
    return [(data.trans_result ?? []).map((item) => item.dst).join('\n')]
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

const mymemory: Driver = {
  label: 'MyMemory',
  maxBatch: 1,
  maxChars: 500,
  keyOptional: true,
  async translate({ texts, from, to, token, options, http }) {
    const query = new URLSearchParams({ q: texts[0] ?? '', langpair: `${from}|${to}` })
    if (token) query.set('key', token)
    if (options.email) query.set('de', options.email)
    const url = `${base(options, 'https://api.mymemory.translated.net')}/get?${query}`
    const data = await requestJson<{ responseData: { translatedText: string }; responseStatus: number | string; responseDetails?: string }>(url, http)
    if (Number(data.responseStatus) !== 200) throw usageError(`MyMemory: ${data.responseDetails ?? data.responseStatus}`)
    return [data.responseData.translatedText]
  },
}

const papagoLang = fromTable({ zh: 'zh-CN', 'zh-cn': 'zh-CN', 'zh-tw': 'zh-TW', 'zh-hant': 'zh-TW' })

const papago: Driver = {
  label: 'Papago',
  maxBatch: 1,
  maxChars: 5000,
  sourceLang: papagoLang,
  targetLang: papagoLang,
  async translate({ texts, from, to, token, options, http }) {
    const [keyId, key] = splitCredentials(token, options.clientId, 'Papago', 'clientId')
    const { headers, ...payload } = jsonBody({ source: from, target: to, text: texts[0] })
    const data = await requestJson<{ message?: { result?: { translatedText?: string } } }>(
      `${base(options, 'https://papago.apigw.ntruss.com')}/nmt/v1/translation`,
      {
        method: 'POST',
        ...http,
        ...payload,
        headers: { ...headers, 'X-NCP-APIGW-API-KEY-ID': keyId, 'X-NCP-APIGW-API-KEY': key },
      },
    )
    return [data.message?.result?.translatedText ?? '']
  },
}

const sha256 = (text: string): string => createHash('sha256').update(text).digest('hex')
const hmac = (key: string | Buffer, text: string): Buffer => createHmac('sha256', key).update(text).digest()

/**
 * Tencent Cloud TC3-HMAC-SHA256.
 *
 * The derived keys are raw digests; only the final signature is hex. Hex at any earlier step
 * gives a well-formed signature the server rejects.
 */
export function signTc3(input: { host: string; payload: string; timestamp: number; service: string; secretId: string; secretKey: string }): string {
  const { host, payload, timestamp, service, secretId, secretKey } = input
  const date = new Date(timestamp * 1000).toISOString().slice(0, 10)
  const signedHeaders = 'content-type;host'
  const canonical = ['POST', '/', '', `content-type:application/json\nhost:${host}\n`, signedHeaders, sha256(payload)].join('\n')
  const scope = `${date}/${service}/tc3_request`
  const toSign = ['TC3-HMAC-SHA256', String(timestamp), scope, sha256(canonical)].join('\n')
  const signingKey = hmac(hmac(hmac(`TC3${secretKey}`, date), service), 'tc3_request')
  const signature = createHmac('sha256', signingKey).update(toSign).digest('hex')
  return `TC3-HMAC-SHA256 Credential=${secretId}/${scope}, SignedHeaders=${signedHeaders}, Signature=${signature}`
}

const tencent: Driver = {
  label: 'Tencent TMT',
  maxBatch: 50,
  maxChars: 5000,
  sourceLang: fromTable({ 'zh-tw': 'zh-TW', 'zh-hant': 'zh-TW' }),
  targetLang: fromTable({ 'zh-tw': 'zh-TW', 'zh-hant': 'zh-TW' }),
  async translate({ texts, from, to, token, options, http }) {
    const [secretId, secretKey] = splitCredentials(token, options.secretId, 'Tencent TMT', 'secretId')
    const url = base(options, 'https://tmt.tencentcloudapi.com')
    const payload = JSON.stringify({ SourceTextList: texts, Source: from, Target: to, ProjectId: 0 })
    const timestamp = Math.floor(Date.now() / 1000)
    const authorization = signTc3({ host: new URL(url).host, payload, timestamp, service: 'tmt', secretId, secretKey })
    const data = await requestJson<{ Response?: { TargetTextList?: string[]; Error?: { Code?: string; Message?: string } } }>(`${url}/`, {
      method: 'POST',
      ...http,
      body: payload,
      headers: {
        Authorization: authorization,
        'Content-Type': 'application/json',
        'X-TC-Action': 'TextTranslateBatch',
        'X-TC-Version': '2018-03-21',
        'X-TC-Timestamp': String(timestamp),
        'X-TC-Region': options.region ?? 'ap-guangzhou',
      },
    })
    const failure = data.Response?.Error
    if (failure) throw usageError(`Tencent TMT: ${failure.Message} (${failure.Code})`)
    return data.Response?.TargetTextList ?? []
  },
}

const systran: Driver = {
  label: 'Systran',
  maxBatch: 100,
  async translate({ texts, from, to, token, options, http }) {
    const form = new URLSearchParams({ source: from, target: to, format: 'text/html' })
    for (const text of texts) form.append('input', text)
    const data = await requestJson<{ outputs?: Array<{ output?: string; error?: string }> }>(
      `${base(options, 'https://api-translate.systran.net')}/translation/text/translate`,
      { method: 'POST', ...http, body: form, headers: { Authorization: `Key ${token}`, 'Content-Type': 'application/x-www-form-urlencoded' } },
    )
    const failed = data.outputs?.find((item) => item.error)
    if (failed) throw usageError(`Systran: ${failed.error}`)
    return (data.outputs ?? []).map((item) => item.output ?? '')
  },
}

export const drivers: Record<string, Driver> = {
  ai: aiDriver,
  azure,
  baidu,
  deepl,
  google,
  libretranslate,
  mymemory,
  papago,
  systran,
  tencent,
  yandexcloud,
}

/** Services the old `nuxt-i18n-micro-cli` had: each name fails with the reason it is gone. */
export const removedServices: Record<string, string> = {
  googlefree: 'it used an undocumented endpoint. Use mymemory or libretranslate for free translation.',
  yandex: 'Yandex closed the v1.5 API. Use yandexcloud.',
  ibm: 'IBM withdrew Watson Language Translator in 2024.',
  lingvatranslate: 'public instances return the source text unchanged. Use libretranslate.',
  modernmt: 'ModernMT sunsets on 2026-12-31.',
  lilt: 'its API needs a translation memory per language pair, which this CLI has no model for.',
  unbabel: 'its public API no longer answers.',
  reverso: 'the unofficial endpoint is blocked.',
}
