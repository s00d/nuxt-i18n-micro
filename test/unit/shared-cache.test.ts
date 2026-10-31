import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { SERVER_CC_KEY } from '../../src/runtime/utils/cache-keys'

/** The parts of a mounted unstorage the layer uses. getItem parses like unstorage's destr: a broken string stays a string. */
function fakeMount(values = new Map<string, string>()) {
  const parse = (raw: string) => {
    try {
      return JSON.parse(raw)
    } catch {
      return raw
    }
  }
  return {
    values,
    ttls: new Map<string, number | undefined>(),
    getItem: vi.fn(async (key: string): Promise<unknown> => {
      const raw = values.get(key)
      return raw === undefined ? null : parse(raw)
    }),
    setItem: vi.fn(async function (this: void, key: string, value: string, options?: { ttl?: number }) {
      values.set(key, value)
      mount.ttls.set(key, options?.ttl)
    }),
  }
}

let mount = fakeMount()
const state = vi.hoisted(() => ({
  files: {} as Record<string, unknown>,
  privateConfig: {} as Record<string, unknown>,
  config: {} as Record<string, unknown>,
  mounted: 'shared' as string | null,
  reads: [] as string[],
}))

vi.mock('nitropack/runtime', () => ({
  useStorage: (base?: string) => (base ? mount : { getMount: (name: string) => ({ base: name === state.mounted ? `${name}:` : '' }) }),
}))
// every `#i18n-internal/*` is aliased to one stub, so one mock answers for all of them
vi.mock('#i18n-internal/config', () => ({
  getI18nPrivateConfig: () => state.privateConfig,
  getI18nConfig: () => state.config,
  readPayload: async (key: string) => {
    state.reads.push(key)
    return state.files[key] ?? {}
  },
}))
vi.mock('../../src/runtime/server/utils/locale-detector', () => ({ getI18nServerConfig: () => state.config }))

/** One Nitro process: a fresh module graph and an empty LRU. */
async function instance() {
  vi.resetModules()
  delete (globalThis as Record<symbol, unknown>)[SERVER_CC_KEY]
  return (await import('../../src/runtime/server/utils/server-loader')).loadTranslationsFromServer
}

const EN = { 'index/en/data.json': { title: 'Home' }, '__root/en/data.json': { hello: 'Hello' } }

