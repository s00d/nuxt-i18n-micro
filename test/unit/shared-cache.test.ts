import { chmodSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createStorage } from 'unstorage'
import fsDriver from 'unstorage/drivers/fs'
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
  embedded: false,
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
    const value = state.files[key] ?? {}
    if (value instanceof Error) throw value
    return value
  },
  get embeddedPayloads() {
    return state.embedded
  },
}))
vi.mock('../../src/runtime/server/utils/locale-detector', () => ({ getI18nServerConfig: () => state.config }))

/** One Nitro process: a fresh module graph and an empty LRU. */
async function instance() {
  vi.resetModules()
  delete (globalThis as Record<symbol, unknown>)[SERVER_CC_KEY]
  return (await import('../../src/runtime/server/utils/server-loader')).loadTranslationsFromServer
}

// a page payload always carries the root keys
const HOME = { hello: 'Hello', title: 'Home' }
const EN = { 'index/en/data.json': HOME, '__root/en/data.json': { hello: 'Hello' } }
const KEY = 'i18n-micro:build-a~hash~~:en:index'
const HOST = 'https://backend.test'
const httpError = (status: number) => Object.assign(new Error(`${status}`), { status })

beforeEach(() => {
  mount = fakeMount()
  state.files = { ...EN }
  state.reads = []
  state.mounted = 'shared'
  state.embedded = false
  state.privateConfig = { cacheStorage: 'shared', cacheStorageBuild: 'build-a' }
  state.config = { locales: [{ code: 'en' }, { code: 'de' }], dateBuild: 'hash', cacheTtl: 0 }
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
})

