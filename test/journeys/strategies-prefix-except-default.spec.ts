import { describe, expect, test } from 'untestutils/vitest'
import { forcedLocale, walkStrategy } from '../helpers/journeys-b.ts'

describe('J2 strategies: prefix_except_default', () => {
  test.override({ harness: 'strategy-prefix-except-default' })

  // was: prefix-except-default › navigate/switch
  test('PEC-T1 walk: default unprefixed, /en is 404', async ({ page, goto, request }) => {
    // steps 1–5: shared walk
    await walkStrategy(page, goto, { home: '/', contact: '/contact', deHome: '/de', deContact: '/de/kontakt' })

    // step 6: GET /en → 404 (was: goto('/en', networkidle) status 404)
    const en = await request.get('/en', { maxRedirects: 0 })
    expect(en.status()).toBe(404)

    // step 7: /de stays /de
    await goto('/de', { waitUntil: 'hydration' })
    await expect(page).toHaveURL('/de')
  })

  // was: locale-state-prefix-except-default › *
  test('PEC-T2 forced locale: / redirects to /ru', async ({ page, goto }) => {
    await forcedLocale(page, goto, '/ru')
  })
})
