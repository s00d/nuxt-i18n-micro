import { describe, expect, test } from '../helpers/guarded-test.ts'

declare const useNuxtApp: () => { $t: (key: string) => unknown }

// basic: a local module (modules/hook) adds /test and an `i18n:register` plugin; an app plugin registers `hook`.
describe('J8 translation loading: module hook', () => {
  test.override({ harness: 'basic-serverless' })

  // was: hook › hook value and locale switch
  test('page added by a module gets translations, plugin survives a switch', async ({ page, goto }) => {
    // step 1: open /cache → plugin value
    await goto('/cache', { waitUntil: 'hydration' })
    await expect(page.locator('#hook')).toHaveText('hook value')

    // step 2: go to the module page → en title
    await page.click('#test-page')
    await expect(page.locator('#text')).toHaveText('hook en title')

    // step 3: switch to de → plugin value kept, de title
    await page.click('.language-switcher')
    await page.click('a.switcher-locale-de')
    await expect(page.locator('#hook')).toHaveText('hook value')
    await expect(page.locator('#text')).toHaveText('hook de title')
  })

  test('a failed chunk leaves the strings in place, though a subscriber wrote into it', async ({ page, goto, guard }) => {
    guard.allow(/Failed to load resource.*\/_locales\//)
    await goto('/cache', { waitUntil: 'hydration' })
    const welcome = await page.locator('#welcome').textContent()
    expect(welcome?.trim()).not.toBe('welcome')
    await page.route('**/_locales/Test/**', (route) => route.abort())
    await page.click('#test-page')
    await expect(page).toHaveURL('/test')
    expect(await page.evaluate(() => useNuxtApp().$t('welcome'))).toBe(welcome?.trim())
  })
})
