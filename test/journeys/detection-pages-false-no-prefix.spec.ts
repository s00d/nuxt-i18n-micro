import { describe, test } from 'untestutils/vitest'
import { pagesFalseCookieCases } from '../helpers/journeys-b.ts'

describe('J5 detection: pages:false (pages-false-no-prefix, no_prefix)', () => {
  test.override({ harness: 'pages-false-no-prefix' })

  // was: pages-false-no-prefix › default render / cookie zh / invalid cookie
  test('PF-T2 locale from the cookie, invalid falls back to en', async ({ page, goto, baseURL }) => {
    await pagesFalseCookieCases(page, goto, baseURL)
  })
})
