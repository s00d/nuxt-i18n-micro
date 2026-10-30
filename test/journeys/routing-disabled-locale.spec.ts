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

  // was: runtime-i18n-overrides.e2e › serves enabled locale payloads and rejects disabled locales
  test('it serves no translations: no public payload, and the handler refuses', async ({ request }) => {
    expect((await request.get('/_locales/index/en/data.json')).status()).toBe(200)
    for (const path of ['/_locales/index/es/data.json', '/_locales/about/es/data.json']) {
      const res = await request.get(path)
      expect(res.status(), path).toBe(404)
      expect(res.statusText(), path).toBe('Locale not found')
    }
  })
})
