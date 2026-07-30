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

  it('returns empty object when fetch fails', async () => {
    const fetcher = vi.fn().mockRejectedValue(new Error('404'))
    await expect(
      fetchTranslationPayloadFromHost(
        {
          apiBaseUrl: '_locales',
          apiBaseServerHost: 'https://cdn.example.com',
        },
        'en',
        'index',
        fetcher,
      ),
    ).resolves.toEqual({})
  })
})
