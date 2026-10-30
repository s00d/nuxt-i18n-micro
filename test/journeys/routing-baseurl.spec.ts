import { describe, expect, test } from '../helpers/guarded-test.ts'

// J4 strategy-baseurl: the strategy fixture under prefix with app.baseURL '/examples' (#234).
describe('journey: routing variants — app.baseURL + prefix', () => {
  test.override({ harness: 'strategy-baseurl' })

  test('/examples redirects once to the default locale, no loop', async ({ page, goto, request }) => {
    // step 1: GET /examples → one 3xx to /examples/en, and the target serves 200 (no second hop)
    // was: baseurl-prefix-redirect › GET /examples redirects once to /examples/ja without loop
    const root = await request.get('/examples', { maxRedirects: 0 })
    expect(root.status()).toBeGreaterThanOrEqual(300)
    expect(root.status()).toBeLessThan(400)
    expect(new URL(root.headers().location!, 'http://x').pathname).toBe('/examples/en')
    // step 2: GET /examples/en → 200 without a redirect
    // was: baseurl-prefix-redirect › GET /examples/ja serves page without redirect
    expect((await request.get('/examples/en', { maxRedirects: 0 })).status()).toBe(200)

    // step 3: open /examples in the browser → /examples/en, en content
    await goto('/examples', { waitUntil: 'hydration' })
    await expect(page).toHaveURL('/examples/en')
    await expect(page.locator('#content')).toHaveText('en')

    // step 4: open /examples/de → de content
    // was: baseurl-prefix-redirect › GET /examples/en serves English locale without redirect loop
    await goto('/examples/de', { waitUntil: 'hydration' })
    await expect(page).toHaveURL('/examples/de')
    await expect(page.locator('#content')).toHaveText('de')
  })
})
