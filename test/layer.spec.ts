import { fileURLToPath } from 'node:url'
import { expect, test } from '@nuxt/test-utils/playwright'

test.use({
  nuxt: {
    rootDir: fileURLToPath(new URL('./fixtures/layer', import.meta.url)),
  },
})
test.describe('layer', () => {
  test('test layer', async ({ page, goto }) => {
    await goto('/', { waitUntil: 'hydration' })
    await expect(page.locator('#replace')).toHaveText('replaced text in en')

    await expect(page.locator('#layer')).toHaveText('layer text')
    await expect(page.locator('#basic_layer')).toHaveText('page basic text')
    await expect(page.locator('#basic')).toHaveText('basic text')
    await expect(page.locator('#page_layer')).toHaveText('page layer text')

    const response = await page.goto('/de', { waitUntil: 'networkidle' })
    expect(response?.status()).toBe(404)

    await goto('/ru', { waitUntil: 'hydration' })
    await expect(page.locator('#locale')).toHaveText('new ru')
  })
})
