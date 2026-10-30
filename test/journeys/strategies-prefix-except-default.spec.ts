import { describe, expect, test } from 'untestutils/vitest'
import { directRoutes, forcedLocale, ssr, walkStrategy } from '../helpers/journeys-b.ts'

describe('J2 strategies: prefix_except_default', () => {
  test.override({ harness: 'strategy-prefix-except-default' })

  // was: prefix-except-default › navigate/switch
  test('PEC-T1 walk: default unprefixed, /en is 404', async ({ page, goto, request, baseURL }) => {
    // steps 1–5: shared walk
    await walkStrategy(page, goto, { home: '/', contact: '/contact', deHome: '/de', deContact: '/de/kontakt' })

    // step 6: GET /en → 404 (was: goto('/en', networkidle) status 404)
    const en = await request.get('/en', { maxRedirects: 0 })
    expect(en.status()).toBe(404)

    // step 7: /de stays /de
    await goto('/de', { waitUntil: 'hydration' })
    await expect(page).toHaveURL('/de')

    // step 8: every localized URL on a direct cookie-less request → 200 and its content
    await directRoutes(baseURL, 'prefix_except_default')
  })

  test('PEC-T3 the URL decides the page locale; bad cookies are absent', async ({ baseURL }) => {
    // step 1 (F9): /?locale=de stays on / and renders en — the redirect and the render agree
    const home = await ssr(baseURL, '/?locale=de')
    expect(home.status).toBe(200)
    expect(home.html).toMatch(/id="content"[^>]*>\s*en\s*</)

    // step 2 (F2): an unprefixed page with ?locale=de is the en page, <html lang> included
    const contact = await ssr(baseURL, '/contact?locale=de')
    expect(contact.status).toBe(200)
    expect(contact.html).toMatch(/<html[^>]*lang="en/)

    // step 3 (F7): a malformed locale cookie is no cookie, not a 500
    const bad = await ssr(baseURL, '/', { Cookie: 'user-locale=%E0%A4%A' })
    expect(bad.status).toBe(200)
    expect(bad.html).toMatch(/id="content"[^>]*>\s*en\s*</)
  })

  // was: locale-state-prefix-except-default › *
  test('PEC-T2 forced locale: / redirects to /ru', async ({ page, goto }) => {
    await forcedLocale(page, goto, '/ru')
  })
})
