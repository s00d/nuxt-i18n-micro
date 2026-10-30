import { describe, test } from '../helpers/guarded-test.ts'
import { pagesFalseCookieCases, pagesFalseSwitch } from '../helpers/journeys-b.ts'

describe('J5 detection: pages:false (basic, BASIC_VARIANT=pages-false, STRATEGY=no_prefix)', () => {
  test.override({ harness: 'basic-pages-false-no-prefix' })

  // was: pages-false-no-prefix › default render / cookie zh / invalid cookie
  test('PF-T2 locale from the cookie, invalid falls back to en', async ({ page, goto, baseURL }) => {
    await pagesFalseCookieCases(page, goto, baseURL)
  })

  test('PF-T3 $switchLocale keeps the URL: the cookie carries the locale', async ({ page, goto }) => {
    await pagesFalseSwitch(page, goto, { link: '/', path: '/about', url: '/' })
  })
})
