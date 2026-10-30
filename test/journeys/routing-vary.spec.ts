import { ssr } from '../helpers/journeys-b'
import { describe, expect, test } from '../helpers/guarded-test.ts'

// pec with Accept-Language detection: `/` answers by the visitor, a prefixed URL does not.
describe('journey: a CDN keeps the answers apart', () => {
  test.override({ harness: 'strategy-prefix-except-default' })

  test('Vary on what the visitor decides, nowhere else', async ({ baseURL }) => {
    // step 1: / with no preference → 200 that a cookie would have redirected
    const plain = await ssr(baseURL, '/')
    expect(plain.status).toBe(200)
    expect(plain.headers.get('vary')).toContain('Cookie')
    expect(plain.headers.get('vary')).toContain('Accept-Language')

    // step 2: / with a cookie → 302 with the same Vary
    const redirected = await ssr(baseURL, '/', { cookie: 'user-locale=de' })
    expect(redirected.status).toBe(302)
    expect(redirected.headers.get('vary')).toContain('Cookie')
    expect(redirected.headers.get('vary')).toContain('Accept-Language')

    // step 3: a prefixed URL and a deep unprefixed URL answer the same to everyone
    for (const path of ['/de', '/contact']) expect((await ssr(baseURL, path)).headers.get('vary') ?? '', path).not.toContain('Cookie')
  })
})