beforeEach(() => {
  mount = fakeMount()
  state.files = { ...EN }
  state.reads = []
  state.mounted = 'shared'
  state.privateConfig = { cacheStorage: 'shared', cacheStorageBuild: 'build-a' }
  state.config = { locales: [{ code: 'en' }, { code: 'de' }], dateBuild: 'hash', cacheTtl: 0 }
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('unset', () => {
  test('the storage is never touched', async () => {
    state.privateConfig = {}
    const load = await instance()
    expect((await load('en', 'index')).data).toEqual({ title: 'Home' })
    expect(mount.getItem).not.toHaveBeenCalled()
    expect(mount.setItem).not.toHaveBeenCalled()
  })
})

describe('read order', () => {
  test('one instance reads the source, the next one reads its copy, parsed once', async () => {
    await (
      await instance()
    )('en', 'index')
    expect(state.reads).toEqual(['index/en/data.json', '__root/en/data.json'])
    expect([...mount.values.values()].sort()).toEqual(['{"hello":"Hello"}', '{"title":"Home"}'])

    state.reads = []
    const entry = await (await instance())('en', 'index')
    expect(entry.data).toEqual({ title: 'Home' })
    expect(entry.json).toBe('{"title":"Home"}')
    expect(state.reads).toEqual([])
  })

  test('the local level answers before the storage', async () => {
    const load = await instance()
    await load('en', 'index')
    mount.getItem.mockClear()
    await load('en', 'index')
    expect(mount.getItem).not.toHaveBeenCalled()
  })

  test('concurrent loads in one process share one read', async () => {
    const load = await instance()
    await Promise.all([load('en', 'index'), load('en', 'index'), load('en', 'index')])
    expect(mount.getItem.mock.calls.filter(([key]) => key.endsWith(':index'))).toHaveLength(1)
    expect(state.reads.filter((key) => key === 'index/en/data.json')).toHaveLength(1)
  })

  test('a disabled locale never reaches the storage', async () => {
    const load = await instance()
    expect((await load('xx', 'index')).data).toEqual({})
    expect(mount.getItem).not.toHaveBeenCalled()
  })
})

describe('keys', () => {
  const stored = async () => {
    await (
      await instance()
    )('en', 'index')
    return (key: string) => mount.values.has(key)
  }

  test('two builds side by side never read each other, even with equal or switched-off dateBuild', async () => {
    state.config = { ...state.config, dateBuild: 0 }
    await (
      await instance()
    )('en', 'index')

    state.privateConfig = { ...state.privateConfig, cacheStorageBuild: 'build-b' }
    state.files = { 'index/en/data.json': { title: 'New' } }
    const entry = await (await instance())('en', 'index')
    expect(entry.data).toEqual({ title: 'New' })
    expect([...mount.values.values()].sort()).toEqual(['{"hello":"Hello"}', '{"title":"Home"}', '{"title":"New"}'])

    // the old build, still serving during the deploy
    state.privateConfig = { ...state.privateConfig, cacheStorageBuild: 'build-a' }
    expect((await (await instance())('en', 'index')).data).toEqual({ title: 'Home' })
  })

  test('a runtime fallbackLocale gets its own keys: it changes what a chunk holds', async () => {
    await (
      await instance()
    )('en', 'index')
    const before = mount.values.size
    state.config = { ...state.config, fallbackLocale: 'de' }
    await (
      await instance()
    )('en', 'index')
    expect(mount.values.size).toBeGreaterThan(before)
  })

  test('the key is the module prefix, build, locale and page', async () => {
    const has = await stored()
    expect(has('i18n-micro:build-a-hash-:en:index')).toBe(true)
  })

  test('request text cannot change the shape of a key', async () => {
    state.files = { '..%2Fa:b?c/en/data.json': { own: 'x' }, '__root/en/data.json': { hello: 'Hello' } }
    await (
      await instance()
    )('en', '..%2Fa:b?c')
    const [key] = mount.getItem.mock.calls[0]!
    expect(key.split(':')).toHaveLength(4)
    expect(key).not.toContain('..')
    expect(key).not.toContain('?')
  })

  test('a very long page name skips the layer', async () => {
    await (
      await instance()
    )('en', 'x'.repeat(1000))
    expect(mount.getItem.mock.calls.filter(([key]) => key.includes('xxx'))).toEqual([])
  })
})

describe('expiry', () => {
  test('cacheTtl is the expiry when set', async () => {
    state.config = { ...state.config, cacheTtl: 120 }
    await (
      await instance()
    )('en', 'index')
    expect([...mount.ttls.values()]).toEqual([120, 120])
  })

  test('with no cacheTtl keys expire in a day: old builds cannot pile up', async () => {
    await (
      await instance()
    )('en', 'index')
    expect([...mount.ttls.values()]).toEqual([86_400, 86_400])
  })
})

describe('what comes back is validated', () => {
  test.each([
    ['broken JSON', '{"title":'],
    ['a scalar', '42'],
    ['an array', '["x"]'],
    ['an empty object', '{}'],
    ['null', 'null'],
  ])('%s is a miss, and the source repairs it', async (_name, raw) => {
    mount.values.set('i18n-micro:build-a-hash-:en:index', raw)
    const entry = await (await instance())('en', 'index')
    expect(entry.data).toEqual({ title: 'Home' })
    expect(mount.values.get('i18n-micro:build-a-hash-:en:index')).toBe('{"title":"Home"}')
  })

  test('an object from a driver that parses for itself is accepted', async () => {
    mount.getItem.mockResolvedValueOnce({ title: 'From KV' })
    expect((await (await instance())('en', 'index')).data).toEqual({ title: 'From KV' })
  })
})

describe('made-up pages add no keys', () => {
  test('premerged: a page with no folder shares the root entry', async () => {
    const load = await instance()
    await load('en', '__root')
    const keys = mount.values.size
    const root = await load('en', 'no-such-page-1')
    await load('en', 'no-such-page-2')
    expect(mount.values.size).toBe(keys)
    expect(root.data).toEqual({ hello: 'Hello' })
  })

  test('a page with no folder costs one storage read, not one per request', async () => {
    const load = await instance()
    await load('en', 'no-such-page')
    mount.getItem.mockClear()
    await load('en', 'no-such-page')
    expect(mount.getItem).not.toHaveBeenCalled()
  })

  test('source: the merged root is not stored again under the page name', async () => {
    state.config = { ...state.config, translationPayloadMode: 'source', locales: [{ code: 'en' }] }
    state.files = { 'en.json': { hello: 'Hello' }, 'pages/about/en.json': { about: 'About' } }
    const load = await instance()
    await load('en', 'no-such-page-1')
    await load('en', 'no-such-page-2')
    expect([...mount.values.keys()]).toEqual(['i18n-micro:build-a-hash-:en:__root'])
    expect((await load('en', 'about')).data).toEqual({ hello: 'Hello', about: 'About' })
    expect(mount.values.size).toBe(2)
  })

  test('remote: a page the host answers with the root adds no key', async () => {
    state.privateConfig = { ...state.privateConfig, apiBaseServerHost: 'https://backend.test' }
    const fetcher = vi.fn(async (path: string) => (path.includes('/about/') ? { about: 'About' } : { hello: 'Hello' }))
    vi.stubGlobal('$fetch', fetcher)
    const load = await instance()
    await load('en', 'no-such-page')
    await load('en', 'about')
    expect([...mount.values.keys()].sort()).toEqual(['i18n-micro:build-a-hash-:en:__root', 'i18n-micro:build-a-hash-:en:about'])
  })
})

describe('remote host', () => {
  beforeEach(() => {
    state.privateConfig = { ...state.privateConfig, apiBaseServerHost: 'https://backend.test' }
  })

  test('three instances, one fetch per chunk', async () => {
    const fetcher = vi.fn(async (path: string) => (path.includes('/about/') ? { about: 'About' } : { hello: 'Hello' }))
    vi.stubGlobal('$fetch', fetcher)
    await (
      await instance()
    )('en', 'about')
    await (
      await instance()
    )('en', 'about')
    await (
      await instance()
    )('en', 'about')
    // the page, and the root it is compared with
    expect(fetcher).toHaveBeenCalledTimes(2)
  })

  test('a failed fetch reads as {} and is not handed to the other instances', async () => {
    vi.stubGlobal('$fetch', vi.fn().mockRejectedValue(new Error('502')))
    expect((await (await instance())('en', 'about')).data).toEqual({})
    expect(mount.values.size).toBe(0)
  })
})

describe('a failing storage never reaches the page', () => {
  test('a read that throws falls back to the source, one warning', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    mount.getItem.mockRejectedValue(new Error('ECONNREFUSED'))
    const load = await instance()
    expect((await load('en', 'index')).data).toEqual({ title: 'Home' })
    expect((await load('de', 'index')).data).toEqual({})
    expect(warn).toHaveBeenCalledTimes(1)
    expect(warn.mock.calls[0]![0]).toContain('ECONNREFUSED')
  })

  test('a failed write is ignored', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    mount.setItem.mockRejectedValue(new Error('READONLY'))
    expect((await (await instance())('en', 'index')).data).toEqual({ title: 'Home' })
  })

  test('a hanging storage gives up after the timeout, leaves no timer, and is skipped for a while', async () => {
    vi.useFakeTimers()
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    mount.getItem.mockImplementation(() => new Promise(() => {}))
    const load = await instance()

    const page = load('en', 'index')
    await vi.advanceTimersByTimeAsync(250)
    expect((await page).data).toEqual({ title: 'Home' })
    expect(vi.getTimerCount()).toBe(0)

    mount.getItem.mockClear()
    expect((await load('de', 'index')).data).toEqual({})
    expect(mount.getItem).not.toHaveBeenCalled()
    expect(mount.setItem).not.toHaveBeenCalled()
  })

  test('the layer comes back after the cooldown', async () => {
    vi.useFakeTimers()
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    mount.getItem.mockRejectedValueOnce(new Error('down'))
    const load = await instance()
    await load('en', 'index')
    expect(mount.values.size).toBe(0)

    vi.advanceTimersByTime(5_000)
    await load('de', 'index')
    expect(mount.getItem.mock.calls.length).toBeGreaterThan(1)
  })
})

describe('an unknown mount', () => {
  test('warns once and works without the layer', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    state.mounted = null
    const load = await instance()
    expect((await load('en', 'index')).data).toEqual({ title: 'Home' })
    await load('de', 'index')
    expect(warn).toHaveBeenCalledTimes(1)
    expect(warn.mock.calls[0]![0]).toContain('"shared"')
    expect(mount.getItem).not.toHaveBeenCalled()
  })
})
