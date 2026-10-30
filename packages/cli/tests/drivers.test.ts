import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { SERVICES } from '../src/spec'
import { drivers } from '../src/translate/drivers'
import { type EngineOptions, buildBatches, parseOptions, resolveDriver, translateItems } from '../src/translate/engine'
import { decodeEntities, isIntact, protect, restore } from '../src/translate/protect'
import { type MockHandler, type MockRequest, type MockServer, json, startMock } from './harness'

let mock: MockServer
let respond: MockHandler = (_request, response) => json(response, {})

beforeAll(async () => {
  mock = await startMock((request, response) => respond(request, response))
})
afterAll(() => mock.close())
afterEach(() => {
  mock.requests.length = 0
  vi.unstubAllEnvs()
})

const config = (service: string, token: string, options: Record<string, string> = {}): EngineOptions => ({
  service,
  token,
  options: { baseUrl: mock.url, retries: '0', ...options },
  pluralSeparator: '|',
})

const translate = (service: string, token: string, options: Record<string, string> = {}, from = 'en', to = 'de') =>
  translateItems(
    [
      { key: 'a', text: 'Hello {name}' },
      { key: 'b', text: 'Bye' },
    ],
    from,
    to,
    config(service, token, options),
  )

const only = (): MockRequest => {
  expect(mock.requests).toHaveLength(1)
  return mock.requests[0]!
}

const bodyJson = (request: MockRequest): unknown => JSON.parse(request.text)
const bodyForm = (request: MockRequest): URLSearchParams => new URLSearchParams(request.text)

const MASKED = ['Hello <v0/>', 'Bye']
const TRANSLATED = ['Hallo <v0/>', 'Tschüss']
const EXPECTED = [
  { key: 'a', value: 'Hallo {name}' },
  { key: 'b', value: 'Tschüss' },
]

