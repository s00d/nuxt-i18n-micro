import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { type BridgeAdapter, createBridge } from '../src/bridge/create-bridge'
import type { TranslationContent } from '../src/bridge/interface'
import { createI18nState } from '../src/composables/useI18nState'
import { createRpcClient } from '../src/rpc/client'
import { setupRpcHost } from '../src/rpc/host'
import { buildFileTree } from '../src/util/i18nUtils'

// The devtools tab runs in an iframe: the UI state talks to an RPC client, the host page answers
// through `setupRpcHost` with a bridge over the app's i18n instance. Two EventTargets stand in for
// the host window and the iframe window; postMessage dispatches a `message` event with `source`.

type Win = EventTarget & { parent?: { postMessage: (data: unknown) => void }; postMessage?: (data: unknown) => void }

function post(target: EventTarget, data: unknown, source: unknown) {
  const event = new Event('message')
  Object.assign(event, { data, source })
  target.dispatchEvent(event)
}

function windows() {
  const host: Win = new EventTarget()
  const frame: Win = new EventTarget()
  frame.parent = { postMessage: (data) => post(host, data, frame) }
  frame.postMessage = (data) => post(frame, data, host)
  const fromFrame: unknown[] = []
  frame.addEventListener('message', (e) => fromFrame.push((e as MessageEvent).data))
  return { host, frame, fromFrame }
}

/** An i18n instance as the framework packages expose it: a `locale:route` cache plus a change feed. */
function appI18n(cache: Record<string, unknown>) {
  const listeners = new Set<() => void>()
  const writes: unknown[][] = []
  const notify = () => listeners.forEach((cb) => cb())
  const adapter: BridgeAdapter = {
    getRouteCache: () => cache as Record<string, TranslationContent>,
    addTranslations: (locale, content, merge) => {
      writes.push(['root', locale, merge])
      cache[`${locale}:index`] = content
      notify()
    },
    addRouteTranslations: (locale, route, content, merge) => {
      writes.push(['route', locale, route, merge])
      cache[`${locale}:${route}`] = content
      notify()
    },
    subscribe: (cb) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
  }
  return { adapter, writes, listeners }
}

/** Lets every pending message handler (microtasks) finish before asserting on replies. */
const flush = () => new Promise((resolve) => setTimeout(resolve, 0))

