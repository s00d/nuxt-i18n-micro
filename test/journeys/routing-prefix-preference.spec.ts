import { getLocaleCookie } from 'untestutils/utils'
import { ssr } from '../helpers/journeys-b'
import { describe, expect, test } from '../helpers/guarded-test.ts'

// Under prefix no page has an unprefixed URL, so such a URL always takes the visitor's locale.
describe('journey: prefix keeps the chosen locale on unprefixed links', () => {
  test.override({ harness: 'strategy-prefix' })

  test('a plain link from /de stays German', async ({ page, goto, baseURL }) => {
    // step 1: /de, click a plain NuxtLink to /about → the German page, the cookie stays de
    await goto('/de', { waitUntil: 'hydration' })
    await page.click('#plain-about')
    await expect(page).toHaveURL('/de/a-propos')
    expect(await getLocaleCookie(page, 'user-locale')).toBe('de')

    // step 2: the same URL on the server, cookie de → the German page
    const german = await ssr(baseURL, '/about', { cookie: 'user-locale=de' })
    expect(german.status).toBe(302)
    expect(new URL(german.location!, baseURL).pathname).toBe('/de/a-propos')

    // step 3: no preference → the default locale
    const plain = await ssr(baseURL, '/about')
    expect(new URL(plain.location!, baseURL).pathname).toBe('/en/about')
  })
})
