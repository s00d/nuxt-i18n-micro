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

  test('a case variant of a prefix moves to the page in its own spelling, or is a 404 with none', async ({ baseURL }) => {
    // `/ru/about` exists
    const moved = await ssr(baseURL, '/RU/about', { accept: 'text/html' })
    expect(moved.status).toBe(302)
    expect(new URL(moved.location!, baseURL).pathname).toBe('/ru/about')
    const missing = await ssr(baseURL, '/DE/nope', { accept: 'text/html' })
    expect(missing.status).toBe(404)
    expect(missing.location).toBeNull()
    expect(missing.html).not.toContain('i18n-can')
  })
})