function saveEndpoint(reply: () => { ok: boolean; status?: number; statusText?: string; json: () => Promise<unknown> }) {
  const fetchMock = vi.fn(async (_url: string, _init: RequestInit) => reply())
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

beforeEach(() => {
  vi.spyOn(console, 'log').mockImplementation(() => {})
  vi.spyOn(console, 'warn').mockImplementation(() => {})
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

test('devtools tab lists the app translations, edits a page file, saves it through the RPC and sees the live update', async () => {
  const app = appI18n({
    'en:index': { hello: 'Hello', nav: { home: 'Home', about: 'About' } },
    'de:index': { hello: 'Hallo' },
    'en:about': { title: 'About us' },
    'de:about': { title: 'Über' },
    'fr:index': {}, // empty chunk: nothing to show
    'es:index': ['not', 'an', 'object'],
    'it:index': null,
    'nl:index': 'not an object either',
    legacy: { stray: 'no locale separator' },
  })
  const bridge = createBridge({
    adapter: app.adapter,
    locales: [{ code: 'en' }, { code: 'de' }],
    defaultLocale: 'en',
    translationDir: 'locales',
  })
  const { host, frame, fromFrame } = windows()
  vi.stubGlobal('window', host)
  const stopHost = setupRpcHost(frame as unknown as Window, bridge)
  vi.stubGlobal('window', frame)
  const state = createI18nState()

  // Opening the tab before the bridge is ready shows the UI instead of spinning forever.
  expect(state.isLoading.value).toBe(true)
  await state.init()
  expect(state.isLoading.value).toBe(false)
  expect(state.locales.value).toEqual({})

  state.setBridge(createRpcClient())
  const loading = state.init()
  expect(state.isLoading.value).toBe(true)
  await loading
  expect(state.isLoading.value).toBe(false)
  expect(state.locales.value).toEqual({
    'en.json': { hello: 'Hello', nav: { home: 'Home', about: 'About' } },
    'de.json': { hello: 'Hallo' },
    'pages/about/en.json': { title: 'About us' },
    'pages/about/de.json': { title: 'Über' },
  })
  expect(state.configs.value).toEqual({
    defaultLocale: 'en',
    fallbackLocale: 'en',
    locales: [{ code: 'en' }, { code: 'de' }],
    translationDir: 'locales',
  })

  // The file tree: folders first, and every file node carries the listed key itself.
  const tree = buildFileTree(Object.keys(state.locales.value))
  const paths = (nodes: typeof tree): unknown[] => nodes.map((n) => (n.isFile ? n.fullPath : [n.fullPath, paths(n.children)]))
  expect(paths(tree)).toEqual([['pages', [['pages/about', ['pages/about/de.json', 'pages/about/en.json']]]], 'de.json', 'en.json'])
  expect(paths(buildFileTree(['pages/about/en.json', 'pages/about/de.json']))).toEqual(['pages/about/de.json', 'pages/about/en.json'])
  expect(paths(buildFileTree(['en.json']))).toEqual(['en.json'])
  expect(buildFileTree([])).toEqual([])

  // Paths with a leading slash or Windows separators open the same file, under its listed key.
  state.handleFileSelected('/pages/about/de.json')
  expect(state.selectedFile.value).toBe('pages/about/de.json')
  expect(state.selectedFileContent.value).toEqual({ title: 'Über' })
  state.handleFileSelected('pages\\about\\en.json')
  expect(state.selectedFileContent.value).toEqual({ title: 'About us' })
  state.handleFileSelected('pages/missing/de.json')
  expect(state.selectedFileContent.value).toEqual({})

  // Editing the selected copy does not touch the listed file until it is saved.
  state.handleFileSelected('pages/about/de.json')
  state.selectedFileContent.value.title = 'Über uns'
  expect(state.locales.value['pages/about/de.json']).toEqual({ title: 'Über' })

  const fetchMock = saveEndpoint(() => ({ ok: true, json: async () => ({}) }))
  await state.saveCurrent()
  expect(app.writes).toEqual([['route', 'de', 'about', false]])
  expect(fetchMock).toHaveBeenCalledTimes(1)
  const [url, init] = fetchMock.mock.calls[0]!
  expect(url).toBe('/__i18n_api/save')
  expect(init.method).toBe('POST')
  expect(init.headers).toEqual({ 'Content-Type': 'application/json' })
  expect(JSON.parse(init.body as string)).toEqual({ file: 'locales/pages/about/de.json', content: { title: 'Über uns' } })
  // The app's change feed came back as a localesUpdate event and refreshed the open file.
  expect(state.locales.value['pages/about/de.json']).toEqual({ title: 'Über uns' })
  expect(state.selectedFileContent.value).toEqual({ title: 'Über uns' })

  // A root file saved with a leading slash goes through addTranslations and keeps its locale dir.
  state.handleFileSelected('/de.json')
  state.selectedFileContent.value = { hello: 'Hallo!', nav: { home: 'Start' } }
  await state.saveCurrent()
  expect(app.writes.at(-1)).toEqual(['root', 'de', false])
  expect(JSON.parse(fetchMock.mock.calls[1]![1].body as string).file).toBe('locales/de.json')
  expect(state.locales.value['de.json']).toEqual({ hello: 'Hallo!', nav: { home: 'Start' } })
  // ...and lands on the listed file, not on a `/de.json` twin.
  expect(Object.keys(state.locales.value).sort()).toEqual(['de.json', 'en.json', 'pages/about/de.json', 'pages/about/en.json'])

  // The app changes a file on its own (HMR from disk): the open file follows.
  state.handleFileSelected('en.json')
  app.adapter.addTranslations('en', { hello: 'Hello again' }, true)
  expect(state.selectedFileContent.value).toEqual({ hello: 'Hello again' })

  // Raw protocol: unknown methods answer a JSON-RPC error, foreign windows and junk get no answer.
  fromFrame.length = 0
  post(host, { jsonrpc: '2.0', id: 'x1', method: 'deleteEverything' }, frame)
  post(host, { jsonrpc: '2.0', id: 'x2', method: 'getConfigs' }, {})
  post(host, { jsonrpc: '1.0', id: 'x3', method: 'getConfigs' }, frame)
  post(host, { jsonrpc: '2.0', method: 'getConfigs' }, frame)
  post(host, null, frame)
  post(host, { jsonrpc: '2.0', id: 'x5', method: 'saveTranslation', params: { file: 'en.json', content: { hello: 'Hi' } } }, frame)
  await flush()
  expect(fromFrame).toEqual([
    { jsonrpc: '2.0', id: 'x1', error: { code: -32603, message: 'Method deleteEverything not found' } },
    { jsonrpc: '2.0', method: 'localesUpdate', params: expect.objectContaining({ 'en.json': { hello: 'Hi' } }) },
    { jsonrpc: '2.0', id: 'x5', result: true },
  ])

  // Stray replies on the iframe side (unknown id, other protocol, other events) change nothing.
  const before = state.locales.value
  post(frame, { jsonrpc: '2.0', id: 'nobody', result: {} }, host)
  post(frame, { jsonrpc: '2.0', method: 'somethingElse', params: {} }, host)
  post(frame, { jsonrpc: '1.0', method: 'localesUpdate', params: {} }, host)
  expect(state.locales.value).toBe(before)

  // After the host is torn down the app no longer pushes into the iframe.
  vi.stubGlobal('window', host)
  stopHost()
  expect(app.listeners.size).toBe(0)
  fromFrame.length = 0
  post(host, { jsonrpc: '2.0', id: 'x4', method: 'getConfigs' }, frame)
  await flush()
  expect(fromFrame).toEqual([])
})

test('a failed disk save reaches the editor as an error after the app was already hot-updated', async () => {
  const app = appI18n({ 'en:index': { hello: 'Hello' }, 'de:index': { hello: 'Hallo' } })
  const bridge = createBridge({ adapter: app.adapter })
  const { host, frame } = windows()
  vi.stubGlobal('window', host)
  setupRpcHost(frame as unknown as Window, bridge)
  vi.stubGlobal('window', frame)
  const state = createI18nState()
  state.setBridge(createRpcClient())
  await state.init()

  // Bridge defaults: en, src/locales, fallback from the adapter when it has one.
  expect(await bridge.getConfigs()).toEqual({ defaultLocale: 'en', fallbackLocale: 'en', locales: [], translationDir: 'src/locales' })
  const withFallback = createBridge({ adapter: { ...app.adapter, getFallbackLocale: () => 'de' }, defaultLocale: 'fr' })
  expect(await withFallback.getConfigs()).toMatchObject({ defaultLocale: 'fr', fallbackLocale: 'de' })

  state.handleFileSelected('de.json')
  state.selectedFileContent.value = { hello: 'Servus' }

  saveEndpoint(() => ({ ok: false, statusText: 'Insufficient Storage', json: async () => ({ error: 'disk full' }) }))
  await expect(state.saveCurrent()).rejects.toThrow('Failed to save: disk full')
  saveEndpoint(() => ({ ok: false, statusText: 'Bad Gateway', json: async () => Promise.reject(new Error('html page')) }))
  await expect(state.saveCurrent()).rejects.toThrow('Failed to save: Unknown error')
  saveEndpoint(() => ({ ok: false, statusText: 'Bad Gateway', json: async () => ({}) }))
  await expect(state.saveCurrent()).rejects.toThrow('Failed to save: Network response was not ok: Bad Gateway')
  // Each failed disk save rolls the hot update back: the app keeps what is on disk, the editor keeps the edit.
  expect(state.locales.value['de.json']).toEqual({ hello: 'Hallo' })
  expect(app.adapter.getRouteCache()['de:index']).toEqual({ hello: 'Hallo' })
  expect(state.selectedFileContent.value).toEqual({ hello: 'Servus' })
  expect(app.writes).toEqual(Array.from({ length: 6 }, () => ['root', 'de', false]))

  // A page file goes back to its own chunk; one the app had no chunk for, to an empty one the list skips.
  app.adapter.addRouteTranslations('de', 'shop', { cart: 'Korb' }, true)
  state.handleFileSelected('pages/shop/de.json')
  state.selectedFileContent.value = { cart: 'Warenkorb' }
  await expect(state.saveCurrent()).rejects.toThrow('Failed to save: Network response was not ok: Bad Gateway')
  expect(state.locales.value['pages/shop/de.json']).toEqual({ cart: 'Korb' })
  expect(state.selectedFileContent.value).toEqual({ cart: 'Warenkorb' })
  state.locales.value['pages/new/de.json'] = {}
  state.handleFileSelected('pages/new/de.json')
  state.selectedFileContent.value = { fresh: 'Neu' }
  await expect(state.saveCurrent()).rejects.toThrow('Failed to save: Network response was not ok: Bad Gateway')
  expect(app.adapter.getRouteCache()['de:new']).toEqual({})
  expect(state.locales.value['pages/new/de.json']).toBeUndefined()
  state.handleFileSelected('de.json')

  // In a browser too, an error the reachable endpoint reports is an error: rolled back, not kept in localStorage.
  const stored = new Map<string, string>()
  vi.stubGlobal('localStorage', { setItem: (k: string, v: string) => stored.set(k, v) })
  saveEndpoint(() => ({ ok: false, status: 500, statusText: 'Server Error', json: async () => ({ error: 'Path traversal detected' }) }))
  state.selectedFileContent.value = { hello: 'Moin' }
  await expect(state.saveCurrent()).rejects.toThrow('Failed to save: Path traversal detected')
  expect(stored.size).toBe(0)
  expect(app.adapter.getRouteCache()['de:index']).toEqual({ hello: 'Hallo' })

  // A preview build without the save endpoint keeps the edit in localStorage instead.
  saveEndpoint(() => ({ ok: false, status: 404, statusText: 'Not Found', json: async () => ({ error: 'no endpoint' }) }))
  await state.saveCurrent()
  expect([...stored]).toEqual([['i18n_save_de.json', '{\n  "hello": "Moin"\n}']])
  expect(state.locales.value['de.json']).toEqual({ hello: 'Moin' })
  // So does an unreachable server.
  vi.stubGlobal('fetch', async () => Promise.reject(new TypeError('Failed to fetch')))
  state.selectedFileContent.value = { hello: 'Na' }
  await state.saveCurrent()
  expect(stored.get('i18n_save_de.json')).toBe('{\n  "hello": "Na"\n}')

  // A file the bridge cannot map to a locale is refused before anything is written.
  state.selectedFile.value = 'notes/readme.txt'
  await expect(state.saveCurrent()).rejects.toThrow('Failed to save: Unknown file path format: notes/readme.txt')
  expect(stored.size).toBe(1)

  // Nothing selected: save is a no-op.
  state.selectedFile.value = ''
  await expect(state.saveCurrent()).resolves.toBeUndefined()
})

test('file tools: export downloads the open file, import replaces it, the default-locale file is found for comparison', async () => {
  const state = createI18nState()
  state.handleFileSelected('de.json')
  expect(state.getDefaultLocaleTranslation()).toEqual({})

  state.configs.value = { defaultLocale: 'en' }
  state.locales.value = { 'en.json': { a: 'A', b: 'B' }, 'de.json': { a: 'Ä' } }
  state.handleFileSelected('/de.json')
  expect(state.getDefaultLocaleTranslation()).toEqual({ a: 'A', b: 'B' })

  // Keys that carry a leading slash, or only live under a nested folder, are still found.
  state.locales.value = { '/en.json': { slash: 'yes' }, 'de.json': {} }
  expect(state.getDefaultLocaleTranslation()).toEqual({ slash: 'yes' })
  state.locales.value = { 'shop/en.json': { nested: 'yes' }, 'shop/de.json': {} }
  state.handleFileSelected('shop/de.json')
  expect(state.getDefaultLocaleTranslation()).toEqual({ nested: 'yes' })
  state.locales.value = { 'de.json': {} }
  expect(state.getDefaultLocaleTranslation()).toEqual({})

  // A page file compares with its own default-locale sibling, never with the root file.
  state.locales.value = {
    'en.json': { root: 'yes' },
    'pages/about/en.json': { title: 'About' },
    'pages/about/de.json': {},
    'pages/contact/de.json': {},
    'additional:extra/en.json': { extra: 'yes' },
    'additional:extra/de.extra.json': {},
  }
  state.handleFileSelected('pages/about/de.json')
  expect(state.getDefaultLocaleTranslation()).toEqual({ title: 'About' })
  state.handleFileSelected('pages/contact/de.json')
  expect(state.getDefaultLocaleTranslation()).toEqual({})
  state.handleFileSelected('additional:extra/de.extra.json')
  expect(state.getDefaultLocaleTranslation()).toEqual({})
  state.locales.value['additional:extra/en.extra.json'] = { suffix: 'kept' }
  expect(state.getDefaultLocaleTranslation()).toEqual({ suffix: 'kept' })
  state.handleFileSelected('constructor')
  expect(state.selectedFileContent.value).toEqual({})

  // A bridge without live updates (the Nuxt DevTools RPC): the file the tree hands over is saved
  // under its own key, and opening it again shows the saved content.
  const saved: unknown[][] = []
  state.locales.value = { 'en.json': { a: 'A' }, 'de.json': { a: 'Ä' } }
  state.setBridge({
    getLocalesAndTranslations: async () => ({}),
    getConfigs: async () => ({}),
    saveTranslation: async (file, content) => void saved.push([file, content]),
    onLocalesUpdate: () => () => {},
  })
  const deFile = buildFileTree(Object.keys(state.locales.value)).find((n) => n.name === 'de.json')!.fullPath
  state.handleFileSelected(deFile)
  state.selectedFileContent.value = { a: 'Ä!' }
  await state.saveCurrent()
  expect(saved).toEqual([['de.json', { a: 'Ä!' }]])
  state.handleFileSelected('en.json')
  state.handleFileSelected(deFile)
  expect(state.selectedFileContent.value).toEqual({ a: 'Ä!' })
  expect(Object.keys(state.locales.value)).toEqual(['en.json', 'de.json'])

  const clicked: Array<{ href: string; download: string }> = []
  vi.stubGlobal('document', {
    createElement: () => {
      const link = { href: '', download: '', click: () => clicked.push({ href: link.href, download: link.download }) }
      return link
    },
  })
  const blobs: Blob[] = []
  vi.spyOn(URL, 'createObjectURL').mockImplementation((blob) => {
    blobs.push(blob as Blob)
    return 'blob:export'
  })
  const revoke = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
  state.selectedFileContent.value = { a: 'Ä', nested: { b: 'B' } }
  await state.exportTranslations()
  expect(clicked).toEqual([{ href: 'blob:export', download: 'translations.json' }])
  expect(blobs[0]!.type).toBe('application/json')
  expect(await blobs[0]!.text()).toBe('{\n  "a": "Ä",\n  "nested": {\n    "b": "B"\n  }\n}')
  expect(revoke).toHaveBeenCalledWith('blob:export')

  class Reader {
    onload: ((e: { target: { result: string } }) => void) | null = null
    readAsText(file: File) {
      void file.text().then((result) => this.onload?.({ target: { result } }))
    }
  }
  vi.stubGlobal('FileReader', Reader)
  const pick = (files: File[]) => state.importTranslations({ target: { files } } as unknown as Event)
  pick([new File(['{"a":"Imported"}'], 'de.json')])
  await flush()
  expect(state.selectedFileContent.value).toEqual({ a: 'Imported' })
  pick([new File(['not json'], 'broken.json')])
  await flush()
  expect(state.selectedFileContent.value).toEqual({ a: 'Imported' })
  expect(console.error).toHaveBeenCalledWith('Invalid JSON file')
  pick([])
  await flush()
  expect(state.selectedFileContent.value).toEqual({ a: 'Imported' })
})
