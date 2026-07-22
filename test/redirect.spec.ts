import { describe, expect, setupE2E, test } from './setup/vitest-e2e'

await setupE2E({ shared: 'redirect' })

describe('redirect', () => {
  test('test language detection and redirect based on navigator.languages', async ({ page, goto }) => {
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
    })

    // Navigate to main page
    await goto('/ru/page', { waitUntil: 'hydration' })

    const currentURL = page.url()

    expect(new URL(currentURL).pathname).toBe('/page')

    await expect(page.locator('#locale')).toHaveText('en')
  })
})
