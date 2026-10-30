// The plugin's `base` moves the dev-server endpoints; the iframe page and the bridge must call them there.
import type { ViteDevServer } from 'vite'
import { afterEach, expect, test, vi } from 'vitest'
import { i18nDevToolsPlugin } from '../vite/plugin'
import { createBridge } from '../src/bridge/create-bridge'

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

test('the devtools page calls the endpoints under the configured base', () => {
  const routes = new Map<string, (req: unknown, res: { end: (body: string) => void; setHeader: () => void }) => void>()
  const server = { config: { root: '/app' }, middlewares: { use: (route: string, handler: never) => routes.set(route, handler) } }
  const plugin = i18nDevToolsPlugin({ base: '/dev/i18n' }) as { configureServer: (server: ViteDevServer) => void }
  plugin.configureServer(server as unknown as ViteDevServer)

  expect([...routes.keys()].filter((route) => route.startsWith('/dev/i18n/'))).toEqual(['/dev/i18n/config', '/dev/i18n/files', '/dev/i18n/file', '/dev/i18n/save'])
  let html = ''
  routes.get('/__i18n_devtools.html')!({}, { setHeader: () => {}, end: (body) => (html = body) })
  expect(html).toContain('const API = "/dev/i18n";')
  expect(html).not.toContain('/__i18n_api')
})

test('the bridge saves to the configured base', async () => {
  vi.spyOn(console, 'log').mockImplementation(() => {})
  const fetchMock = vi.fn(async () => ({ ok: true, json: async () => ({}) }))
  vi.stubGlobal('fetch', fetchMock)
  const adapter = { getRouteCache: () => ({}), addTranslations: () => {}, addRouteTranslations: () => {}, subscribe: () => () => {} }

  await createBridge({ adapter, base: '/dev/i18n', translationDir: 'locales' }).saveTranslation('en.json', { hello: 'Hi' })
  await createBridge({ adapter, translationDir: 'locales' }).saveTranslation('en.json', { hello: 'Hi' })

  expect(fetchMock.mock.calls.map((call) => (call as unknown[])[0])).toEqual(['/dev/i18n/save', '/__i18n_api/save'])
})
