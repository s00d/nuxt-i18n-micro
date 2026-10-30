import { describe, expect, test } from 'untestutils/vitest'

describe('J8 translation loading: layer', () => {
  test.override({ harness: 'basic-layer' })

  // was: layer › test layer
  test('layer overrides, disabled locale 404, layer-only locale', async ({ page, goto, request }) => {
    // step 1: open / → layer and base texts merged, layer wins
    await goto('/', { waitUntil: 'hydration' })
    await expect(page.locator('#replace')).toHaveText('replaced text in en')
    await expect(page.locator('#layer')).toHaveText('layer text')
    await expect(page.locator('#basic_layer')).toHaveText('page basic text')
    await expect(page.locator('#basic')).toHaveText('basic text')
    await expect(page.locator('#page_layer')).toHaveText('page layer text')

    // step 2: GET /de (disabled in the layer) → 404
    expect((await request.get('/de', { maxRedirects: 0 })).status()).toBe(404)

    // step 3: open /ru → locale text from the layer
    await goto('/ru', { waitUntil: 'hydration' })
    await expect(page.locator('#locale')).toHaveText('new ru')
  })
})
