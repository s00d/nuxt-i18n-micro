import { describe, expect, test } from 'untestutils/vitest'
import { ssr } from '../helpers/journeys-b.ts'

describe('J5 detection: Accept-Language redirect (redirect, pec, autoDetectPath *)', () => {
  test.override({ harness: 'redirect' })

  // was: redirect › language detection redirects based on Accept-Language
  test('R-T1 AL en-US moves /ru/page to /page', async ({ page, goto, baseURL }) => {
    // step 1: AL en-US, open /ru/page → /page, en content
    await page.setExtraHTTPHeaders({ 'Accept-Language': 'en-US,en;q=0.9' })
    await goto('/ru/page', { waitUntil: 'hydration' })
    await expect(page).toHaveURL('/page')
    await expect(page.locator('#locale')).toHaveText('en')

    // step 2 (F8): /de//evil.example moves to a path on this origin, never to //evil.example
    // (stateless requests: the redirect writes a cookie that would steer the next step)
    const evil = await ssr(baseURL, '/de//evil.example', { 'Accept-Language': 'en' })
    expect(evil.status).toBe(302)
    const target = new URL(evil.location!, baseURL)
    expect(target.host).toBe(new URL(baseURL).host)
    expect(target.pathname).toBe('/evil.example')

    // step 3 (F14): excludePatterns '/admin' leaves /administrator localized: AL de moves /ru/administrator to /de/administrator
    const admin = await ssr(baseURL, '/ru/administrator', { 'Accept-Language': 'de' })
    expect(admin.status).toBe(302)
    expect(new URL(admin.location!, baseURL).pathname).toBe('/de/administrator')
    expect((await ssr(baseURL, '/de/administrator', { 'Accept-Language': 'de' })).status).toBe(200)
  })
})
