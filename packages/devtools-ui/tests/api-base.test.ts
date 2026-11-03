// The plugin's `base` moves the dev-server endpoints; the iframe page and the bridge must call them there.
import type { ViteDevServer } from 'vite'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { i18nDevToolsPlugin } from '../vite/plugin'
import { createBridge } from '../src/bridge/create-bridge'

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

test('the devtools page calls the endpoints under the configured base', () => {
  const routes = new Map<string, (req: unknown, res: { end: (body: string) => void; setHeader: () => void }) => void>()
  const server = {
    config: { root: '/app' },
    watcher: {
      add: () => {},
      on() {
        return this
      },
    },
    ws: { send: () => {} },
    middlewares: { use: (route: string, handler: never) => routes.set(route, handler) },
  }
  const plugin = i18nDevToolsPlugin({ base: '/dev/i18n' }) as { configureServer: (server: ViteDevServer) => void; load: (id: string) => string }
  plugin.configureServer(server as unknown as ViteDevServer)

  expect([...routes.keys()].filter((route) => route.startsWith('/dev/i18n/'))).toEqual([
    '/dev/i18n/config',
    '/dev/i18n/translations',
    '/dev/i18n/save',
  ])
  const app = plugin.load('/@vite-plugin-i18n-devtools/app.js')
  expect(app).toContain('const API = "/dev/i18n"')
  expect(app).not.toContain('/__i18n_api')
})

test("base '/' puts the endpoints at the root, never at a protocol-relative `//files`", async () => {
  const routes = new Map<string, (req: unknown, res: { end: (body: string) => void; setHeader: () => void }) => void>()
  const server = {
    config: { root: '/app' },
    watcher: {
      add: () => {},
      on() {
        return this
      },
    },
    ws: { send: () => {} },
    middlewares: { use: (route: string, handler: never) => routes.set(route, handler) },
  }
  const plugin = i18nDevToolsPlugin({ base: '/' }) as { configureServer: (server: ViteDevServer) => void; load: (id: string) => string }
  plugin.configureServer(server as unknown as ViteDevServer)

  expect([...routes.keys()].filter((route) => route !== '/__i18n_devtools.html')).toEqual(['/config', '/translations', '/save'])
  expect(plugin.load('/@vite-plugin-i18n-devtools/app.js')).toContain('const API = ""')

  vi.spyOn(console, 'log').mockImplementation(() => {})
  const fetchMock = vi.fn(async () => ({ ok: true, json: async () => ({}) }))
  vi.stubGlobal('fetch', fetchMock)
  const adapter = { getRouteCache: () => ({}), addTranslations: () => {}, addRouteTranslations: () => {}, subscribe: () => () => {} }
  await createBridge({ adapter, base: '/', translationDir: 'locales' }).saveTranslation('en.json', { hello: 'Hi' })
  expect((fetchMock.mock.calls[0] as unknown[])[0]).toBe('/save')
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

describe('saves of one chunk', () => {
  /** A bridge over a real cache; every fetch waits until the test answers it, newest first. */
  function savingBridge() {
    vi.spyOn(console, 'log').mockImplementation(() => {})
    const cache: Record<string, unknown> = { 'en:index': { hello: 'orig' } }
    const adapter = {
      getRouteCache: () => cache,
      addTranslations: (locale: string, content: unknown) => void (cache[`${locale}:index`] = content),
      addRouteTranslations: () => {},
      subscribe: () => () => {},
    }
    const pending: Array<(response: unknown) => void> = []
    vi.stubGlobal('fetch', () => new Promise((resolve) => pending.push(resolve)))
    const answer = async (response: unknown) => {
      await vi.waitFor(() => expect(pending.length).toBeGreaterThan(0))
      pending.pop()!(response)
    }
    return { cache, answer, bridge: createBridge({ adapter, translationDir: 'locales' }) }
  }
  const ok = { ok: true, json: async () => ({}) }
  const failed = { ok: false, status: 500, statusText: 'Server Error', json: async () => ({ error: 'disk full' }) }

  test('an older save that fails does not roll a newer edit back', async () => {
    const { cache, answer, bridge } = savingBridge()
    const first = bridge.saveTranslation('en.json', { hello: 'edit1' })
    const second = bridge.saveTranslation('en.json', { hello: 'edit2' })

    await answer(failed)
    await expect(first).rejects.toThrow('disk full')
    expect(cache['en:index']).toEqual({ hello: 'edit2' })
    await answer(ok)
    await second
    expect(cache['en:index']).toEqual({ hello: 'edit2' })
  })

  test('when both fail, the newer one answered first or not, the pre-edit state comes back', async () => {
    const { cache, answer, bridge } = savingBridge()
    const first = bridge.saveTranslation('en.json', { hello: 'edit1' })
    const second = bridge.saveTranslation('en.json', { hello: 'edit2' })
    const results = Promise.allSettled([first, second])

    await new Promise((resolve) => setTimeout(resolve))
    await answer(failed)
    await new Promise((resolve) => setTimeout(resolve))
    await answer(failed)
    expect((await results).map((result) => result.status)).toEqual(['rejected', 'rejected'])
    expect(cache['en:index']).toEqual({ hello: 'orig' })
  })

  test('a failed save rolls back to the last save that reached the disk', async () => {
    const { cache, answer, bridge } = savingBridge()
    const first = bridge.saveTranslation('en.json', { hello: 'edit1' })
    const second = bridge.saveTranslation('en.json', { hello: 'edit2' })

    await answer(ok)
    await first
    await answer(failed)
    await expect(second).rejects.toThrow('disk full')
    expect(cache['en:index']).toEqual({ hello: 'edit1' })
  })

  test('an idle chunk starts from the live cache, not from an old save', async () => {
    const { cache, answer, bridge } = savingBridge()
    const first = bridge.saveTranslation('en.json', { hello: 'edit1' })
    await answer(ok)
    await first

    cache['en:index'] = { hello: 'hmr' }
    const second = bridge.saveTranslation('en.json', { hello: 'edit2' })
    await answer(failed)
    await expect(second).rejects.toThrow('disk full')
    expect(cache['en:index']).toEqual({ hello: 'hmr' })
  })
})
