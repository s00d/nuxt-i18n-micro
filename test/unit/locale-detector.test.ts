import { createEvent } from 'h3'
import { IncomingMessage, ServerResponse } from 'node:http'
import { Socket } from 'node:net'
import { expect, test, vi } from 'vitest'
import { detectCurrentLocale, getI18nServerConfig } from '../../src/runtime/server/utils/locale-detector'

const { useRuntimeConfig } = vi.hoisted(() => ({ useRuntimeConfig: vi.fn((_event?: unknown) => ({ app: { baseURL: '/' }, public: {} })) }))
vi.mock('nitropack/runtime', () => ({ useRuntimeConfig }))
vi.mock('#imports', () => ({ getI18nConfig: () => ({}), domains: null }))

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

test('a request reads the shared runtime config: the per-event form clones it and walks the env, for nothing here', () => {
  useRuntimeConfig.mockClear()
  const event = request('/de/x')
  getI18nServerConfig(event)
  expect(detectCurrentLocale(event, config)).toBe('de')
  expect(useRuntimeConfig).toHaveBeenCalled()
  for (const call of useRuntimeConfig.mock.calls) expect(call[0]).toBeUndefined()
})
