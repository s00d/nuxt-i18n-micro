import { describe, expect, test } from 'untestutils/vitest'

// J4 custom-regex: pec with codes en-us / de-de / ru-ru and customRegexMatcher.
// Only the steps that depend on the regex codes; the rest is pinned on `basic`.
describe('journey: routing variants — customRegexMatcher', () => {
  test.override({ harness: 'custom-regex' })

  test('regex locale codes: 404, index, head, links, /page switch', async ({ page, goto, request, baseURL }) => {
    const base = baseURL.replace(/\/$/, '')

    // step 1: GET /un-kn (does not match the regex) → 404
    // was: custom-regex › test 404 on unknown locale
    expect((await request.get('/un-kn')).status()).toBe(404)

    // step 2: open / → en; open /de-de → de
    // was: custom-regex › test index
    await goto('/', { waitUntil: 'hydration' })
    await expect(page.locator('#locale')).toHaveText('en')

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
    await expect(page.locator('#locale')).toHaveText('de')
    await expect(page.locator('meta#i18n-og')).toHaveAttribute('content', 'de_DE')
    await expect(page.locator('meta#i18n-og-url')).toHaveAttribute('content', `${base}/de-de`)
    await expect(page.locator('meta#i18n-og-alt-en_EN')).toHaveAttribute('content', 'en_EN')
    await expect(page.locator('meta#i18n-og-alt-ru_RU')).toHaveAttribute('content', 'ru_RU')
    await expect(page.locator('link#i18n-can')).toHaveAttribute('href', `${base}/de-de`)
    await expect(page.locator('link#i18n-alternate-en_EN')).toHaveAttribute('href', base)
    await expect(page.locator('link#i18n-alternate-de_DE')).toHaveAttribute('href', `${base}/de-de`)
    await expect(page.locator('link#i18n-alternate-ru_RU')).toHaveAttribute('href', `${base}/ru-ru`)

    // step 4: /dir1/test and /de-de/dir1/test → link text per locale
    // was: custom-regex › test links
    await goto('/dir1/test', { waitUntil: 'hydration' })
    await expect(page.locator('#test_link')).toHaveText('link in en')
    await goto('/de-de/dir1/test', { waitUntil: 'hydration' })
    await expect(page.locator('#test_link')).toHaveText('link in de')

    // step 5: /page → en-us label, locale list, localized route; #link-de → /de-de/page; #link-en → /page
    // was: custom-regex › test plugin methods output on page, › test locale switching on page, › test locale switching via links
    await goto('/page', { waitUntil: 'hydration' })
    await expect(page.locator('#locale')).toHaveText('Current Locale: en-us')
    await expect(page.locator('#locales')).toHaveText('en-us, de-de, ru-ru')
    await expect(page.locator('#translation')).toHaveText('Page example in en')
    await expect(page.locator('#localized-route')).toHaveText('/de-de/page')
    await page.click('#link-de')
    await expect(page).toHaveURL('/de-de/page')
    await expect(page.locator('#locale')).toHaveText('Current Locale: de-de')
    await expect(page.locator('#translation')).toHaveText('Page example in de')
    await expect(page.locator('#plural')).toHaveText('2 Äpfel')
    await expect(page.locator('#localized-route')).toHaveText('/de-de/page')
    await page.click('#link-en')
    await expect(page).toHaveURL('/page')
    await expect(page.locator('#locale')).toHaveText('Current Locale: en-us')
  })

  test('regex locale codes: page-level routes, global routes, news and articles', async ({ page, goto, request }) => {
    // step 1: /locale-test #link-de href → click → /de-de/locale-page-modify, de content
    // was: custom-regex › test locale switching on locale-test page
    await goto('/locale-test', { waitUntil: 'hydration' })
    await expect(page.locator('h1')).toHaveText('Locale Test Page')
    await expect(page.locator('#link-de')).toHaveAttribute('href', '/de-de/locale-page-modify')
    await page.click('#link-de')
    await expect(page).toHaveURL('/de-de/locale-page-modify')
    await expect(page.locator('h1')).toHaveText('Sprachtestseite')
    await expect(page.locator('#content')).toHaveText('Dies ist ein Inhaltsbereich.')
    await expect(page.locator('#username')).toHaveText('Hallo, John!')
    await expect(page.locator('#plural')).toHaveText('Sie haben 2 Artikel.')
    await expect(page.locator('#html-content')).toHaveText('Fetter Text mit HTML-Inhalt.')

    // step 2: globalLocaleRoutes with regex prefixes; /unlocalized stays; GET /de-de/unlocalized → 404
    // was: custom-regex › Test globalLocaleRoutes for page2 and unlocalized
    for (const url of ['/custom-page2-en', '/de-de/custom-page2-de', '/ru-ru/custom-page2-ru', '/unlocalized']) {
      await goto(url, { waitUntil: 'hydration' })
      await expect(page).toHaveURL(url)
    }
    expect((await request.get('/de-de/unlocalized')).status()).toBe(404)

    // step 3: news and articles locale links → /ru-ru/…, /de-de/…
    // was: custom-regex › test navigation and locale switching on news page, › … on articles page
    await goto('/news/4', { waitUntil: 'hydration' })
    await page.click('.locale-en')
    await expect(page).toHaveURL('/news/4')
    await page.click('.locale-ru')
    await expect(page).toHaveURL('/ru-ru/news/4')
    await page.click('.locale-de')
    await expect(page).toHaveURL('/de-de/news/4')
    await goto('/articles/1', { waitUntil: 'hydration' })
    await expect(page.locator('.article-id')).toHaveText('id: 1')
    await page.click('.locale-ru')
    await expect(page).toHaveURL('/ru-ru/articles/1')
    await page.click('.locale-de')
    await expect(page).toHaveURL('/de-de/articles/1')

    // step 4: /locale-conf #locale-de → /de-de/locale-conf-modify, de content
    // was: custom-regex › test locale switching and content on locale-conf page
    await goto('/locale-conf', { waitUntil: 'hydration' })
    await expect(page.locator('h1')).toHaveText('Locale Test Page')
    await expect(page.locator('#locale-en')).toHaveAttribute('href', '/locale-conf')
    await expect(page.locator('#locale-de')).toHaveAttribute('href', '/de-de/locale-conf-modify')
    await page.click('#locale-de')
    await expect(page).toHaveURL('/de-de/locale-conf-modify')
    await expect(page.locator('h1')).toHaveText('Sprachtestseite')
    await expect(page.locator('#username')).toHaveText('Hallo, John!')
    await expect(page.locator('#html-content')).toContainText('Fetter Text mit HTML-Inhalt.')
    await expect(page.locator('#locale-de')).toHaveAttribute('href', '/de-de/locale-conf-modify')
  })
})
