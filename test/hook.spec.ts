import { describe, expect, test } from 'untestutils/vitest'

describe('hook', () => {
  test.override({ harness: 'hook' })
  test('hook value and locale switch', async ({ page, goto }) => {
    await goto('/', { waitUntil: 'hydration' })
    await expect(page.locator('#hook')).toHaveText('hook value')

    await page.click('#test-page')
    await expect(page.locator('#text')).toHaveText('hook en title')

    await page.click('.language-switcher')
    await page.click('a.switcher-locale-de')
    await expect(page.locator('#hook')).toHaveText('hook value')
    await expect(page.locator('#text')).toHaveText('hook de title')
  })
})
