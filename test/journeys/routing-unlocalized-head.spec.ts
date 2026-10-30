import { describe, expect, test } from '../helpers/guarded-test.ts'

// strategy-region-codes: `page-b: false` is served in one form only.
describe('journey: an unlocalized page has no alternates', () => {
  test.override({ harness: 'strategy-region-codes' })

  test('no hreflang onto one URL', async ({ page, goto }) => {
    // step 1: the unlocalized page → canonical only
    await goto('/page-b', { waitUntil: 'hydration' })
    await expect(page.locator('link#i18n-can')).toHaveCount(1)
    await expect(page.locator('link[rel="alternate"]')).toHaveCount(0)

    // step 2: a localized page keeps them
    await goto('/page', { waitUntil: 'hydration' })
    await expect(page.locator('link[rel="alternate"]')).toHaveCount(4)
  })
})