describe('translation services send the documented request', () => {
  it('google: POST v2 with the key in the query, html format', async () => {
    respond = (_req, res) => json(res, { data: { translations: TRANSLATED.map((translatedText) => ({ translatedText })) } })
    const result = await translate('google', 'g-key')
    const request = only()
    expect(request.method).toBe('POST')
    expect(request.url).toBe('/language/translate/v2?key=g-key')
    expect(bodyJson(request)).toEqual({ q: MASKED, target: 'de', source: 'en', format: 'html' })
    expect(result.translated).toEqual(EXPECTED)
  })

  it('google: decodes the entities HTML mode returns', async () => {
    respond = (_req, res) => json(res, { data: { translations: [{ translatedText: 'l&#39;ami <v0/>' }, { translatedText: 'x' }] } })
    const { translated } = await translate('google', 'k')
    expect(translated[0]).toEqual({ key: 'a', value: `l'ami {name}` })
    expect(decodeEntities('l&#39;ami &amp; co')).toBe(`l'ami & co`)
  })

  it('deepl: DeepL-Auth-Key header, array text, xml tag handling, regional target for en', async () => {
    respond = (_req, res) => json(res, { translations: TRANSLATED.map((text) => ({ text })) })
    const result = await translate('deepl', 'dl-key:fx', { formality: 'more' }, 'pt-BR', 'en')
    const request = only()
    expect(request.url).toBe('/v2/translate')
    expect(request.headers.authorization).toBe('DeepL-Auth-Key dl-key:fx')
    expect(bodyJson(request)).toEqual({ text: MASKED, source_lang: 'PT', target_lang: 'EN-US', tag_handling: 'xml', formality: 'more' })
    expect(result.translated).toEqual(EXPECTED)
  })

  it('deepl: pt and zh targets take the regional codes', async () => {
    const { targetLang } = resolveDriver('deepl')
    expect(targetLang?.('pt')).toBe('PT-PT')
    expect(targetLang?.('pt-br')).toBe('PT-BR')
    expect(targetLang?.('zh')).toBe('ZH-HANS')
    expect(targetLang?.('zh-TW')).toBe('ZH-HANT')
    expect(targetLang?.('de-DE')).toBe('DE')
    expect(targetLang?.('zh-CN')).toBe('ZH-HANS')
  })

  it('yandexcloud: REST v2, Api-Key auth, optional folder, bare language codes', async () => {
    respond = (_req, res) => json(res, { translations: TRANSLATED.map((text) => ({ text })) })
    const result = await translate('yandexcloud', 'y-key', {}, 'en-US', 'pt-BR')
    const request = only()
    expect(request.url).toBe('/translate/v2/translate')
    expect(request.headers.authorization).toBe('Api-Key y-key')
    expect(bodyJson(request)).toEqual({ texts: MASKED, sourceLanguageCode: 'en', targetLanguageCode: 'pt', format: 'HTML' })
    expect(result.translated).toEqual(EXPECTED)
  })

  it('yandexcloud: IAM tokens through authScheme', async () => {
    respond = (_req, res) => json(res, { translations: TRANSLATED.map((text) => ({ text })) })
    await translate('yandexcloud', 'iam', { authScheme: 'Bearer', folderId: 'f1' })
    const request = only()
    expect(request.headers.authorization).toBe('Bearer iam')
    expect(bodyJson(request)).toMatchObject({ folderId: 'f1' })
  })

  it('azure: api-version 3.0, html, subscription headers, Text elements', async () => {
    respond = (_req, res) =>
      json(
        res,
        TRANSLATED.map((text) => ({ translations: [{ text, to: 'de' }] })),
      )
    const result = await translate('azure', 'az-key', { region: 'westeurope' }, 'en', 'zh')
    const request = only()
    expect(request.url).toBe('/translate?api-version=3.0&from=en&to=zh-Hans&textType=html')
    expect(request.headers['ocp-apim-subscription-key']).toBe('az-key')
    expect(request.headers['ocp-apim-subscription-region']).toBe('westeurope')
    expect(bodyJson(request)).toEqual(MASKED.map((Text) => ({ Text })))
    expect(result.translated).toEqual(EXPECTED)
  })

  it('libretranslate: array q, html format, optional api_key', async () => {
    respond = (_req, res) => json(res, { translatedText: TRANSLATED })
    const result = await translate('libretranslate', '')
    expect(bodyJson(only())).toEqual({ q: MASKED, source: 'en', target: 'de', format: 'html' })
    expect(result.translated).toEqual(EXPECTED)
  })

  it('ai gateway: OpenAI-compatible request with a JSON schema, no temperature', async () => {
    respond = (_req, res) => json(res, { choices: [{ finish_reason: 'stop', message: { content: JSON.stringify({ translations: TRANSLATED }) } }] })
    const result = await translate('ai', 'gw-key', { provider: 'gateway' })
    const request = only()
    expect(request.url).toBe('/chat/completions')
    expect(request.headers.authorization).toBe('Bearer gw-key')
    const body = bodyJson(request) as Record<string, any>
    expect(body.model).toBe('anthropic/claude-sonnet-4.5')
    expect(body.temperature).toBeUndefined()
    expect(body.top_p).toBeUndefined()
    expect(body.response_format.type).toBe('json_schema')
    expect(body.messages[1]).toEqual({ role: 'user', content: JSON.stringify(MASKED) })
    expect(result.translated).toEqual(EXPECTED)
  })

  it('deepl: a :fx key goes to the free host', () => {
    const host = (token: string) =>
      resolveDriver('deepl')
        .translate({ texts: [], from: 'EN', to: 'DE', token, options: {}, http: { retries: 0, timeoutMs: 1 } })
        .catch((error: { details?: { URL?: string } }) => error.details?.URL)
    return expect(Promise.all([host('abc:fx'), host('abc')])).resolves.toEqual([
      'https://api-free.deepl.com/v2/translate',
      'https://api.deepl.com/v2/translate',
    ])
  })

  it('ai: a wrong number of answers is an error', async () => {
    respond = (_req, res) => json(res, { choices: [{ message: { content: JSON.stringify({ translations: ['only one'] }) } }] })
    await expect(translate('ai', 'k', { model: 'm' })).rejects.toThrow('expected 2 translations')
  })

  it('ai openai: strict schema; key from the environment; truncation is an error', async () => {
    vi.stubEnv('OPENAI_API_KEY', 'env-key')
    respond = (_req, res) => json(res, { choices: [{ finish_reason: 'stop', message: { content: JSON.stringify({ translations: TRANSLATED }) } }] })
    await translate('ai', '', { provider: 'openai', model: 'gpt-4o-mini' })
    const request = only()
    expect(request.headers.authorization).toBe('Bearer env-key')
    expect((bodyJson(request) as Record<string, any>).response_format.json_schema.strict).toBe(true)

    respond = (_req, res) => json(res, { choices: [{ finish_reason: 'length', message: { content: '{"tra' } }] })
    await expect(translate('ai', 'k', { provider: 'openai', model: 'm' })).rejects.toThrow('cut off')
  })

  it('ai anthropic: native messages API with output_config', async () => {
    respond = (_req, res) => json(res, { stop_reason: 'end_turn', content: [{ type: 'text', text: JSON.stringify({ translations: TRANSLATED }) }] })
    const result = await translate('ai', 'an-key', { provider: 'anthropic', model: 'claude-sonnet-4-5' })
    const request = only()
    expect(request.url).toBe('/messages')
    expect(request.headers['x-api-key']).toBe('an-key')
    expect(request.headers['anthropic-version']).toBe('2023-06-01')
    expect(bodyJson(request)).toMatchObject({ model: 'claude-sonnet-4-5', output_config: { format: { type: 'json_schema' } } })
    expect(result.translated).toEqual(EXPECTED)
  })

  it('ai: a custom OpenAI-compatible server needs only baseUrl and a model', async () => {
    respond = (_req, res) => json(res, { choices: [{ message: { content: JSON.stringify({ translations: TRANSLATED }) } }] })
    await expect(translate('ai', '', { model: 'local' })).resolves.toMatchObject({ translated: EXPECTED })
    await expect(translate('ai', '')).rejects.toThrow('needs a model')
  })
})

