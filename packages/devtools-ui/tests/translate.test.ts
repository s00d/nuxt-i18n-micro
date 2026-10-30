import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { flattenTranslations, unflattenTranslations } from '../src/util/i18nUtils'
import { type DriverType, Translator } from '../src/util/Translator'

interface Sent {
  url: string
  init?: RequestInit
}

/** One fake translation API: records the request and answers with `reply(text)`. */
function translationApi(reply: (sent: Sent) => unknown) {
  const sent: Sent[] = []
  vi.stubGlobal('fetch', async (url: string, init?: RequestInit) => {
    sent.push({ url, init })
    return { json: async () => reply(sent.at(-1)!) }
  })
  return sent
}

const query = (s: Sent) => Object.fromEntries(new URL(s.url).searchParams)
const form = (s: Sent) => Object.fromEntries(new URLSearchParams(s.init!.body as string))
const json = (s: Sent) => JSON.parse(s.init!.body as string)

beforeEach(() => {
  vi.spyOn(console, 'debug').mockImplementation(() => {})
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

test('editor round trip: a nested file flattens to dotted keys for the table and back to the same file', () => {
  const file = {
    title: 'Shop',
    nav: { home: 'Home', cart: { empty: 'Empty', count: 3 } },
    flags: { beta: true, legacy: false },
    blank: '',
    spaced: ' ',
    nothing: null,
    rows: [{ label: 'One' }, { label: 'Two', hint: 'Second' }],
  }
  const flat = flattenTranslations(file)
  expect(flat).toEqual({
    title: 'Shop',
    'nav.home': 'Home',
    'nav.cart.empty': 'Empty',
    'nav.cart.count': '3',
    'flags.beta': 'true',
    'flags.legacy': 'false',
    blank: '',
    spaced: ' ',
    nothing: '',
    'rows.[]0.label': 'One',
    'rows.[]1.label': 'Two',
    'rows.[]1.hint': 'Second',
  })
  // Inherited keys are not translations.
  expect(flattenTranslations(Object.create({ inherited: 'x' }))).toEqual({})

  // Saving the edited table restores numbers and booleans, keeps blank strings as strings.
  flat['nav.cart.empty'] = 'Leer'
  flat['rows.[]2.label'] = 'Three'
  expect(unflattenTranslations(flat)).toEqual({
    title: 'Shop',
    nav: { home: 'Home', cart: { empty: 'Leer', count: 3 } },
    flags: { beta: true, legacy: false },
    blank: '',
    spaced: ' ',
    nothing: '',
    rows: [{ label: 'One' }, { label: 'Two', hint: 'Second' }, { label: 'Three' }],
  })

  // Malformed keys from hand edits: empty segments are skipped, an index past the end leaves a hole.
  expect(unflattenTranslations({ 'a..b': 'x', '.lead': 'y', 'list.[]1.name': 'z' })).toEqual({
    a: { b: 'x' },
    lead: 'y',
    list: [undefined, { name: 'z' }],
  })
})

test('translate missing keys: the default-locale file fills the gaps of the selected file through google-free', async () => {
  const sent = translationApi((s) => [[[`DE(${query(s).q})`, query(s).q]]])
  const english = { title: 'Welcome', nav: { home: 'Home', help: 'Help' }, rows: [{ label: ':count items' }] }
  const german = { title: 'Willkommen', nav: { home: '' } }

  // The same steps as I18nView.translateMissingKeys.
  const defaults = flattenTranslations(english)
  const current = flattenTranslations(german)
  const missing = Object.keys(defaults).filter((key) => !current[key])
  expect(missing).toEqual(['nav.home', 'nav.help', 'rows.[]0.label'])
  const translator = new Translator({ apiKey: '', driver: 'google-free' })
  for (const key of missing) current[key] = await translator.translate(defaults[key]!, 'en', 'de')

  // Placeholders never reach the API: they travel as markers and come back verbatim.
  expect(sent.map((s) => query(s).q)).toEqual(['Home', 'Help', ' _r0_ items'])
  expect(unflattenTranslations(current)).toEqual({
    title: 'Willkommen',
    nav: { home: 'DE(Home)', help: 'DE(Help)' },
    rows: [{ label: 'DE( :count items)' }],
  })
  expect(query(sent[0]!)).toMatchObject({ client: 'gtx', sl: 'en', tl: 'de', hl: 'en', dt: 't', ie: 'UTF-8', oe: 'UTF-8' })
  expect(sent[0]!.url.startsWith('https://translate.google.com/translate_a/single?')).toBe(true)
  expect(sent.map((s) => query(s).tk)).toEqual(['754895.754895', '57935.57935', '134671.134671'])
  expect(await translator.translate('Привет 世界', 'ru', 'en')).toBe('DE(Привет 世界)')
  expect(query(sent.at(-1)!).tk).toBe('178063.178063')

  // Nothing to translate: no request. A broken answer is an error, not an empty string.
  expect(await translator.translate('', 'en', 'de')).toBe('')
  expect(sent).toHaveLength(4)
  translationApi(() => ({ error: 'blocked' }))
  await expect(translator.translate('Hi', 'en', 'de')).rejects.toThrow('Invalid response from Google Free Translate')
  translationApi(() => null)
  await expect(translator.translate('Hi', 'en', 'de')).rejects.toThrow('Invalid response from Google Free Translate')
  translationApi(() => [
    [
      ['Hal', 'x'],
      [null, 'y'],
      ['lo', 'z'],
    ],
  ])
  expect(await translator.translate('Hello', 'en', 'de')).toBe('Hallo')
})

test('paid drivers send the API key and text the way each provider expects, and surface its error', async () => {
  const cases: Array<{
    driver: DriverType
    options?: Record<string, string>
    ok: unknown
    fail: unknown
    error: string
    check: (s: Sent) => void
  }> = [
    {
      driver: 'google',
      ok: { data: { translations: [{ translatedText: 'Hallo <b>Welt</b>' }] } },
      fail: { error: { message: 'bad key' } },
      error: 'Google Translate error: bad key',
      check: (s) => {
        expect(s.url.startsWith('https://translation.googleapis.com/language/translate/v2?')).toBe(true)
        expect(query(s)).toEqual({ q: 'Hello  _r0_World _r1_', target: 'de', key: 'KEY', format: 'text', source: 'en' })
      },
    },
    {
      driver: 'yandex',
      options: { folderId: 'f1' },
      ok: { translations: [{ text: 'Hallo <b>Welt</b>' }] },
      fail: { message: 'quota' },
      error: 'Yandex Translate error: quota',
      check: (s) => {
        expect(s.url).toBe('https://translate.api.cloud.yandex.net/translate/v2/translate')
        expect(s.init).toMatchObject({ method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Api-Key KEY' } })
        expect(json(s)).toEqual({ folderId: 'f1', texts: ['Hello  _r0_World _r1_'], sourceLanguageCode: 'en', targetLanguageCode: 'de' })
      },
    },
    {
      driver: 'yandex-cloud',
      options: { folderId: 'f2' },
      ok: { translations: [{ text: 'Hallo <b>Welt</b>' }] },
      fail: { message: 'denied' },
      error: 'Yandex Cloud Translate error: denied',
      check: (s) => {
        expect(s.url).toBe('https://translate.api.cloud.yandex.net/translate/v2/translate')
        expect(s.init).toMatchObject({ method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Api-Key KEY' } })
        expect(json(s)).toEqual({ folderId: 'f2', texts: ['Hello  _r0_World _r1_'], sourceLanguageCode: 'en', targetLanguageCode: 'de' })
      },
    },
    {
      driver: 'deepl',
      ok: { translations: [{ text: 'Hallo <b>Welt</b>' }] },
      fail: { message: 'wrong lang' },
      error: 'DeepL Translate error: wrong lang',
      check: (s) => {
        expect(s.url).toBe('https://api.deepl.com/v2/translate')
        expect(s.init).toMatchObject({ method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })
        expect(form(s)).toEqual({ auth_key: 'KEY', text: 'Hello  _r0_World _r1_', target_lang: 'DE', source_lang: 'EN' })
      },
    },
    ...(['openai', 'deepseek'] as const).map((driver) => ({
      driver,
      options: { model: 'm-1' },
      ok: { choices: [{ message: { content: 'Hallo <b>Welt</b>' } }] },
      fail: { error: { message: 'rate limit' } },
      error: `${driver === 'openai' ? 'OpenAI' : 'DeepSeek'} Translate error: rate limit`,
      check: (s: Sent) => {
        expect(s.url).toBe(driver === 'openai' ? 'https://api.openai.com/v1/chat/completions' : 'https://api.deepseek.com/chat/completions')
        expect(s.init).toMatchObject({ method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer KEY' } })
        // LLM drivers get the raw text with an instruction to keep placeholders.
        expect(json(s)).toEqual({
          model: 'm-1',
          messages: [
            {
              role: 'system',
              content: 'Translate the following text from en to de. Do not modify or translate placeholders like :placeholder, <tag>, or {special}.',
            },
            { role: 'user', content: 'Hello <b>World</b>' },
          ],
          ...(driver === 'deepseek' ? { stream: false } : {}),
        })
      },
    })),
  ]

  for (const c of cases) {
    const sent = translationApi(() => c.ok)
    const translator = new Translator({ apiKey: 'KEY', driver: c.driver, options: c.options })
    expect(await translator.translate('Hello <b>World</b>', 'en', 'de')).toBe('Hallo <b>Welt</b>')
    c.check(sent[0]!)
    translationApi(() => c.fail)
    await expect(translator.translate('Hello', 'en', 'de')).rejects.toThrow(c.error)
  }

  // Markers come back from a provider that keeps them; the extra spacing around them is cleaned.
  translationApi(() => ({ translations: [{ text: ' _r0_&nbsp;Artikel' }] }))
  expect(await new Translator({ apiKey: 'KEY', driver: 'deepl' }).translate("{'@'} items", 'en', 'de')).toBe("{'@'} Artikel")

  expect(() => new Translator({ apiKey: 'KEY', driver: 'yandex-cloud' })).toThrow('Yandex Cloud Translator requires folderId in options.')
  await expect(new Translator({ apiKey: 'KEY', driver: 'bing' as DriverType }).translate('Hi', 'en', 'de')).rejects.toThrow(
    'Unsupported driver: bing',
  )
})
