import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { STORAGE_CC_KEY } from '../../src/runtime/utils/cache-keys'
import { translationStorage } from '../../src/runtime/utils/storage'

const options = { apiBaseUrl: '_locales', baseURL: '/' }

afterEach(() => {
  vi.unstubAllGlobals()
  translationStorage.clear()
})

describe('a server render', () => {
  beforeEach(() => {
    ;(globalThis as { __i18nSide?: string }).__i18nSide = 'server'
  })
  afterEach(() => {
    delete (globalThis as { __i18nSide?: string }).__i18nSide
  })

  test('has one source, the loader, with a host in the environment too', async () => {
    vi.stubEnv('NUXT_I18N_APP_BASE_SERVER_HOST', 'https://runtime.test')
    const fetchMock = vi.fn()
    vi.stubGlobal('$fetch', fetchMock)
    const serverLoad = vi.fn(async () => ({ hello: 'page' }))
    expect(await translationStorage.load('de', 'about', { ...options, serverLoad })).toEqual({ hello: 'page' })
    expect(fetchMock).not.toHaveBeenCalled()
    vi.unstubAllEnvs()
  })

  test('a page with no file shows the root, keeps nothing under its key, and a file that appears is read', async () => {
    const files: Record<string, Record<string, unknown> | null> = { nofile: null, __root: { hello: 'root' } }
    const serverLoad = vi.fn(async (_locale: string, page: string) => files[page] ?? null)
    const render = { ...options, serverLoad }

    expect(await translationStorage.load('de', 'nofile', render)).toEqual({ hello: 'root' })
    expect(translationStorage.getFromCache('de', 'nofile')).toBeNull()

    await translationStorage.load('de', 'nofile', render)
    expect(serverLoad.mock.calls.filter(([, page]) => page === '__root')).toHaveLength(2)
    expect(serverLoad.mock.calls.filter(([, page]) => page === 'nofile')).toHaveLength(2)

    files.nofile = { hello: 'page' }
    expect(await translationStorage.load('de', 'nofile', render)).toEqual({ hello: 'page' })
  })

  test('keeps no copy of what the loader caches: one TTL, the loader counts it', async () => {
    let version = 1
    const serverLoad = vi.fn(async () => ({ version }))
    const render = { ...options, serverLoad }
    expect(await translationStorage.load('de', 'about', render)).toEqual({ version: 1 })
    version = 2
    expect(await translationStorage.load('de', 'about', render)).toEqual({ version: 2 })
    expect(translationStorage.getFromCache('de', 'about')).toBeNull()
  })

  test('no file and no root: an empty stand-in, kept nowhere', async () => {
    const render = { ...options, serverLoad: async () => null }
    const data = await translationStorage.load('de', 'nofile', render)
    expect(data).toEqual({})
    expect(translationStorage.getFromCache('de', '__root')).toBeNull()
  })
})

// the HMR watcher reaches the cache through its global key, not through translationStorage
test('a response that predates a clear of the global cache is not stored', async () => {
  const answers = [Promise.withResolvers<Record<string, unknown>>(), Promise.withResolvers<Record<string, unknown>>()]
  const fetchMock = vi.fn(() => answers[fetchMock.mock.calls.length - 1]!.promise)
  vi.stubGlobal('$fetch', fetchMock)

  const load = translationStorage.load('en', 'stale-load', options)
  await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))
  ;(globalThis as unknown as Record<symbol, { clear(): void }>)[STORAGE_CC_KEY]!.clear()
  answers[0]!.resolve({ hello: 'before the edit' })
  await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2))
  answers[1]!.resolve({ hello: 'after the edit' })

  expect(await load).toEqual({ hello: 'after the edit' })
  expect(translationStorage.getFromCache('en', 'stale-load')).toEqual({ hello: 'after the edit' })
})

const notFound = () => Object.assign(new Error('404'), { status: 404 })
const answering = (answer: (url: string) => unknown) =>
  vi.fn(async (url: string) => {
    const value = answer(url)
    if (value instanceof Error) throw value
    return value
  })

test('a page the host has no file for gets the root dictionary, and the next visit asks for its file again', async () => {
  const fetchMock = answering((url) => (url.includes('__root') ? { hello: 'root' } : notFound()))
  vi.stubGlobal('$fetch', fetchMock)

  expect(await translationStorage.load('de', 'added-at-runtime', options)).toEqual({ hello: 'root' })
  expect(fetchMock.mock.calls.map(([url]) => url)).toEqual(['/_locales/added-at-runtime/de/data.json', '/_locales/__root/de/data.json'])
  expect(translationStorage.getFromCache('de', 'added-at-runtime')).toBeNull()

  vi.stubGlobal(
    '$fetch',
    answering(() => ({ hello: 'page' })),
  )
  expect(await translationStorage.load('de', 'added-at-runtime', options)).toEqual({ hello: 'page' })
})

test("a static host's SPA shell in place of the page's file counts as no file", async () => {
  vi.stubGlobal(
    '$fetch',
    answering((url) => (url.includes('__root') ? { hello: 'root' } : '<!doctype html>')),
  )
  expect(await translationStorage.load('de', 'shell', options)).toEqual({ hello: 'root' })
})

test('no root file either (source mode on a file host) is an empty dictionary, not a failed load', async () => {
  vi.stubGlobal(
    '$fetch',
    answering(() => notFound()),
  )
  expect(await translationStorage.load('de', 'nothing', options)).toEqual({})
})

test('a failed load stays one: a retry can work, so it neither falls back nor stays cached', async () => {
  const unavailable = Object.assign(new Error('503'), { status: 503 })
  vi.stubGlobal(
    '$fetch',
    answering(() => unavailable),
  )
  await expect(translationStorage.load('de', 'down', options)).rejects.toBe(unavailable)
  vi.stubGlobal(
    '$fetch',
    answering(() => '<!doctype html>'),
  )
  await expect(translationStorage.load('de', 'portal', options)).rejects.toThrow('Invalid translation payload')
  expect(translationStorage.getFromCache('de', 'down')).toBeNull()
})
