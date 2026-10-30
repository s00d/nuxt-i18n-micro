import { describe, expect, test } from 'untestutils/vitest'

describe('J5 detection: Accept-Language redirect (redirect, pec, autoDetectPath *)', () => {
  test.override({ harness: 'redirect' })

  // was: redirect › language detection redirects based on Accept-Language
  test('R-T1 AL en-US moves /ru/page to /page', async ({ page, goto }) => {
    // step 1: AL en-US, open /ru/page → /page, en content
    await page.setExtraHTTPHeaders({ 'Accept-Language': 'en-US,en;q=0.9' })
    await goto('/ru/page', { waitUntil: 'hydration' })
    await expect(page).toHaveURL('/page')
    await expect(page.locator('#locale')).toHaveText('en')
  })
})
