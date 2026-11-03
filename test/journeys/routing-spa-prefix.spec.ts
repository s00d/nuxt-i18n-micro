import { describe, expect, test } from '../helpers/guarded-test.ts'

// ssr: false under prefix: no server answers `/`, so the first navigation is the one that redirects.
describe('journey: routing variants — SPA + prefix', () => {
  test.override({ harness: 'strategy-spa-prefix' })

  test('unprefixed URLs redirect on the client', async ({ page, goto, baseURL }) => {
    // step 1: / → /en, en content
    await goto('/', { waitUntil: 'hydration' })
    await expect(page).toHaveURL('/en')
    await expect(page.locator('#content')).toHaveText('en')

    // step 2: a deep unprefixed URL → its page in the default locale
    await goto('/contact', { waitUntil: 'hydration' })
    await expect(page).toHaveURL('/en/contact')
    await expect(page.locator('#content')).toHaveText('contact')

    // step 3: a prefixed URL stays
    await goto('/de', { waitUntil: 'hydration' })
    await expect(page).toHaveURL('/de')
    await expect(page.locator('#content')).toHaveText('de')

    // step 4: a stored preference decides for /
    await page.context().clearCookies()
    await page.context().addCookies([{ name: 'user-locale', value: 'ru', url: baseURL }])
    await goto('/', { waitUntil: 'hydration' })
    await expect(page).toHaveURL('/ru')
    await expect(page.locator('#content')).toHaveText('ru')
  })
})
