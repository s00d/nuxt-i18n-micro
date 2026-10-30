import { ssr } from '../helpers/journeys-b'
import { describe, expect, test } from '../helpers/guarded-test.ts'

describe('journey: only a served page writes the locale cookie', () => {
  test.override({ harness: 'strategy-prefix' })

  test('a 404 under a prefix leaves the cookie alone', async ({ baseURL }) => {
    // step 1: /de/nope → 404, no Set-Cookie for the locale
    const missing = await ssr(baseURL, '/de/nope', { cookie: 'user-locale=en' })
    expect(missing.status).toBe(404)
    expect(missing.headers.get('set-cookie') ?? '').not.toContain('user-locale')

    // step 2: a page in that locale writes it
    const served = await ssr(baseURL, '/de', { cookie: 'user-locale=en' })
    expect(served.status).toBe(200)
    expect(served.headers.get('set-cookie')).toContain('user-locale=de')
  })
})
