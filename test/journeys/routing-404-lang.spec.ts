import { ssr } from '../helpers/journeys-b'
import { describe, expect, test } from '../helpers/guarded-test.ts'

describe('journey: a 404 page keeps the language', () => {
  test.override({ harness: 'strategy-prefix' })

  test('lang on <html> from the locale of the URL', async ({ baseURL }) => {
    // step 1: /de/nope → de_DE, no SEO tags
    const res = await ssr(baseURL, '/de/nope', { accept: 'text/html' })
    expect(res.status).toBe(404)
    expect(res.html).toMatch(/<html[^>]* lang="de_DE"/)
    expect(res.html).not.toContain('i18n-can')
  })

  test('a case variant of a prefix is a 404, not the page in another language, not a redirect', async ({ baseURL }) => {
    // `/ru/about` exists, `/de/about` has a custom path
    for (const path of ['/RU/about', '/DE/about']) {
      const res = await ssr(baseURL, path, { accept: 'text/html' })
      expect(res.status, path).toBe(404)
      expect(res.location, path).toBeNull()
      expect(res.html, path).not.toContain('i18n-can')
    }
  })
})
