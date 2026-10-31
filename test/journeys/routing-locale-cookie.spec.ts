import type { Page } from '@playwright/test'
import { ssr } from '../helpers/journeys-b'
import { describe, expect, test } from '../helpers/guarded-test.ts'

declare const useNuxtApp: () => {
  $router: { push: (to: string) => Promise<unknown>; beforeResolve: (guard: () => boolean) => void }
  $switchLocale: (locale: string) => Promise<boolean>
}

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

  test('a client navigation to a 404 shows its locale and stores nothing', async ({ page, goto, baseURL, guard }) => {
    guard.allow(/404/, /No match found/)
    await page.context().addCookies([{ name: 'user-locale', value: 'de', url: baseURL }])
    await goto('/de/page-b', { waitUntil: 'hydration' })
    await push(page, '/ru/nope-nothing')
    await expect(page.locator('#error-status')).toHaveText('404')
    await expect(page.locator('#error-locale')).toHaveText('ru')
    expect(await cookie(page)).toBe('de')
  })

  test.for(['#error-home', '#error-clear'])('%s leaves a 404 for a page, which stores its locale', async (control, { page, goto, guard }) => {
    guard.allow(/404/)
    // no such page in `de`: the page is restricted, the URL is a 404 of a known path
    await goto('/de/nope', { waitUntil: 'hydration' })
    await expect(page.locator('#error-status')).toHaveText('404')
    expect(await cookie(page)).toBeUndefined()
    await page.click(control)
    await expect(page).toHaveURL('/de')
    await expect(page.locator('#error-status')).toHaveCount(0)
    await expect.poll(() => cookie(page)).toBe('de')
  })

  test('a blocked $switchLocale leaves the stored preference', async ({ page, goto, baseURL }) => {
    await page.context().addCookies([{ name: 'user-locale', value: 'de', url: baseURL }])
    await goto('/contact', { waitUntil: 'hydration' })
    await page.evaluate(() => useNuxtApp().$router.beforeResolve(() => false))
    expect(await page.evaluate(() => useNuxtApp().$switchLocale('ru'))).toBe(false)
    await page.waitForTimeout(100)
    await expect(page).toHaveURL('/contact')
    await expect(page.locator('.locale-value')).toHaveText('en')
    expect(await cookie(page)).toBe('de')
  })

  test('$switchLocale stores the locale, and `/` then goes by it', async ({ page, goto, baseURL }) => {
    await page.context().addCookies([{ name: 'user-locale', value: 'de', url: baseURL }])
    await goto('/de', { waitUntil: 'hydration' })
    await page.evaluate(() => useNuxtApp().$switchLocale('en'))
    await expect(page).toHaveURL('/')
    await expect.poll(() => cookie(page)).toBe('en')
  })
})
