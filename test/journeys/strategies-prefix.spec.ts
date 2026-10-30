import { describe, expect, test } from '../helpers/guarded-test.ts'
import { collectHydrationIssues } from 'untestutils/utils'
import { directRoutes, forcedLocale, ssr, walkStrategy } from '../helpers/journeys-b.ts'

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

    // step 8: every localized URL on a direct cookie-less request → 200 and its content
    await directRoutes(baseURL, 'prefix')
  })

  // was: locale-state-prefix › *
  test('P-T2 forced locale: / redirects to /ru', async ({ page, goto }) => {
    await forcedLocale(page, goto, '/ru')
  })
})

describe('J2 strategies: prefix with runtime overrides (env default de, runtimeConfig disables ru)', () => {
  test.override({ harness: 'strategy-prefix-overrides' })

  test('P-T3 runtime overrides reach routing, server and client', async ({ page, goto, request, baseURL }) => {
    // step 1: GET / → 302 /de (runtime defaultLocale)
    const root = await request.get('/', { maxRedirects: 0 })
    expect(root.status()).toBe(302)
    expect(new URL(root.headers().location!, baseURL).pathname).toBe('/de')

    // step 2 (F1): the runtime-disabled /ru is a 404, not a page with raw keys
    expect((await request.get('/ru', { maxRedirects: 0 })).status()).toBe(404)

    // step 2b: the runtime default's payload is served
    // was: runtime-i18n-overrides.e2e › runtimeConfig overrides the default locale (step 2). Its step 3 (disabled
    // payload 404) needed the locale disabled at build time too: here ru's premerged file is in public/ and served as is.
    const de = await request.get('/_locales/index/de/data.json')
    expect(de.status()).toBe(200)
    expect(await de.json()).toMatchObject({ key0: 'de' })

    // step 3 (F11): the client sees the same config: de content, no ru in the switcher, no hydration mismatch
    const issues = collectHydrationIssues(page)
    await goto('/', { waitUntil: 'hydration' })
    await expect(page).toHaveURL('/de')
    await expect(page.locator('#content')).toHaveText('de')
    await page.click('.language-switcher')
    await expect(page.locator('a.switcher-locale-en')).toBeVisible()
    await expect(page.locator('a.switcher-locale-ru')).toHaveCount(0)
    issues.stop()
    expect(issues.messages).toEqual([])
  })
})
