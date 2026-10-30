import { getLocaleCookie, setLocaleCookie } from 'untestutils/utils'
import { describe, expect, test } from '../helpers/guarded-test.ts'
import { ssr } from '../helpers/journeys-b'

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

  test('the hash and the cookie decide, never a redirect', async ({ page, goto, baseURL }) => {
    // step 1: deep link /#/de with no cookie → the URL the switch wrote shows de and stores the preference
    await goto('/#/de', { waitUntil: 'hydration' })
    await expect(page.locator('#locale')).toHaveText('de')
    await expect(page.locator('#content')).toHaveText('de')
    await expect(page).toHaveURL(/\/#\/de$/)
    await expect.poll(() => getLocaleCookie(page, 'hash-locale')).toBe('de')

    // step 2: the hash changes in the open document → ru
    await page.evaluate(() => {
      location.hash = '#/ru'
    })
    await expect(page.locator('#content')).toHaveText('ru')

    // step 3: / with cookie de → the server renders de on / instead of redirecting to /de#/
    const res = await ssr(baseURL, '/', { cookie: 'hash-locale=de' })
    expect(res.status).toBe(200)
    expect(res.html).toContain('<p id="content">de')

    // step 4: the same in the browser → stays on /, hydrates de
    await setLocaleCookie(page, baseURL, 'de', { name: 'hash-locale', clear: true })
    await goto('/', { waitUntil: 'hydration' })
    await expect(page).toHaveURL(/\/#\/$/)
    await expect(page.locator('#locale')).toHaveText('de')
    await expect(page.locator('#content')).toHaveText('de')
  })
})
