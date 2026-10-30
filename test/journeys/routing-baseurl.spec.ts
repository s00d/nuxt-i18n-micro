import { describe, expect, test } from 'untestutils/vitest'

// J4 baseurl-prefix: app.baseURL '/examples', prefix strategy, default ja (#234).
describe('journey: routing variants — app.baseURL + prefix', () => {
  test.override({ harness: 'baseurl-prefix' })

  test('/examples redirects once to the default locale, no loop', async ({ page, goto, request }) => {
    // step 1: GET /examples → one 3xx to /examples/ja, and the target serves 200 (no second hop)
    // was: baseurl-prefix-redirect › GET /examples redirects once to /examples/ja without loop
    const root = await request.get('/examples', { maxRedirects: 0 })
    expect(root.status()).toBeGreaterThanOrEqual(300)
    expect(root.status()).toBeLessThan(400)
    expect(new URL(root.headers().location!, 'http://x').pathname).toBe('/examples/ja')
    // step 2: GET /examples/ja → 200 without a redirect
    // was: baseurl-prefix-redirect › GET /examples/ja serves page without redirect
    expect((await request.get('/examples/ja', { maxRedirects: 0 })).status()).toBe(200)

    // step 3: open /examples in the browser → /examples/ja, ja content
    await goto('/examples', { waitUntil: 'hydration' })
    await expect(page).toHaveURL('/examples/ja')
    await expect(page.locator('#content')).toHaveText('home (ja)')

    // step 4: open /examples/en → en content
    // was: baseurl-prefix-redirect › GET /examples/en serves English locale without redirect loop
    await goto('/examples/en', { waitUntil: 'hydration' })
    await expect(page).toHaveURL('/examples/en')
    await expect(page.locator('#content')).toHaveText('home (en)')
  })
})
