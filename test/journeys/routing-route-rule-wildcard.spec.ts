import { ssr } from '../helpers/journeys-b'
import { describe, expect, test } from '../helpers/guarded-test.ts'

describe('journey: a wildcard route rule follows custom paths', () => {
  test.override({ harness: 'strategy-prefix' })

  test('/contact/** reaches /de/kontakt', async ({ baseURL }) => {
    // step 1: every localized form of the page has the header, the German one has its own path
    for (const path of ['/en/contact', '/ru/contact', '/de/kontakt']) {
      const res = await ssr(baseURL, path)
      expect(res.status, path).toBe(200)
      expect(res.headers.get('x-section'), path).toBe('contact')
    }

    // step 2: a page outside the rule does not
    expect((await ssr(baseURL, '/de')).headers.get('x-section')).toBeNull()
  })
})
