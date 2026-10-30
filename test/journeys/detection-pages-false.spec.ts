import { describe, expect, test } from '../helpers/guarded-test.ts'
import { pagesFalseCookieCases, ssr } from '../helpers/journeys-b.ts'

describe('J5 detection: pages:false (basic, BASIC_VARIANT=pages-false, pec)', () => {
  test.override({ harness: 'basic-pages-false' })

  // was: pages-false › default render / cookie zh / invalid cookie / cleared cookie
  test('PF-T1 locale from the cookie, invalid falls back to en', async ({ page, goto, baseURL }) => {
    await pagesFalseCookieCases(page, goto, baseURL)
  })

  test('PF-T2 a prefixed URL stores the locale: there are no records to miss', async ({ baseURL }) => {
    const res = await ssr(baseURL, '/zh', { accept: 'text/html' })
    expect(res.headers.get('set-cookie')).toContain('user-locale=zh')
  })
})