describe('unset', () => {
  test('the storage is never touched', async () => {
    state.privateConfig = {}
    const load = await instance()
    expect((await load('en', 'index')).data).toEqual(HOME)
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
    expect([...mount.values.values()].sort()).toEqual(['{"hello":"Hello","title":"Home"}', '{"hello":"Hello"}'])

    state.reads = []
    const entry = await (await instance())('en', 'index')
    expect(entry.data).toEqual(HOME)
    expect(entry.json).toBe('{"hello":"Hello","title":"Home"}')
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

  test('on Workers a load with I/O is not shared across requests: a cancelled leader would hang the others', async () => {
    vi.stubGlobal('navigator', { userAgent: 'Cloudflare-Workers' })
    state.privateConfig = { ...state.privateConfig, apiBaseServerHost: HOST }
    const fetcher = vi.fn(async () => ({ hello: 'Hello' }))
    vi.stubGlobal('$fetch', fetcher)
    const load = await instance()
    await Promise.all([load('en', '__root'), load('en', '__root')])
    expect(fetcher).toHaveBeenCalledTimes(2)
  })

  test('on Workers an embedded read stays shared: it has no I/O to lose', async () => {
    vi.stubGlobal('navigator', { userAgent: 'Cloudflare-Workers' })
    state.embedded = true
    const load = await instance()
    await Promise.all([load('en', 'index'), load('en', 'index')])
    expect(state.reads.filter((key) => key === 'index/en/data.json')).toHaveLength(1)
  })

  test('a disabled locale never reaches the storage', async () => {
    const load = await instance()
    expect((await load('xx', 'index')).data).toEqual({})
    expect(mount.getItem).not.toHaveBeenCalled()
  })

  test('dictionaries embedded in the bundle are not copied to the storage', async () => {
    state.embedded = true
    expect((await (await instance())('en', 'index')).data).toEqual(HOME)
    expect(mount.getItem).not.toHaveBeenCalled()
    expect(mount.setItem).not.toHaveBeenCalled()
  })

  test('with embedded dictionaries a remote host still goes through the storage', async () => {
    state.embedded = true
    state.privateConfig = { ...state.privateConfig, apiBaseServerHost: HOST }
    vi.stubGlobal(
      '$fetch',
      vi.fn(async () => ({ hello: 'Hello' })),
    )
    await (
      await instance()
    )('en', '__root')
    expect(mount.values.size).toBe(1)
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
    state.files = { ...state.files, 'index/en/data.json': { hello: 'Hello', title: 'New' } }
    const entry = await (await instance())('en', 'index')
    expect(entry.data).toEqual({ hello: 'Hello', title: 'New' })
    expect([...mount.values.keys()].filter((key) => key.endsWith(':index'))).toHaveLength(2)

    // the old build, still serving during the deploy
    state.privateConfig = { ...state.privateConfig, cacheStorageBuild: 'build-a' }
    expect((await (await instance())('en', 'index')).data).toEqual(HOME)
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
    expect(has(KEY)).toBe(true)
  })

  test('a dash in one part cannot pass for the boundary of two', async () => {
    state.config = { ...state.config, dateBuild: 'a-b', fallbackLocale: 'c' }
    await (
      await instance()
    )('en', 'index')
    state.config = { ...state.config, dateBuild: 'a', fallbackLocale: 'b-c' }
    const before = mount.values.size
    await (
      await instance()
    )('en', 'index')
    expect(mount.values.size).toBeGreaterThan(before)
  })

  test('request text cannot change the shape of a key', async () => {
    state.files = { '..%2Fa:b?c/en/data.json': { own: 'x', hello: 'Hello' }, '__root/en/data.json': { hello: 'Hello' } }
    await (
      await instance()
    )('en', '..%2Fa:b?c')
    const [key] = mount.getItem.mock.calls[0]!
    expect(key.split(':')).toHaveLength(4)
    expect(key).not.toContain('..')
    expect(key).not.toContain('?')
  })

  test.each([201, 300, 1000])('a page name of %i characters skips the layer: a path segment stops at 255', async (length) => {
    await (
      await instance()
    )('en', 'x'.repeat(length))
    expect(mount.getItem.mock.calls.filter(([key]) => key.includes('xxx'))).toEqual([])
  })

  test('a key past the limit skips the layer, whatever makes it long', async () => {
    state.config = { ...state.config, dateBuild: 'x'.repeat(500) }
    await (
      await instance()
    )('en', 'index')
    expect(mount.getItem).not.toHaveBeenCalled()
  })

  test('a page name of 200 characters still uses it', async () => {
    await (
      await instance()
    )('en', 'x'.repeat(200))
    expect(mount.getItem.mock.calls.filter(([key]) => key.includes('xxx'))).toHaveLength(1)
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

  test('a fractional cacheTtl is rounded up, Redis takes whole seconds', async () => {
    state.config = { ...state.config, cacheTtl: 1.5 }
    await (
      await instance()
    )('en', 'index')
    expect([...mount.ttls.values()]).toEqual([2, 2])
  })

  test.each([-1, Number.NaN, Number.POSITIVE_INFINITY])('cacheTtl %d takes the default', async (cacheTtl) => {
    state.config = { ...state.config, cacheTtl }
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
    mount.values.set(KEY, raw)
    const entry = await (await instance())('en', 'index')
    expect(entry.data).toEqual(HOME)
    expect(mount.values.get(KEY)).toBe(JSON.stringify(HOME))
  })

  test('an object from a driver that parses for itself is accepted', async () => {
    mount.getItem.mockResolvedValueOnce({ title: 'From KV' })
    expect((await (await instance())('en', 'index')).data).toEqual({ title: 'From KV' })
  })

  test('an error a driver returns instead of throwing is a miss: it never becomes a dictionary', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const leak = Object.assign(new Error('EACCES'), { errno: -13, code: 'EACCES', path: '/secret/mount/key' })
    mount.getItem.mockResolvedValueOnce(leak)
    const entry = await (await instance())('en', 'index')
    expect(entry.data).toEqual(HOME)
    expect(entry.json).not.toContain('/secret')
    // one URL must not close the layer for everyone
    expect(warn).not.toHaveBeenCalled()
    expect(mount.values.get(KEY)).toBe(JSON.stringify(HOME))
  })

  test('the real fs driver returns its read errors: an unreadable key reaches no response', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const base = mkdtempSync(join(tmpdir(), 'i18n-shared-fs-'))
    const real = createStorage({ driver: fsDriver({ base }) })
    await real.setItem(KEY, '{"hello":"Stored"}')
    const file = join(base, ...KEY.split(':'))
    chmodSync(file, 0)
    expect(await real.getItem(KEY)).toBeInstanceOf(Error)

    mount = real as never
    const entry = await (await instance())('en', 'index')
    expect(entry.data).toEqual(HOME)
    expect(entry.json).not.toContain(base)
    chmodSync(file, 0o600)
    rmSync(base, { recursive: true, force: true })
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
    expect([...mount.values.keys()]).toEqual(['i18n-micro:build-a~hash~~:en:__root'])
    expect((await load('en', 'about')).data).toEqual({ hello: 'Hello', about: 'About' })
    expect(mount.values.size).toBe(2)
  })

  describe('remote', () => {
    const keys = () => [...mount.values.keys()].map((key) => key.split(':').at(-1)).sort()

    beforeEach(() => {
      state.privateConfig = { ...state.privateConfig, apiBaseServerHost: HOST }
    })

    test('a page the host answers with the root adds no key', async () => {
      const fetcher = vi.fn(async (path: string) => (path.includes('/about/') ? { hello: 'Hello', about: 'About' } : { hello: 'Hello' }))
      vi.stubGlobal('$fetch', fetcher)
      const load = await instance()
      await load('en', 'no-such-page')
      await load('en', 'about')
      expect(keys()).toEqual(['__root', 'about'])
    })

    test('a root that failed once adds no key for made-up names, and the page still answers', async () => {
      let rootDown = true
      vi.stubGlobal(
        '$fetch',
        vi.fn(async (path: string) => {
          if (path.includes('__root') && rootDown) throw httpError(502)
          return { hello: 'Hello' }
        }),
      )
      const load = await instance()
      expect((await load('en', 'made-up-1')).data).toEqual({ hello: 'Hello' })
      expect(mount.values.size).toBe(0)
      rootDown = false
      await load('en', 'made-up-2')
      expect(keys()).toEqual(['__root'])
    })

    test('a host with no __root shares nothing: without a root nothing tells a made-up page', async () => {
      vi.stubGlobal(
        '$fetch',
        vi.fn(async (path: string) => {
          if (path.includes('__root')) throw httpError(404)
          return { hello: 'Hello' }
        }),
      )
      const load = await instance()
      for (let i = 0; i < 5; i++) await load('en', `made-up-${i}`)
      expect(mount.values.size).toBe(0)
    })
  })
})

describe('remote host', () => {
  beforeEach(() => {
    state.privateConfig = { ...state.privateConfig, apiBaseServerHost: HOST }
  })

  test('three instances, one fetch per chunk', async () => {
    const fetcher = vi.fn(async (path: string) => (path.includes('/about/') ? { hello: 'Hello', about: 'About' } : { hello: 'Hello' }))
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

  test('a failed fetch rejects, is cached nowhere, and the next request reads the recovered host', async () => {
    const fetcher = vi.fn().mockRejectedValue(httpError(502))
    vi.stubGlobal('$fetch', fetcher)
    const load = await instance()
    await expect(load('en', 'about')).rejects.toThrow('502')
    expect(mount.values.size).toBe(0)

    fetcher.mockImplementation(async (path: string) => (path.includes('/about/') ? { hello: 'Hello', about: 'About' } : { hello: 'Hello' }))
    expect((await load('en', 'about')).data).toEqual({ hello: 'Hello', about: 'About' })
  })

  test('a 404 is an answer: empty, kept locally, and not handed to the other instances', async () => {
    const fetcher = vi.fn().mockRejectedValue(httpError(404))
    vi.stubGlobal('$fetch', fetcher)
    const load = await instance()
    expect((await load('en', 'about')).data).toEqual({})
    expect(mount.values.size).toBe(0)
    fetcher.mockClear()
    await load('en', 'about')
    expect(fetcher).not.toHaveBeenCalled()
  })

  test('a 200 error body never reaches the other instances: a chunk holds the root keys', async () => {
    vi.stubGlobal(
      '$fetch',
      vi.fn(async (path: string) => (path.includes('__root') ? { hello: 'Hello' } : { error: 'maintenance' })),
    )
    await (
      await instance()
    )('en', 'about')
    expect([...mount.values.values()]).toEqual(['{"hello":"Hello"}'])
  })

  test('the runtime host wins over the build one, and each has its own keys', async () => {
    const fetcher = vi.fn(async () => ({ hello: 'Hello' }))
    vi.stubGlobal('$fetch', fetcher)
    await (
      await instance()
    )('en', '__root')
    expect(fetcher.mock.calls.at(-1)).toMatchObject([expect.anything(), { baseURL: HOST }])
    const first = [...mount.values.keys()]

    vi.stubEnv('NUXT_I18N_APP_BASE_SERVER_HOST', 'https://runtime.test')
    await (
      await instance()
    )('en', '__root')
    expect(fetcher.mock.calls.at(-1)).toMatchObject([expect.anything(), { baseURL: 'https://runtime.test' }])
    expect(mount.values.size).toBe(first.length + 1)
  })

  test('a host set only at runtime is read and shared too', async () => {
    state.privateConfig = { cacheStorage: 'shared', cacheStorageBuild: 'build-a' }
    vi.stubEnv('NUXT_I18N_APP_BASE_SERVER_HOST', 'https://runtime.test')
    const fetcher = vi.fn(async () => ({ hello: 'Hello' }))
    vi.stubGlobal('$fetch', fetcher)
    await (
      await instance()
    )('en', '__root')
    await (
      await instance()
    )('en', '__root')
    expect(fetcher).toHaveBeenCalledTimes(1)
  })
})

describe('a failed local read', () => {
  const eacces = () => Object.assign(new Error('EACCES'), { code: 'EACCES' })

  test('source: one unreadable file stores no partial chunk, on any level', async () => {
    state.config = { ...state.config, translationPayloadMode: 'source', locales: [{ code: 'en' }, { code: 'de', fallbackLocale: 'en' }] }
    state.files = { 'en.json': { hello: 'Hello' }, 'de.json': eacces() }
    const load = await instance()
    await expect(load('de', 'about')).rejects.toThrow('EACCES')
    expect(mount.values.size).toBe(0)

    state.files = { 'en.json': { hello: 'Hello' }, 'de.json': { hello: 'Hallo' } }
    expect((await load('de', 'about')).data).toEqual({ hello: 'Hallo' })
  })

  test('premerged: an unreadable page is not pinned', async () => {
    state.files = { ...state.files, 'index/en/data.json': eacces() }
    const load = await instance()
    await expect(load('en', 'index')).rejects.toThrow('EACCES')
    state.files = { ...EN }
    expect((await load('en', 'index')).data).toEqual(HOME)
  })
})

describe('a failing storage never reaches the page', () => {
  test('a read that throws falls back to the source, one warning', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    mount.getItem.mockRejectedValue(new Error('ECONNREFUSED'))
    const load = await instance()
    expect((await load('en', 'index')).data).toEqual(HOME)
    expect((await load('de', 'index')).data).toEqual({})
    expect(warn).toHaveBeenCalledTimes(1)
    expect(warn.mock.calls[0]![0]).toContain('ECONNREFUSED')
  })

  test('warnings are throttled to one a minute, across cooldowns', async () => {
    vi.useFakeTimers()
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    mount.getItem.mockRejectedValue(new Error('down'))
    const load = await instance()
    await load('en', 'a1')
    await load('en', 'a2')
    await load('en', 'a3')
    vi.advanceTimersByTime(6_000)
    await load('en', 'b')
    expect(warn).toHaveBeenCalledTimes(1)
    vi.advanceTimersByTime(60_000)
    await load('en', 'c')
    expect(warn).toHaveBeenCalledTimes(2)
  })

  test('a failed write is ignored', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    mount.setItem.mockRejectedValue(new Error('READONLY'))
    expect((await (await instance())('en', 'index')).data).toEqual(HOME)
  })

  test('a failed write does not close the reads', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    mount.values.set('i18n-micro:build-a~hash~~:de:index', '{"hello":"shared"}')
    mount.setItem.mockRejectedValue(new Error('READONLY'))
    const load = await instance()
    await load('en', 'index')
    expect((await load('de', 'index')).data).toEqual({ hello: 'shared' })
  })

  test('a read that answers leaves no timer behind', async () => {
    vi.useFakeTimers()
    const load = await instance()
    await load('en', 'index')
    expect(vi.getTimerCount()).toBe(0)
  })

  test('a first read may take the handshake of a slow store: it still hits, and nothing closes', async () => {
    vi.useFakeTimers()
    mount.values.set(KEY, '{"hello":"shared"}')
    mount.getItem.mockImplementation(async () => {
      await new Promise((resolve) => setTimeout(resolve, 900))
      return { hello: 'shared' }
    })
    const load = await instance()
    const page = load('en', 'index')
    await vi.advanceTimersByTimeAsync(900)
    expect((await page).data).toEqual({ hello: 'shared' })
    expect(state.reads).toEqual([])
  })

  test('a hanging storage: a long deadline once, short ones on probation, closed after three, and no timer left', async () => {
    vi.useFakeTimers()
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    mount.getItem.mockImplementation(() => new Promise(() => {}))
    const load = await instance()

    // a page with no folder reads its key, then the root's
    const first = load('en', 'a')
    await vi.advanceTimersByTimeAsync(999)
    expect(state.reads).toEqual([])
    await vi.advanceTimersByTimeAsync(1)
    expect(state.reads).toEqual(['a/en/data.json'])
    await vi.advanceTimersByTimeAsync(250)
    await first
    expect(vi.getTimerCount()).toBe(0)

    const second = load('en', 'b')
    await vi.advanceTimersByTimeAsync(250)
    await second

    mount.getItem.mockClear()
    expect((await load('de', 'd')).data).toEqual({})
    expect(mount.getItem).not.toHaveBeenCalled()
    expect(mount.setItem).not.toHaveBeenCalled()
  })

  test('one failure between answers closes nothing', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const load = await instance()
    await load('en', '__root')
    for (const page of ['a1', 'a2', 'a3', 'a4']) {
      mount.getItem.mockRejectedValueOnce(new Error('blip'))
      await load('en', page)
      await load('de', page)
    }
    mount.getItem.mockClear()
    await load('en', 'a5')
    expect(mount.getItem).toHaveBeenCalled()
  })

  test('the layer comes back after the cooldown, with its long deadline', async () => {
    vi.useFakeTimers()
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    mount.getItem.mockRejectedValue(new Error('down'))
    const load = await instance()
    await load('en', 'a1')
    await load('en', 'a2')
    await load('en', 'a3')
    mount.getItem.mockClear()
    await load('en', 'a4')
    expect(mount.getItem).not.toHaveBeenCalled()

    vi.advanceTimersByTime(5_000)
    mount.getItem.mockResolvedValue(null)
    await load('de', 'index')
    expect(mount.getItem).toHaveBeenCalled()
  })
})

describe('an unknown mount', () => {
  test('warns once and works without the layer', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    state.mounted = null
    const load = await instance()
    expect((await load('en', 'index')).data).toEqual(HOME)
    await load('de', 'index')
    expect(warn).toHaveBeenCalledTimes(1)
    expect(warn.mock.calls[0]![0]).toContain('"shared"')
    expect(mount.getItem).not.toHaveBeenCalled()
  })
})
