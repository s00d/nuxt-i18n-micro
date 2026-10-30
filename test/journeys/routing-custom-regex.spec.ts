import { describe, expect, test } from '../helpers/guarded-test.ts'

// strategy fixture, pec, REGION_CODES=1: codes en-us / de-de / ru-ru and customRegexMatcher '[a-z]{2}-[a-z]{2}'.
// Only the steps that depend on the regex codes; the rest is pinned on `basic` and the other strategy recipes.
describe('journey: routing variants — customRegexMatcher', () => {
  test.override({ harness: 'strategy-region-codes' })

  test('regex locale codes: 404, index, head, switch', async ({ page, goto, request, baseURL }) => {
    const base = baseURL.replace(/\/$/, '')

    // step 1: GET /un-kn (does not match the regex) → 404
    // was: custom-regex › test 404 on unknown locale
    expect((await request.get('/un-kn')).status()).toBe(404)

    // step 1b: a real page shaped like a locale is that page
    await goto('/go-on', { waitUntil: 'hydration' })
    await expect(page.locator('#go-on')).toHaveText('go-on')

    // step 2: open / → en text, the full code from $getLocale, every code in $getLocales
    // was: custom-regex › test index; › test plugin methods output on page (#locale, #locales, #translation)
    await goto('/', { waitUntil: 'hydration' })
    await expect(page.locator('#content')).toHaveText('en')
    await expect(page.locator('#locale')).toHaveText('en-us')
    // the page file of the code (locales/pages/index/en-us.json) beats the root key
    await expect(page.locator('.page-welcome')).toHaveText('Welcome en-us')
    expect(await page.locator('[data-locale]').evaluateAll((els) => els.map((el) => el.getAttribute('data-locale')))).toEqual([
      'en-us',
      'de-de',
      'ru-ru',
    ])

    // step 3: head on / → og en_EN, canonical and alternates use /de-de, /ru-ru
    // was: custom-regex › test head (the /ru-ru round is the same pattern and is dropped)
    await expect(page.locator('meta#i18n-og')).toHaveAttribute('content', 'en_EN')
    await expect(page.locator('meta#i18n-og-url')).toHaveAttribute('content', base)
    await expect(page.locator('meta#i18n-og-alt-de_DE')).toHaveAttribute('content', 'de_DE')
    await expect(page.locator('meta#i18n-og-alt-ru_RU')).toHaveAttribute('content', 'ru_RU')
    await expect(page.locator('link#i18n-can')).toHaveAttribute('href', base)
    await expect(page.locator('link#i18n-alternate-en_EN')).toHaveAttribute('href', base)
    await expect(page.locator('link#i18n-alternate-de_DE')).toHaveAttribute('href', `${base}/de-de`)
    await expect(page.locator('link#i18n-alternate-ru_RU')).toHaveAttribute('href', `${base}/ru-ru`)

    await goto('/de-de', { waitUntil: 'hydration' })
    await expect(page.locator('#content')).toHaveText('de')
    await expect(page.locator('.page-welcome')).toHaveText('Willkommen de-de')
    await expect(page.locator('meta#i18n-og')).toHaveAttribute('content', 'de_DE')
    await expect(page.locator('meta#i18n-og-url')).toHaveAttribute('content', `${base}/de-de`)
    await expect(page.locator('meta#i18n-og-alt-en_EN')).toHaveAttribute('content', 'en_EN')
    await expect(page.locator('meta#i18n-og-alt-ru_RU')).toHaveAttribute('content', 'ru_RU')
    await expect(page.locator('link#i18n-can')).toHaveAttribute('href', `${base}/de-de`)
    await expect(page.locator('link#i18n-alternate-en_EN')).toHaveAttribute('href', base)
    await expect(page.locator('link#i18n-alternate-de_DE')).toHaveAttribute('href', `${base}/de-de`)
    await expect(page.locator('link#i18n-alternate-ru_RU')).toHaveAttribute('href', `${base}/ru-ru`)

    // step 4: the switcher on / → en-us goes back to /, de-de to /de-de with de content
    // was: custom-regex › test locale switching on page, › test locale switching via links
    await goto('/', { waitUntil: 'hydration' })
    await page.click('#locale-switcher button')
    await expect(page.locator('.switcher-locale-de-de')).toHaveAttribute('href', '/de-de')
    await page.click('.switcher-locale-de-de')
    await expect(page).toHaveURL('/de-de')
    await expect(page.locator('#locale')).toHaveText('de-de')
    await expect(page.locator('#content')).toHaveText('de')
    await page.click('#locale-switcher button')
    await page.click('.switcher-locale-en-us')
    await expect(page).toHaveURL('/')
    await expect(page.locator('#locale')).toHaveText('en-us')
  })

  test('regex locale codes: page-level routes, global routes, dynamic params', async ({ page, goto, request }) => {
    // step 1: /contact → $defineI18nRoute path for de-de in the switcher → click → /de-de/kontakt
    // was: custom-regex › test locale switching on locale-test page; › … content on locale-conf page
    await goto('/contact', { waitUntil: 'hydration' })
    await page.click('#locale-switcher button')
    await expect(page.locator('.switcher-locale-de-de')).toHaveAttribute('href', '/de-de/kontakt')
    await page.click('.switcher-locale-de-de')
    await expect(page).toHaveURL('/de-de/kontakt')
    await expect(page.locator('.locale-value')).toHaveText('de-de')

    // step 2: globalLocaleRoutes with regex prefixes; page-b (false) stays; GET /de-de/page-b → 404
    // was: custom-regex › Test globalLocaleRoutes for page2 and unlocalized
    for (const url of ['/custom-a-en', '/de-de/custom-a-de', '/ru-ru/custom-a-ru', '/page-b']) {
      await goto(url, { waitUntil: 'hydration' })
      await expect(page).toHaveURL(url)
    }
    expect((await request.get('/de-de/page-b')).status()).toBe(404)

    // step 3: a dynamic page keeps its param through $switchLocale → /ru-ru/test-4, /de-de/test-4, /test-4
    // was: custom-regex › test navigation and locale switching on news page, › … on articles page
    await goto('/test-4', { waitUntil: 'hydration' })
    await page.click('[data-locale="ru-ru"]')
    await expect(page).toHaveURL('/ru-ru/test-4')
    await page.click('[data-locale="de-de"]')
    await expect(page).toHaveURL('/de-de/test-4')
    await page.click('[data-locale="en-us"]')
    await expect(page).toHaveURL('/test-4')
  })
})
