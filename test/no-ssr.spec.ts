import { describe, expect, setupE2E, test } from './setup/vitest-e2e'

await setupE2E({ shared: 'basic-no-ssr' })

describe('no-ssr', () => {
  test('no-ssr test', async ({ page, goto }) => {
    await goto('/', { waitUntil: 'hydration' })
    await expect(page.locator('#locale')).toHaveText('en')

    await goto('/de', { waitUntil: 'hydration' })
    await expect(page.locator('#locale')).toHaveText('de')
  })
})
