import { describe, expect, test } from 'untestutils/vitest'

describe('no-ssr', () => {
  test.override({ harness: 'basic-no-ssr' })
  test('no-ssr test', async ({ page, goto }) => {
    await goto('/', { waitUntil: 'hydration' })
    await expect(page.locator('#locale')).toHaveText('en')

    await goto('/de', { waitUntil: 'hydration' })
    await expect(page.locator('#locale')).toHaveText('de')
  })
})
