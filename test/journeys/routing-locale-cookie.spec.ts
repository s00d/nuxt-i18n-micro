import type { Page } from '@playwright/test'
import { ssr } from '../helpers/journeys-b'
import { describe, expect, test } from '../helpers/guarded-test.ts'

declare const useNuxtApp: () => { $router: { push: (to: string) => Promise<unknown> } }

const cookie = async (page: Page) => (await page.context().cookies()).find((entry) => entry.name === 'user-locale')?.value
const push = (page: Page, to: string) =>
  page.evaluate((path) => {
    void useNuxtApp().$router.push(path)
  }, to)

describe('journey: only a served page writes the locale cookie', () => {
  test.override({ harness: 'strategy-prefix' })

  test('a 404 under a prefix leaves the cookie alone', async ({ baseURL }) => {
    // step 1: /de/nope → 404, no Set-Cookie for the locale
    const missing = await ssr(baseURL, '/de/nope', { cookie: 'user-locale=en' })
    expect(missing.status).toBe(404)
    expect(missing.headers.get('set-cookie') ?? '').not.toContain('user-locale')

    // step 2: a page in that locale writes it
    const served = await ssr(baseURL, '/de', { cookie: 'user-locale=en' })
    expect(served.status).toBe(200)
    expect(served.headers.get('set-cookie')).toContain('user-locale=de')
  })

  test('a malformed cookie is ignored: it does not stop a page storing its locale, and a 404 stores nothing', async ({ baseURL }) => {
    const malformed = { cookie: 'user-locale=%E0%A4%A' }
    const served = await ssr(baseURL, '/de', malformed)
    expect(served.status).toBe(200)
    expect(served.headers.get('set-cookie')).toContain('user-locale=de')
    expect(served.headers.get('set-cookie')).not.toContain('Max-Age=0')

    const missing = await ssr(baseURL, '/de/nope', malformed)
    expect(missing.status).toBe(404)
    expect(missing.headers.get('set-cookie') ?? '').not.toContain('user-locale')
  })

  test('a client navigation from a 404 stores the page it reaches', async ({ page, goto, guard }) => {
    guard.allow(/404/)
    // the server set the locale state and no cookie: the state alone cannot tell that nothing is stored
    await goto('/de/nope', { waitUntil: 'hydration' })
    expect(await cookie(page)).toBeUndefined()
    await push(page, '/de/page-b')
    await expect.poll(() => cookie(page)).toBe('de')
  })
})

describe('journey: a client navigation stores the locale of its page', () => {
  test.override({ harness: 'strategy-prefix-except-default' })

  test('an unprefixed page of the default locale, once navigated to, but not on load', async ({ page, goto, baseURL }) => {
    await page.context().addCookies([{ name: 'user-locale', value: 'de', url: baseURL }])
    // step 1: a load of the unprefixed URL leaves the preference: it is what `/` goes by
    await goto('/contact', { waitUntil: 'hydration' })
    await page.waitForTimeout(100)
    expect(await cookie(page)).toBe('de')

    // step 2: navigating to a page of the default locale is the visitor's move, as on a prefixed page
    await push(page, '/page-b')
    await expect.poll(() => cookie(page)).toBe('en')
  })
})
