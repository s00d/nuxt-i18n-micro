import { afterEach, expect, test, vi } from 'vitest'
import { STORAGE_CC_KEY } from '../../src/runtime/utils/cache-keys'
import { readsThroughServerLoader, translationStorage } from '../../src/runtime/utils/storage'

const options = { apiBaseUrl: '_locales', baseURL: '/' }

afterEach(() => {
  vi.unstubAllGlobals()
  translationStorage.clear()
})

test('a render with a runtime host fetches it itself, unless the loader covers the host', () => {
  const serverLoad = async () => ({})
  expect(readsThroughServerLoader({ serverLoad }, undefined)).toBe(true)
  expect(readsThroughServerLoader({ serverLoad }, 'https://runtime.test')).toBe(false)
  expect(readsThroughServerLoader({ serverLoad, serverLoadsRemote: true }, 'https://runtime.test')).toBe(true)
  expect(readsThroughServerLoader({}, undefined)).toBe(false)
  expect(readsThroughServerLoader({ serverLoadsRemote: true }, 'https://runtime.test')).toBe(false)
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

  expect((await load).data).toEqual({ hello: 'after the edit' })
  expect(translationStorage.getFromCache('en', 'stale-load')?.data).toEqual({ hello: 'after the edit' })
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

  expect((await translationStorage.load('de', 'added-at-runtime', options)).data).toEqual({ hello: 'root' })
  expect(fetchMock.mock.calls.map(([url]) => url)).toEqual(['/_locales/added-at-runtime/de/data.json', '/_locales/__root/de/data.json'])
  expect(translationStorage.getFromCache('de', 'added-at-runtime')).toBeNull()

  vi.stubGlobal(
    '$fetch',
    answering(() => ({ hello: 'page' })),
  )
  expect((await translationStorage.load('de', 'added-at-runtime', options)).data).toEqual({ hello: 'page' })
})

test("a static host's SPA shell in place of the page's file counts as no file", async () => {
  vi.stubGlobal(
    '$fetch',
    answering((url) => (url.includes('__root') ? { hello: 'root' } : '<!doctype html>')),
  )
  expect((await translationStorage.load('de', 'shell', options)).data).toEqual({ hello: 'root' })
})

test('no root file either (source mode on a file host) is an empty dictionary, not a failed load', async () => {
  vi.stubGlobal(
    '$fetch',
    answering(() => notFound()),
  )
  expect((await translationStorage.load('de', 'nothing', options)).data).toEqual({})
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
