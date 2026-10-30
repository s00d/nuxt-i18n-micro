import { describe, expect, test } from '../helpers/guarded-test.ts'

// `es` has `disabled: true` in the config, so it has no records.
describe('journey: a locale disabled at build', () => {
  test.override({ harness: 'strategy-disabled-locale' })

  test('its prefix is a direct 404', async ({ page, goto, request }) => {
    // step 1: no redirect to /en/es on the way
    for (const path of ['/es', '/es/about']) expect((await request.get(path, { maxRedirects: 0 })).status(), path).toBe(404)

    // step 2: the switcher does not offer it
    await goto('/en', { waitUntil: 'hydration' })
    await expect(page.locator('.switcher-locale-es')).toHaveCount(0)
    await expect(page.locator('.switcher-locale-de')).toHaveAttribute('href', '/de')
  })
})
