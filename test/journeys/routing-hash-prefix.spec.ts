import { setLocaleCookie } from 'untestutils/utils'
import { ssr } from '../helpers/journeys-b'
import { describe, expect, test } from '../helpers/guarded-test.ts'

// hash mode under prefix: the route lives in the hash and `/` has no record, so the document is `/`
// and the client routes. A prefixed or deep document moves into the hash.
describe('journey: routing variants — hash mode + prefix', () => {
  test.override({ harness: 'strategy-hash-prefix' })

  test('the document is / and the hash routes', async ({ page, goto, baseURL }) => {
    // step 1: GET / → 200 shell, GET /about and /en → 302 into the hash
    expect((await ssr(baseURL, '/')).status).toBe(200)
    for (const [path, target] of [
      ['/about', '/#/about'],
      ['/en', '/#/en'],
    ]) {
      const res = await ssr(baseURL, path!)
      expect(res.status, path).toBe(302)
      expect(res.location, path).toBe(target)
      // the redirect is the same for every visitor
      expect(res.headers.get('vary') ?? '', path).not.toContain('Accept-Language')
    }

    // step 2: open / → /#/en, en
    await goto('/', { waitUntil: 'hydration' })
    await expect(page).toHaveURL(/\/#\/en$/)
    await expect(page.locator('#content')).toHaveText('en')

    // step 3: $switchLocale → /#/de, de
    await page.click('#switch-de')
    await expect(page).toHaveURL(/\/#\/de$/)
    await expect(page.locator('#locale')).toHaveText('de')
    await expect(page.locator('#content')).toHaveText('de')
  })

  test('a first visit takes the browser language', async ({ page, goto }) => {
    // step 1: no cookie, browser in German → /#/de
    await page.addInitScript(() => Object.defineProperty(navigator, 'languages', { get: () => ['de-DE', 'de'] }))
    await goto('/', { waitUntil: 'hydration' })
    await expect(page).toHaveURL(/\/#\/de$/)
    await expect(page.locator('#content')).toHaveText('de')
  })

  test('deep links and the stored locale', async ({ page, goto, baseURL }) => {
    // step 1: deep link /#/de/about → stays, shows the page, locale de
    await goto('/#/de/a-propos', { waitUntil: 'hydration' })
    await expect(page).toHaveURL(/\/#\/de\/a-propos$/)
    await expect(page.locator('body')).toContainText('About Page')
    await expect(page.locator('.locale-value')).toHaveText('de')

    // step 2: /#/en → en, whatever was stored
    await goto('/#/en', { waitUntil: 'hydration' })
    await expect(page.locator('#content')).toHaveText('en')

    // step 3: cookie de, / → /#/de
    await setLocaleCookie(page, baseURL, 'de', { name: 'hash-locale', clear: true })
    await goto('/', { waitUntil: 'hydration' })
    await expect(page).toHaveURL(/\/#\/de$/)
    await expect(page.locator('#content')).toHaveText('de')

    // step 4: an unprefixed deep document → the same page, in the stored locale
    await goto('/contact', { waitUntil: 'hydration' })
    await expect(page).toHaveURL(/\/#\/de\/kontakt$/)
    await expect(page.locator('#content')).toHaveText('contact')
  })
})
