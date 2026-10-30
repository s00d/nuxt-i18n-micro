import { describe, expect, test } from '../helpers/guarded-test.ts'

// J4 strategy-hashmode: the strategy fixture (pec) with router hashMode.
describe('journey: routing variants — hash mode', () => {
  test.override({ harness: 'strategy-hashmode' })

  test('switching locale writes it into the hash', async ({ page, goto }) => {
    // step 1: open / → hydrated, en
    await goto('/', { waitUntil: 'hydration' })
    await expect(page.locator('#locale')).toHaveText('en')
    await expect(page.locator('#content')).toHaveText('en')

    // step 2: $switchLocale('de') → URL has /#/de, locale and content de
    // was: hashmode › test language detection and locale handling in hash mode
    await page.click('#switch-de')
    await expect(page).toHaveURL(/\/#\/de$/)
    await expect(page.locator('#locale')).toHaveText('de')
    await expect(page.locator('#content')).toHaveText('de')
  })
})
