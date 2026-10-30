import { afterEach, expect, test, vi } from 'vitest'
import { STORAGE_CC_KEY } from '../../src/runtime/utils/cache-keys'
import { translationStorage } from '../../src/runtime/utils/storage'

const options = { apiBaseUrl: '_locales', baseURL: '/' }

afterEach(() => {
  vi.unstubAllGlobals()
  translationStorage.clear()
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
