import { ssr } from '../helpers/journeys-b'
import { describe, expect, test } from '../helpers/guarded-test.ts'

describe('journey: a 404 page keeps the language', () => {
  test.override({ harness: 'strategy-prefix' })

  test('lang on <html> from the locale of the URL', async ({ baseURL }) => {
    // step 1: /de/nope → de_DE, no SEO tags
    const res = await ssr(baseURL, '/de/nope')
    expect(res.status).toBe(404)
    expect(res.html).toMatch(/<html[^>]* lang="de_DE"/)
    expect(res.html).not.toContain('i18n-can')
  })
})
