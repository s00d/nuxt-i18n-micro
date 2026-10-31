import { createEvent } from 'h3'
import { IncomingMessage, ServerResponse } from 'node:http'
import { Socket } from 'node:net'
import { expect, test, vi } from 'vitest'
import { detectCurrentLocale } from '../../src/runtime/server/utils/locale-detector'

vi.mock('#imports', () => ({ useRuntimeConfig: () => ({ app: { baseURL: '/' }, public: {} }) }))

function request(url: string, headers: Record<string, string> = {}) {
  const req = new IncomingMessage(new Socket())
  req.url = url
  req.headers = { host: 'localhost', ...headers }
  return createEvent(req, new ServerResponse(req))
}

const config = { locales: [{ code: 'en' }, { code: 'de' }], defaultLocale: 'en', localeCookie: 'user-locale' }

test('detectCurrentLocale, still auto-imported, keeps the api order: query, prefix, cookie, default', () => {
  expect(detectCurrentLocale(request('/api/x?locale=de', { cookie: 'user-locale=en' }), config)).toBe('de')
  expect(detectCurrentLocale(request('/de/api/x'), config)).toBe('de')
  expect(detectCurrentLocale(request('/api/x', { cookie: 'user-locale=de' }), config)).toBe('de')
  expect(detectCurrentLocale(request('/api/x'), config)).toBe('en')
})

test('detectCurrentLocale: its third argument overrides the default locale', () => {
  expect(detectCurrentLocale(request('/api/x'), config, 'de')).toBe('de')
})
