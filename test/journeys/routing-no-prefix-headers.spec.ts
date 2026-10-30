import { ssr } from '../helpers/journeys-b'
import { describe, expect, test } from '../helpers/guarded-test.ts'

describe('journey: no_prefix responses', () => {
  test.override({ harness: 'strategy-no-prefix' })

  test('one URL for every visitor: Vary, no cookie from a 404, route rules on custom paths', async ({ baseURL }) => {
    // step 1: every page depends on the visitor
    for (const path of ['/', '/contact', '/administrator']) {
      const res = await ssr(baseURL, path)
      expect(res.headers.get('vary'), path).toContain('Cookie')
      expect(res.headers.get('vary'), path).toContain('Accept-Language')
    }

    // step 2: a locale-shaped URL is a 404 and does not touch the cookie
    const missing = await ssr(baseURL, '/en', { cookie: 'user-locale=de' })
    expect(missing.status).toBe(404)
    expect(missing.headers.get('set-cookie') ?? '').not.toContain('user-locale')

    // step 3: a wildcard rule reaches the custom path of its page
    expect((await ssr(baseURL, '/kontakt')).headers.get('x-section')).toBe('contact')
  })
})
