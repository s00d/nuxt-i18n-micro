import { fetchTranslationPayloadFromHost } from '../src/payload-fetch'
import { describe, expect, it, vi } from 'vitest'

describe('fetchTranslationPayloadFromHost', () => {
  it('returns parsed translations on success', async () => {
    const fetcher = vi.fn().mockResolvedValue({ greeting: 'Hello' })

    await expect(
      fetchTranslationPayloadFromHost(
        {
          apiBaseUrl: '_locales',
          apiBaseServerHost: 'https://cdn.example.com',
          dateBuild: 42,
        },
        'en',
        'index',
        fetcher,
      ),
    ).resolves.toEqual({ greeting: 'Hello' })

    expect(fetcher).toHaveBeenCalledWith('/_locales/index/en/data.json', {
      baseURL: 'https://cdn.example.com',
      params: { v: 42 },
    })
  })

  it('returns empty object when host is not configured', async () => {
    const fetcher = vi.fn()
    await expect(fetchTranslationPayloadFromHost({ apiBaseUrl: '_locales' }, 'en', 'index', fetcher)).resolves.toEqual({})
    expect(fetcher).not.toHaveBeenCalled()
  })

  const fetchWith = (fetcher: never) =>
    fetchTranslationPayloadFromHost({ apiBaseUrl: '_locales', apiBaseServerHost: 'https://cdn.example.com' }, 'en', 'index', fetcher)

  it('reads a 404 as null: the host has no such file, which an empty dictionary is not', async () => {
    const fetcher = vi.fn().mockRejectedValue(Object.assign(new Error('not found'), { status: 404 }))
    await expect(fetchWith(fetcher as never)).resolves.toBeNull()
  })

  it.each([
    ['a 502', Object.assign(new Error('bad gateway'), { status: 502 })],
    ['a network error', new Error('ECONNREFUSED')],
  ])('rethrows %s: a failed load must reach no cache', async (_name, error) => {
    await expect(fetchWith(vi.fn().mockRejectedValue(error) as never)).rejects.toBe(error)
  })

  it.each([
    ['an HTML fallback', '<!doctype html>'],
    ['an array', ['x']],
    ['null', null],
    ['false', false],
    ['0', 0],
  ])('rejects a 200 with %s', async (_name, body) => {
    await expect(fetchWith(vi.fn().mockResolvedValue(body) as never)).rejects.toThrow('Invalid translation payload')
  })

  it.each([undefined, ''])('reads an empty 200 (%j) as an empty dictionary', async (body) => {
    await expect(fetchWith(vi.fn().mockResolvedValue(body) as never)).resolves.toEqual({})
  })
})
