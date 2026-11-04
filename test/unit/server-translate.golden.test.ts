/**
 * Characterization of the `t` that `useTranslationServerMiddleware` returns: every call is one
 * `call → result` line in `__golden__/server-translate.md`, so a change shows up as a one-line diff.
 */
import { createEvent, type H3Event } from 'h3'
import { IncomingMessage, ServerResponse } from 'node:http'
import { Socket } from 'node:net'
import { expect, test, vi } from 'vitest'

const state = vi.hoisted(() => ({
  config: {
    locales: [{ code: 'en', iso: 'en-US' }, { code: 'ru' }],
    defaultLocale: 'en',
    apiBaseUrl: '_locales',
    dateBuild: 'hash',
    numberFormats: { en: { currency: { style: 'currency', currency: 'USD' } } },
    datetimeFormats: { en: { short: { year: 'numeric', month: 'short', day: 'numeric' } } },
    timeZone: 'UTC',
  } as Record<string, unknown>,
}))

const DICTIONARIES: Record<string, Record<string, unknown>> = {
  en: {
    hello: 'Hello',
    greet: 'Hi {name}',
    nested: { a: 'A', deep: { b: 'B {x}' } },
    apples: 'no apples | one apple | {count} apples',
    cars: 'car | cars',
    number: 5,
    flag: true,
    empty: '',
    list: ['x', 'y'],
    'dotted.key': 'flat dotted',
    unicode: 'Привет, {name} 👋',
  },
  ru: { apples: 'нет яблок | {count} яблоко | {count} яблока | {count} яблок' },
}

vi.mock('../../src/runtime/server/utils/server-loader', () => ({
  loadTranslationsFromServer: async (locale: string) => ({ data: DICTIONARIES[locale] ?? {}, json: '' }),
  NO_FILE: { data: {}, json: '{}' },
  resolveServerHost: () => undefined,
}))
vi.mock('../../src/runtime/server/utils/locale-detector', () => ({
  getI18nServerConfig: () => state.config,
  getRequestLocale: () => 'en',
  detectRequestLocale: () => 'en',
}))
vi.mock('nitropack/runtime', () => ({ useRuntimeConfig: () => ({ app: { baseURL: '/' }, public: {} }) }))

function event(): H3Event {
  const req = new IncomingMessage(new Socket())
  req.url = '/api/x'
  req.method = 'GET'
  req.headers.host = 'localhost'
  return createEvent(req, new ServerResponse(req))
}

const show = (value: unknown) => (value === undefined ? 'undefined' : JSON.stringify(value))

test('server t characterization', async () => {
  const { useTranslationServerMiddleware } = await import('../../src/runtime/server/utils/translation-server-middleware')
  const t = await useTranslationServerMiddleware(event())
  const calls: [string, unknown[]][] = [
    ['hello', []],
    ['greet', [{ name: 'Ann' }]],
    ['greet', []],
    ['nested.a', []],
    ['nested.deep.b', [{ x: 1 }]],
    ['nested', []],
    ['nested.deep', [{ x: 1 }]],
    ['apples', [{ count: 2 }]],
    ['number', []],
    ['flag', []],
    ['empty', []],
    ['empty', [undefined, 'D']],
    ['list', []],
    ['list.0', []],
    ['dotted.key', []],
    ['unicode', [{ name: 'Аня' }]],
    ['miss', []],
    ['miss', [undefined, 'Default']],
    ['miss', [{ n: 1 }, 'D {n}']],
    ['miss', [{ n: 1 }]],
    ['miss', [undefined, '']],
    ['', []],
    ['', [undefined, 'D']],
    ['__proto__', []],
    ['constructor', []],
    ['hello.toString', []],
    ['nested.__proto__', []],
  ]
  const lines = calls.map(([key, args]) => {
    let out: string
    try {
      out = show((t as (...a: unknown[]) => unknown)(key, ...args))
    } catch (error) {
      out = `throws ${(error as Error).name}: ${(error as Error).message}`
    }
    return `- \`t(${[show(key), ...args.map(show)].join(', ')})\` → ${out}`
  })
  await expect(`${lines.join('\n')}\n`).toMatchFileSnapshot('./__golden__/server-translate.md')
})
