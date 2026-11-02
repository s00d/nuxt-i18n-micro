/** SSR reads the files in process: a delta is merged once, and from then on an entry is an entry. */
import { beforeEach, expect, test, vi } from 'vitest'
import { SERVER_CC_KEY } from '../../src/runtime/utils/cache-keys'

const MARK = '__i18n_root'
const state = vi.hoisted(() => ({
  files: {} as Record<string, unknown>,
  config: { locales: [{ code: 'en' }], translationPayloadMode: 'premerged', apiBaseUrl: '_locales' } as Record<string, unknown>,
  reads: [] as string[],
}))
vi.mock('nitropack/runtime', () => ({ useStorage: () => ({ getMount: () => ({ base: '' }) }) }))
vi.mock('#i18n-internal/config', () => ({
  getI18nPrivateConfig: () => ({}),
  getI18nConfig: () => state.config,
  readPayload: async (key: string) => {
    state.reads.push(key)
    return structuredClone(state.files[key] ?? {})
  },
  embeddedPayloads: false,
}))
vi.mock('../../src/runtime/server/utils/locale-detector', () => ({ getI18nServerConfig: () => state.config }))

async function instance() {
  vi.resetModules()
  delete (globalThis as Record<symbol, unknown>)[SERVER_CC_KEY]
  return (await import('../../src/runtime/server/utils/server-loader')).loadTranslationsFromServer
}

const ROOT = '__root/en/data.json'
beforeEach(() => {
  state.reads = []
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
  state.files = {
    [ROOT]: { nav: 'root', nested: { a: 1, b: 2 }, [MARK]: 'r' },
    'about/en/data.json': { title: 'About', nested: { b: 3 }, [MARK]: 'r' },
    'empty/en/data.json': { [MARK]: 'r' },
    'whole/en/data.json': { only: 'whole' },
  }
})

test('a delta merges over its root, with no mark left, and the JSON the route sends is whole', async () => {
  const load = await instance()
  const entry = await load('en', 'about')
  expect(entry.data).toEqual({ nav: 'root', nested: { a: 1, b: 3 }, title: 'About' })
  expect(JSON.parse(entry.json)).toEqual({ nav: 'root', nested: { a: 1, b: 3 }, title: 'About' })
})

test('once per chunk: later requests read no file', async () => {
  const load = await instance()
  await load('en', 'about')
  await load('en', 'empty')
  const reads = state.reads.length
  await load('en', 'about')
  await load('en', 'empty')
  expect(state.reads).toHaveLength(reads)
})

test('a page with no key of its own is the root entry: one tree, one leaf cache', async () => {
  const load = await instance()
  expect((await load('en', 'empty')).data).toBe((await load('en', '__root')).data)
})

test('pages share what they did not change', async () => {
  state.files[ROOT] = { nav: 'root', shared: { deep: 1 }, [MARK]: 'r' }
  const load = await instance()
  expect((await load('en', 'about')).data.shared).toBe((await load('en', '__root')).data.shared)
})

test('a file without a mark stands alone', async () => {
  const load = await instance()
  expect((await load('en', 'whole')).data).toEqual({ only: 'whole' })
})

test('a made-up page shares the root, and stores nothing', async () => {
  const load = await instance()
  expect((await load('en', 'no-such-page')).data).toBe((await load('en', '__root')).data)
})

test('a payload host: its delta merges too, and a root older than the delta goes', async () => {
  const hosted: Record<string, unknown> = {
    __root: { nav: 'old', [MARK]: 'r1' },
    a: { x: 1, [MARK]: 'r1' },
  }
  vi.stubGlobal('$fetch', async (path: string) => {
    const file = hosted[path.split('/')[2]!]
    if (!file) throw Object.assign(new Error('404'), { status: 404 })
    return structuredClone(file)
  })
  vi.stubEnv('NUXT_I18N_APP_BASE_SERVER_HOST', 'https://host.test')
  const load = await instance()
  expect((await load('en', 'a')).data).toEqual({ nav: 'old', x: 1 })
  hosted.__root = { nav: 'new', [MARK]: 'r2' }
  hosted.b = { y: 2, [MARK]: 'r2' }
  expect((await load('en', 'b')).data).toEqual({ nav: 'new', y: 2 })
})

test('a delta on a root the host has not got is kept nowhere: the next request reads again', async () => {
  const hosted: Record<string, unknown> = { a: { x: 1, [MARK]: 'r' } }
  vi.stubGlobal('$fetch', async (path: string) => {
    const file = hosted[path.split('/')[2]!]
    if (!file) throw Object.assign(new Error('404'), { status: 404 })
    return structuredClone(file)
  })
  vi.stubEnv('NUXT_I18N_APP_BASE_SERVER_HOST', 'https://host.test')
  const load = await instance()
  expect((await load('en', 'a')).data).toEqual({ x: 1 })
  hosted.__root = { nav: 'root', [MARK]: 'r' }
  expect((await load('en', 'a')).data).toEqual({ nav: 'root', x: 1 })
})

test('a host with whole files keeps working, no root asked', async () => {
  const asked: string[] = []
  vi.stubGlobal('$fetch', async (path: string) => {
    asked.push(path)
    return { whole: 1 }
  })
  vi.stubEnv('NUXT_I18N_APP_BASE_SERVER_HOST', 'https://host.test')
  const load = await instance()
  expect((await load('en', 'a')).data).toEqual({ whole: 1 })
  expect(asked).toHaveLength(1)
})
