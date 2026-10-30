import { describe, expect, test } from 'untestutils/vitest'
import { forcedLocale, ssr, walkStrategy } from '../helpers/journeys-b.ts'

describe('J2 strategies: prefix', () => {
  test.override({ harness: 'strategy-prefix' })

  // was: prefix › navigate/switch, redirect-prerender › *, redirect-security › GET / → /en, prefix › redirect with cookie
  test('P-T1 walk and redirects', async ({ page, goto, request, baseURL }) => {
    // step 0: GET / → 302 to /en while the render:response header plugin runs
    // was: redirect-prerender › GET / 302 → /en; redirect-security › no header mutation error
    const root = await request.get('/', { maxRedirects: 0 })
    expect(root.status()).toBe(302)
    expect(new URL(root.headers().location!, baseURL).pathname).toBe('/en')

    // steps 1–5: shared walk (was: prefix › no cookie uses defaultLocale)
    await walkStrategy(page, goto, { home: '/en', contact: '/en/contact', deHome: '/de', deContact: '/de/kontakt' })

    // step 6: /en, /de, /en/contact answer 200 without redirect (was: redirect-prerender › /en, /de, /en/contact)
    for (const path of ['/en', '/de', '/en/contact']) {
      const res = await request.get(path, { maxRedirects: 0 })
      expect(res.status(), path).toBe(200)
      expect(res.headers()['x-security-test'], path).toBe('1')
    }
    await goto('/en', { waitUntil: 'hydration' })
    await expect(page).toHaveURL('/en')
    await goto('/de', { waitUntil: 'hydration' })
    await expect(page).toHaveURL('/de')

    // step 7: cookie de → GET / 302 to /de; the browser lands on /de with de content
    // was: prefix › redirect with cookie, no error flash (the `if (rootResponse)` guard is now a real 302)
    const withCookie = await ssr(baseURL, '/', { Cookie: 'user-locale=de' })
    expect(withCookie.status).toBe(302)
    expect(new URL(withCookie.location!, baseURL).pathname).toBe('/de')
    await page.context().clearCookies()
    await page.context().addCookies([{ name: 'user-locale', value: 'de', url: baseURL }])
    await goto('/', { waitUntil: 'hydration' })
    await expect(page).toHaveURL('/de')
    await expect(page.locator('#content')).toHaveText('de')
  })

  // was: locale-state-prefix › *
  test('P-T2 forced locale: / redirects to /ru', async ({ page, goto }) => {
    await forcedLocale(page, goto, '/ru')
  })
})
