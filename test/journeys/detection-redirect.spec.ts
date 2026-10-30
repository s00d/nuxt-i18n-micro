import { getLocaleCookie } from 'untestutils/utils'
import { describe, expect, test } from '../helpers/guarded-test.ts'
import { ssr } from '../helpers/journeys-b.ts'

// strategy fixture, pec, autoDetectPath '*', cookie user-locale, excludePatterns ['/admin']
describe('J5 detection: Accept-Language redirect (strategy-redirect)', () => {
  test.override({ harness: 'strategy-redirect' })

  // was: redirect › language detection redirects based on Accept-Language
  test('R-T1 AL en-US moves /ru/contact to /contact', async ({ page, goto, baseURL }) => {
    // step 1: AL en-US, open /ru/contact → /contact, en locale
    await page.setExtraHTTPHeaders({ 'Accept-Language': 'en-US,en;q=0.9' })
    await goto('/ru/contact', { waitUntil: 'hydration' })
    await expect(page).toHaveURL('/contact')
    await expect(page.locator('.locale-value')).toHaveText('en')

    // step 1b: no cookie, open /de → / (the default locale has no prefix), and the redirect writes cookie en
    // was: cookie › /de → / + cookie en (cookie-default recipe)
    await page.context().clearCookies()
    await goto('/de', { waitUntil: 'hydration' })
    await expect(page).toHaveURL('/')
    await expect.poll(() => getLocaleCookie(page)).toBe('en')

    // step 1c: no header at all, nothing to detect: autoDetectPath '*' still falls through to the default
    // was: cookie › redirect to / and set default locale cookie when navigating to /de
    const bare = await ssr(baseURL, '/de')
    expect(bare.status).toBe(302)
    expect(new URL(bare.location!, baseURL).pathname).toBe('/')
    expect(bare.headers.get('set-cookie')).toContain('user-locale=en')

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