describe('engine', () => {
  it('splits by the service limit and keeps order', async () => {
    respond = (req, res) => json(res, { translatedText: (bodyJson(req) as { q: string[] }).q.map((text) => `de:${text}`) })
    const items = Array.from({ length: 5 }, (_, index) => ({ key: `k${index}`, text: `t${index}` }))
    const { translated } = await translateItems(items, 'en', 'de', { ...config('libretranslate', ''), chunkSize: 2 })
    expect(mock.requests.map((request) => (bodyJson(request) as { q: string[] }).q.length)).toEqual([2, 2, 1])
    expect(translated.map((item) => item.value)).toEqual(['de:t0', 'de:t1', 'de:t2', 'de:t3', 'de:t4'])
  })

  it('translates plural forms separately and rejoins them', async () => {
    respond = (req, res) =>
      json(res, { translatedText: (bodyJson(req) as { q: string[] }).q.map((text) => text.toUpperCase().replace('<V0/>', '<v0/>')) })
    const { translated } = await translateItems([{ key: 'p', text: 'no apples | {count} apples' }], 'en', 'de', config('libretranslate', ''))
    expect(bodyJson(only())).toMatchObject({ q: ['no apples', '<v0/> apples'] })
    expect(translated[0]?.value).toBe('NO APPLES | {count} APPLES')
  })

  it('rejects a translation that lost a placeholder instead of writing it', async () => {
    respond = (_req, res) => json(res, { translatedText: ['Hallo', 'Tschüss'] })
    const result = await translate('libretranslate', '')
    expect(result.rejected).toEqual(['a'])
    expect(result.translated).toEqual([{ key: 'b', value: 'Tschüss' }])
  })

  it('fails when a service returns the wrong number of strings', async () => {
    respond = (_req, res) => json(res, { translatedText: ['only one'] })
    await expect(translate('libretranslate', '')).rejects.toThrow('returned 1 translations for 2 strings')
  })

  it('retries 429 after the Retry-After delay, not its own', async () => {
    let calls = 0
    respond = (_req, res) => {
      calls += 1
      if (calls === 1) {
        res.statusCode = 429
        res.setHeader('retry-after', '1')
        res.end('{"error":"slow down"}')
        return
      }
      json(res, { translatedText: TRANSLATED })
    }
    const started = Date.now()
    await translate('libretranslate', '', { retries: '2', retryDelayMs: '1' })
    expect(mock.requests).toHaveLength(2)
    expect(Date.now() - started).toBeGreaterThanOrEqual(900)
  })

  it('respects the character limit of a service', async () => {
    respond = (request, res) => json(res, { translations: JSON.parse(request.text).text.map((text: string) => ({ text })) })
    const items = [
      { key: 'a', text: 'x'.repeat(60_000) },
      { key: 'b', text: 'y'.repeat(60_000) },
    ]
    await translateItems(items, 'en', 'de', config('deepl', 'k'))
    expect(mock.requests).toHaveLength(2)
  })

  it('--chunkSize caps below the service limit, never above it', async () => {
    respond = (request, res) => json(res, { translations: JSON.parse(request.text).text.map((text: string) => ({ text })) })
    const items = Array.from({ length: 3 }, (_item, index) => ({ key: `k${index}`, text: 'x' }))
    await translateItems(items, 'en', 'de', { ...config('deepl', 'k'), chunkSize: 2 })
    expect(mock.requests).toHaveLength(2)
    mock.requests.length = 0
    await translateItems(items, 'en', 'de', { ...config('deepl', 'k'), chunkSize: 1000 })
    expect(mock.requests).toHaveLength(1)
  })

  it('reports each batch as it lands', async () => {
    respond = (request, res) => json(res, { translatedText: JSON.parse(request.text).q.map((text: string) => `D ${text}`) })
    const seen: string[][] = []
    const items = ['a', 'b', 'c'].map((key) => ({ key, text: key }))
    const result = await translateItems(items, 'en', 'de', { ...config('libretranslate', ''), chunkSize: 2 }, {}, (batch) =>
      seen.push(batch.translated.map(({ key }) => key)),
    )
    expect(seen).toEqual([['a', 'b'], ['c']])
    expect(result.translated).toHaveLength(3)
  })

  it('names the services the spec lists, no more', () => {
    expect(Object.keys(drivers).sort()).toEqual([...SERVICES].sort())
  })

  it('never puts a key into an error', async () => {
    respond = (_req, res) => json(res, { error: { message: 'Bad key' } }, 400)
    const failure = (await translate('google', 'super-secret').catch((error: unknown) => error)) as { message: string; details: unknown }
    expect(JSON.stringify([failure.message, failure.details])).not.toContain('super-secret')
  })

  it('explains removed services and rejects unknown ones', () => {
    expect(() => resolveDriver('yandex')).toThrow('Use yandexcloud')
    expect(() => resolveDriver('ibm')).toThrow('removed')
    expect(() => resolveDriver('nope')).toThrow('Unsupported')
  })

  it('parses options with colons in the value', () => {
    expect(parseOptions('baseUrl:https://x.example:8080/a, appId:123')).toEqual({ baseUrl: 'https://x.example:8080/a', appId: '123' })
    expect(parseOptions(undefined)).toEqual({})
  })

  it('batches by count and by characters', () => {
    const size = (text: string) => text.length
    expect(buildBatches(['aa', 'bb', 'cc'], size, 2)).toEqual([['aa', 'bb'], ['cc']])
    expect(buildBatches(['aaa', 'bbb', 'c'], size, 10, 4)).toEqual([['aaa'], ['bbb', 'c']])
    expect(buildBatches(['oversized'], size, 10, 2)).toEqual([['oversized']])
  })
})

describe('placeholders', () => {
  it.each(['Hi {name}', 'Hi %{name}', 'Hi {{ name }}', 'a {x} b {y}'])('round-trips %s', (text) => {
    const { masked, tokens } = protect(text)
    expect(masked).not.toContain('{')
    expect(restore(masked, tokens)).toBe(text)
  })

  it('restores tags a service reformatted', () => {
    expect(restore('Hi < v0 / > and <v1></v1>', ['{a}', '{b}'])).toBe('Hi {a} and {b}')
  })

  it('a value with $ in a placeholder restores literally', () => {
    expect(restore('<v0/>', ['{$&}'])).toBe('{$&}')
  })

  it('isIntact sees lost and leftover placeholders', () => {
    expect(isIntact('Hi {a}', ['{a}'])).toBe(true)
    expect(isIntact('Hi', ['{a}'])).toBe(false)
    expect(isIntact('Hi <v0/>', [])).toBe(false)
  })
})
