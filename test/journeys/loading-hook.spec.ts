import { describe, expect, test } from '../helpers/guarded-test.ts'

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
})
