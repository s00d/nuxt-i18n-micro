import { describe, expect, test } from '../helpers/guarded-test.ts'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
const FAILED_PAYLOAD = /Failed to load resource.*\/_locales\//

// `strategy-prefix`: app.vue renders root keys around every page, so a layout string shows the root is in
describe('root + delta in a browser', () => {
  test.override({ harness: 'strategy-prefix' })

  test('the page hints both files, and hydrates on them', async ({ page, goto, request }) => {
    const html = await (await request.get('/en')).text()
    expect(html).toMatch(/<link[^>]*__root\/en\/data\.json/)
    expect(html).toMatch(/<link[^>]*\/index\/en\/data\.json/)
    await goto('/en', { waitUntil: 'hydration' })
    await expect(page.locator('.page-welcome')).not.toHaveText('page.welcome')
  })

  test('the root files reach the browser with a mark, a page with no key of its own is next to nothing', async ({ request }) => {
    const root = await (await request.get('/_locales/__root/en/data.json')).json()
    expect(root.__i18n_root).toMatch(/^[0-9a-f]{8}$/)
    const delta = await (await request.get('/_locales/unlinked/en/data.json')).json()
    expect(delta.__i18n_root).toBe(root.__i18n_root)
  })

  test.for(['__root', 'about'])('%s landing last on a navigation shows no raw key', async (late, { page, goto }) => {
    await page.route(`**/_locales/${late}/de/**`, async (route) => {
      await delay(400)
      await route.fallback()
    })
    await goto('/de', { waitUntil: 'hydration' })
    await page.locator('#about').click()
    await expect(page).toHaveURL(/\/de\/a-propos/)
    await expect(page.locator('body')).not.toContainText('page.welcome')
    expect(await page.locator('body').innerText()).not.toMatch(/\bkey\d+\b/)
  })

  test('the first load of a locale with a late root: the switch waits, no raw key', async ({ page, goto }) => {
    await page.route('**/_locales/__root/de/**', async (route) => {
      await delay(400)
      await route.fallback()
    })
    await goto('/en', { waitUntil: 'hydration' })
    await page.locator('#switch-de').click()
    await expect(page.locator('#locale')).toHaveText('de')
    expect(await page.locator('body').innerText()).not.toMatch(/\bkey\d+\b/)
  })

  test('a failed root keeps the page, the next try loads', async ({ page, goto, guard }) => {
    guard.allow(FAILED_PAYLOAD)
    let failing = true
    await page.route('**/_locales/__root/de/**', (route) => (failing ? route.abort() : route.fallback()))
    await goto('/en', { waitUntil: 'hydration' })
    await page.locator('#switch-de').click()
    await expect(page.locator('#locale')).toHaveText('en')
    failing = false
    // a click during the failed load joins it, so the test clicks until a click starts its own
    await expect(async () => {
      await page.locator('#switch-de').click()
      await expect(page.locator('#locale')).toHaveText('de', { timeout: 500 })
    }).toPass()
  })

  test('$clearCache brings root and delta back', async ({ page, goto }) => {
    await goto('/en', { waitUntil: 'hydration' })
    const before = await page.locator('.page-welcome').textContent()
    await page.evaluate(() => (window as unknown as { useNuxtApp: () => { $clearCache: () => void } }).useNuxtApp().$clearCache())
    await expect(page.locator('.page-welcome')).toHaveText(before!)
  })
})
