import type { Page } from '@playwright/test'
import { getLocaleCookie } from 'untestutils/utils'
import { describe, expect, test } from '../helpers/guarded-test.ts'

const push = (page: Page, path: string) =>
  page.evaluate(
    (to) => (window as unknown as { useNuxtApp: () => { $router: { push: (path: string) => Promise<void> } } }).useNuxtApp().$router.push(to),
    path,
  )

describe('journey: no_prefix custom paths render their own locale', () => {
  test.override({ harness: 'strategy-no-prefix' })

  test('/kontakt is German for everyone', async ({ page, goto, baseURL }) => {
    const base = baseURL.replace(/\/$/, '')
    // step 1: no preference → de, lang and canonical of this URL
    await goto('/kontakt', { waitUntil: 'hydration' })
    await expect(page.locator('.locale-value')).toHaveText('de')
    await expect(page.locator('html')).toHaveAttribute('lang', 'de_DE')
    await expect(page.locator('link#i18n-can')).toHaveAttribute('href', `${base}/kontakt`)
    await expect(page.locator('.layout-title')).toHaveText('Meine App')

    // step 2: a stored en does not change it, and the browser agrees with the server
    await page.context().clearCookies()
    await page.context().addCookies([{ name: 'user-locale', value: 'en', url: baseURL }])
    await goto('/kontakt', { waitUntil: 'hydration' })
    await expect(page.locator('.locale-value')).toHaveText('de')
    await expect(page.locator('.layout-title')).toHaveText('Meine App')

    // step 3: the page's other URL keeps the preference
    await goto('/contact', { waitUntil: 'hydration' })
    await expect(page.locator('.locale-value')).toHaveText('en')
    await expect(page.locator('.layout-title')).toHaveText('My App')
  })

  test('a client navigation to a custom path keeps the preference', async ({ page, goto, baseURL }) => {
    await page.context().clearCookies()
    await page.context().addCookies([{ name: 'user-locale', value: 'en', url: baseURL }])

    // step 1: /contact in en, a client link to the German path → the page is German, the cookie stays en
    await goto('/contact', { waitUntil: 'hydration' })
    await expect(page.locator('.layout-title')).toHaveText('My App')
    await push(page, '/kontakt')
    await expect(page.locator('.layout-title')).toHaveText('Meine App')
    await expect(page.locator('.locale-value')).toHaveText('de')
    expect(await getLocaleCookie(page, 'user-locale')).toBe('en')

    // step 2: back on the shared path → the preference again, also after a reload
    await push(page, '/contact')
    await expect(page.locator('.layout-title')).toHaveText('My App')
    await expect(page.locator('.locale-value')).toHaveText('en')
    await page.reload()
    await expect(page.locator('.locale-value')).toHaveText('en')

    // step 3: a server render of the custom path does not pin the next page either
    await goto('/kontakt', { waitUntil: 'hydration' })
    await expect(page.locator('.locale-value')).toHaveText('de')
    await push(page, '/contact')
    await expect(page.locator('.layout-title')).toHaveText('My App')
    await expect(page.locator('.locale-value')).toHaveText('en')
    expect(await getLocaleCookie(page, 'user-locale')).toBe('en')
  })

  test('a path shared by locales renders the preference, on the server and after a switch', async ({ page, goto, baseURL, request }) => {
    const localeOf = async (headers: Record<string, string>, query = '') => {
      const response = await request.get(`/page/1${query}`, { headers })
      expect(response.status()).toBe(200)
      return /class="locale-value"[^>]*>([^<]*)</.exec(await response.text())?.[1]
    }
    // step 1: `en` and `de` both have /page/:id, so every way of naming a preference holds
    expect(await localeOf({ cookie: 'user-locale=de' })).toBe('de')
    expect(await localeOf({ 'accept-language': 'de' })).toBe('de')
    expect(await localeOf({}, '?locale=de')).toBe('de')
    expect(await localeOf({ cookie: 'user-locale=en', 'accept-language': 'de' })).toBe('en')
    // step 2: `ru` has no such path: the page keeps to the locales it has
    expect(await localeOf({ cookie: 'user-locale=ru' })).toBe('en')

    // step 3: the server and the browser agree, and `$switchLocale` works in place
    await page.context().clearCookies()
    await page.context().addCookies([{ name: 'user-locale', value: 'de', url: baseURL }])
    await goto('/page/1', { waitUntil: 'hydration' })
    await expect(page.locator('.locale-value')).toHaveText('de')
    await expect(page.locator('.layout-title')).toHaveText('Meine App')
    await page.locator('button[data-locale="en"]').click()
    await expect(page.locator('.locale-value')).toHaveText('en')
    await expect(page.locator('.layout-title')).toHaveText('My App')
    await expect(page).toHaveURL(/\/page\/1$/)
    await expect.poll(() => getLocaleCookie(page, 'user-locale')).toBe('en')
    await page.locator('button[data-locale="de"]').click()
    await expect(page.locator('.layout-title')).toHaveText('Meine App')
    await page.reload()
    await expect(page.locator('.locale-value')).toHaveText('de')
  })
})
