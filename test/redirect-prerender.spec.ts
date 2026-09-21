import { clearCookies, setLocaleCookie, trackResponses } from 'untestutils/utils'
import { describe, expect, test } from 'untestutils/vitest'

// ── prefix strategy: redirect at runtime (SSR server) ──────────────────────

describe('prefix strategy — runtime redirect from /', () => {
  test.override({ harness: 'strategy-prefix' })

  test('GET / returns 302 redirect to /en (no cookie)', async ({ page, goto }) => {
    await clearCookies(page)
    const tracked = trackResponses(page)

    await goto('/', { waitUntil: 'hydration' })

    await expect(page).toHaveURL('/en')
    await expect(page.locator('#content')).toHaveText('en')

    const rootResponse = tracked.findByPath('/')
    expect(rootResponse).toBeDefined()
    expect(rootResponse!.status).toBe(302)
    tracked.stop()
  })

  test('GET / with cookie=de redirects to /de', async ({ page, goto, baseURL }) => {
    await setLocaleCookie(page, baseURL!, 'de')
    const tracked = trackResponses(page)

    await goto('/', { waitUntil: 'hydration' })

    await expect(page).toHaveURL('/de')
    await expect(page.locator('#content')).toHaveText('de')

    const rootResponse = tracked.findByPath('/')
    expect(rootResponse).toBeDefined()
    expect(rootResponse!.status).toBe(302)
    tracked.stop()
  })

  test('GET /en does not redirect — stays on /en', async ({ page, goto }) => {
    await clearCookies(page)
    const tracked = trackResponses(page)

    await goto('/en', { waitUntil: 'hydration' })

    await expect(page).toHaveURL('/en')
    await expect(page.locator('#content')).toHaveText('en')

    const enResponse = tracked.findByPath('/en')
    expect(enResponse).toBeDefined()
    expect(enResponse!.status).toBe(200)
    tracked.stop()
  })

  test('GET /de does not redirect — stays on /de', async ({ page, goto }) => {
    await clearCookies(page)
    await goto('/de', { waitUntil: 'hydration' })
    await expect(page).toHaveURL('/de')
    await expect(page.locator('#content')).toHaveText('de')
  })

  test('GET /en/contact stays on /en/contact (200)', async ({ page, goto }) => {
    await clearCookies(page)
    const tracked = trackResponses(page)

    await goto('/en/contact', { waitUntil: 'hydration' })

    await expect(page).toHaveURL('/en/contact')

    const contactResponse = tracked.findByPath('/en/contact')
    expect(contactResponse).toBeDefined()
    expect(contactResponse!.status).toBe(200)
    tracked.stop()
  })
})
