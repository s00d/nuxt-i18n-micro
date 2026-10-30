import { describe, expect, test } from 'untestutils/vitest'

// J4 hashmode: router hashMode, pec, autoDetectLanguage.
describe('journey: routing variants — hash mode', () => {
  test.override({ harness: 'hashmode' })

  test('switching locale writes it into the hash', async ({ page, goto, baseURL }) => {
    // step 1: cookie user-locale=de set before the first request, open / → hydrated
    await page.context().addCookies([{ name: 'user-locale', value: 'de', url: baseURL }])
    await goto('/', { waitUntil: 'hydration' })

    // step 2: click #link-de → URL has /#/de, #locale de
    // was: hashmode › test language detection and locale handling in hash mode
    await page.click('#link-de')
    await expect(page).toHaveURL(/\/#\/de/)
    await expect(page.locator('#locale')).toHaveText('de')
  })
})
