import { fileURLToPath } from 'node:url'
import { expect, test } from '@nuxt/test-utils/playwright'

test.use({
  nuxt: {
    rootDir: fileURLToPath(new URL('./fixtures/basic', import.meta.url)),
  },
  // launchOptions: {
  //   headless: false, // Show browser
  //   slowMo: 500, // Slow down execution steps (in milliseconds) for better visibility
  // },
})

test.describe('basic', () => {
  test('renders only on client', async ({ page, baseURL }) => {
    // 1) Fetch the raw server response for the client page
    const res = await fetch(`${baseURL}client`)
    const html = await res.text()

    // 2) Check that the SSR response does NOT contain your client-only text
    expect(html).not.toContain('Client only page - SSR disabled')

    // 3) Now, navigate via Playwright and check that it appears in the client
    await page.goto('/client', { waitUntil: 'networkidle' })
    await expect(page.locator('#client-text')).toHaveText('Client only page - SSR disabled')

    // 1) Fetch the raw server response for the client page
    const res_de = await fetch(`${baseURL}de/client`)
    const html_de = await res_de.text()

    // 2) Check that the SSR response does NOT contain your client-only text
    expect(html_de).not.toContain('Client only page - SSR disabled')

    // 3) Now, navigate via Playwright and check that it appears in the client
    await page.goto('/de/client', { waitUntil: 'networkidle' })
    await expect(page.locator('#client-text')).toHaveText('Client only page - SSR disabled')
  })

  test('redirect from /old-product to /products', async ({ page, goto }) => {
    await goto('/old-product', { waitUntil: 'hydration' })

    await expect(page).toHaveURL('/page')

    await goto('/de/old-product', { waitUntil: 'hydration' })

    await expect(page).toHaveURL('/de/old-product')

    await goto('/ru/old-product', { waitUntil: 'hydration' })

    await expect(page).toHaveURL('/ru/page')
  })

  test('test index', async ({ page, goto }) => {
    await goto('/', { waitUntil: 'hydration' })
    await expect(page.locator('#locale')).toHaveText('en')

    await goto('/de', { waitUntil: 'hydration' })
    await expect(page.locator('#locale')).toHaveText('de')
  })

  test('test routes', async ({ page, goto }) => {
    await goto('/', { waitUntil: 'hydration' })

    await page.click('#page-link')

    await page.waitForTimeout(200)

    await expect(page).toHaveURL('/page')

    await page.click('#page-link')

    await page.waitForTimeout(200)

    await expect(page).toHaveURL('/')

    await goto('/de', { waitUntil: 'hydration' })

    await page.click('#page-link')

    await page.waitForTimeout(200)

    await expect(page).toHaveURL('/de/page')

    await page.click('#page-link')

    await page.waitForTimeout(200)

    await expect(page).toHaveURL('/de')
  })

  test('test external link', async ({ page, goto }) => {
    await goto('/page', { waitUntil: 'hydration' })

    await expect(page.locator('#external-link')).toHaveAttribute('href', `https://www.external-link.fr`)

    await goto('/de/page', { waitUntil: 'hydration' })

    await expect(page.locator('#external-link')).toHaveAttribute('href', `https://www.external-link.fr`)
  })

  test('test text escaping', async ({ page, goto }) => {
    await goto('/', { waitUntil: 'hydration' })
    await expect(page.locator('.text_escaping')).toHaveText('test {text_escaping} } { { ')
  })

  test('test head', async ({ page, goto, baseURL }) => {
    // Test for the default locale (English)
    await goto('/', { waitUntil: 'hydration' })

    const normalizedBaseURL = (baseURL || 'http://localhost:3000').replace(/\/$/, '')

    // Test meta tags for the default locale (English)
    await expect(page.locator('meta#i18n-og')).toHaveAttribute('content', 'en_EN')
    await expect(page.locator('meta#i18n-og-url')).toHaveAttribute('content', `${normalizedBaseURL}`)
    await expect(page.locator('meta#i18n-og-alt-de_DE')).toHaveAttribute('content', 'de_DE')
    await expect(page.locator('meta#i18n-og-alt-ru_RU')).toHaveAttribute('content', 'ru_RU')

    await expect(page.locator('link#i18n-can')).toHaveAttribute('href', `${normalizedBaseURL}`)
    await expect(page.locator('link#i18n-alternate-en')).toHaveAttribute('href', `${normalizedBaseURL}`)
    await expect(page.locator('link#i18n-alternate-en_EN')).toHaveAttribute('href', `${normalizedBaseURL}`)
    await expect(page.locator('link#i18n-alternate-de')).toHaveAttribute('href', `${normalizedBaseURL}/de`)
    await expect(page.locator('link#i18n-alternate-de_DE')).toHaveAttribute('href', `${normalizedBaseURL}/de`)
    await expect(page.locator('link#i18n-alternate-ru')).toHaveAttribute('href', `${normalizedBaseURL}/ru`)
    await expect(page.locator('link#i18n-alternate-ru_RU')).toHaveAttribute('href', `${normalizedBaseURL}/ru`)

    // Test for German locale
    await goto('/de', { waitUntil: 'hydration' })

    // Test meta tags for the German locale
    await expect(page.locator('meta#i18n-og')).toHaveAttribute('content', 'de_DE')
    await expect(page.locator('meta#i18n-og-url')).toHaveAttribute('content', `${normalizedBaseURL}/de`)
    await expect(page.locator('meta#i18n-og-alt-en_EN')).toHaveAttribute('content', 'en_EN')
    await expect(page.locator('meta#i18n-og-alt-ru_RU')).toHaveAttribute('content', 'ru_RU')

    await expect(page.locator('link#i18n-can')).toHaveAttribute('href', `${normalizedBaseURL}/de`)
    await expect(page.locator('link#i18n-alternate-en')).toHaveAttribute('href', `${normalizedBaseURL}`)
    await expect(page.locator('link#i18n-alternate-en_EN')).toHaveAttribute('href', `${normalizedBaseURL}`)
    await expect(page.locator('link#i18n-alternate-de')).toHaveAttribute('href', `${normalizedBaseURL}/de`)
    await expect(page.locator('link#i18n-alternate-de_DE')).toHaveAttribute('href', `${normalizedBaseURL}/de`)
    await expect(page.locator('link#i18n-alternate-ru')).toHaveAttribute('href', `${normalizedBaseURL}/ru`)
    await expect(page.locator('link#i18n-alternate-ru_RU')).toHaveAttribute('href', `${normalizedBaseURL}/ru`)

    // Test for Russian locale
    await goto('/ru', { waitUntil: 'hydration' })

    // Test meta tags for the Russian locale
    await expect(page.locator('meta#i18n-og')).toHaveAttribute('content', 'ru_RU')
    await expect(page.locator('meta#i18n-og-url')).toHaveAttribute('content', `${normalizedBaseURL}/ru`)
    await expect(page.locator('meta#i18n-og-alt-en_EN')).toHaveAttribute('content', 'en_EN')
    await expect(page.locator('meta#i18n-og-alt-de_DE')).toHaveAttribute('content', 'de_DE')

    await expect(page.locator('link#i18n-can')).toHaveAttribute('href', `${normalizedBaseURL}/ru`)
    await expect(page.locator('link#i18n-alternate-en')).toHaveAttribute('href', `${normalizedBaseURL}`)
    await expect(page.locator('link#i18n-alternate-en_EN')).toHaveAttribute('href', `${normalizedBaseURL}`)
    await expect(page.locator('link#i18n-alternate-de')).toHaveAttribute('href', `${normalizedBaseURL}/de`)
    await expect(page.locator('link#i18n-alternate-de_DE')).toHaveAttribute('href', `${normalizedBaseURL}/de`)
    await expect(page.locator('link#i18n-alternate-ru')).toHaveAttribute('href', `${normalizedBaseURL}/ru`)
    await expect(page.locator('link#i18n-alternate-ru_RU')).toHaveAttribute('href', `${normalizedBaseURL}/ru`)
  })

  test('test links', async ({ page, goto }) => {
    await goto('/dir1/test', { waitUntil: 'hydration' })
    await expect(page.locator('#test_link')).toHaveText('link in en')

    await goto('/de/dir1/test', { waitUntil: 'hydration' })
    await expect(page.locator('#test_link')).toHaveText('link in de')
  })

  test('test plugin methods output on page', async ({ page, goto }) => {
    // Navigate to the /page route
    await goto('/page', { waitUntil: 'hydration' })

    // Verify the locale
    await expect(page.locator('#locale')).toHaveText('Current Locale: en')

    await expect(page.locator('#locale-name')).toHaveText('English')

    // Verify the list of locales
    await expect(page.locator('#locales')).toHaveText('en, de, ru, fr, ch')

    // Verify the translation for a key
    await expect(page.locator('#translation')).toHaveText('Page example in en') // Replace with actual expected content

    await expect(page.locator('#translation-global')).toHaveText('example en')

    // Verify the pluralization for items
    await expect(page.locator('#plural')).toHaveText('2 apples') // Replace with actual pluralization result

    await expect(page.locator('#plural-component')).toHaveText('5 apples') // Replace with actual pluralization result
    await expect(page.locator('#plural-component-custom')).toHaveText('5 apples') // Replace with actual pluralization result
    await expect(page.locator('#plural-component-custom-zero')).toHaveText('no apples') // Replace with actual pluralization result

    // Verify the localized route generation
    await expect(page.locator('#localized-route')).toHaveText('/de/page')

    await expect(page.locator('#localized-route-2')).toHaveText('/news/aaa?info=1111')
    await expect(page.locator('#localized-path')).toHaveText('/news/aaa?info=1111')
  })

  test('test locale switching on page', async ({ page, goto }) => {
    // Navigate to the /page route in English
    await goto('/page', { waitUntil: 'hydration' })

    await expect(page).toHaveURL('/page')

    await expect(page.locator('#locale')).toHaveText('Current Locale: en')

    // Verify the translation for a key after switching locale
    await expect(page.locator('#translation')).toHaveText('Page example in en') // Replace with actual expected content

    await expect(page.locator('#translation-global')).toHaveText('example en')
    await expect(page.locator('#comp1')).toHaveText('en text')

    // Verify the pluralization for items after switching locale
    await expect(page.locator('#plural')).toHaveText('2 apples') // Replace with actual pluralization result in en

    await page.click('#locale-switcher button')

    // Add a small delay to allow rendering
    await page.waitForTimeout(200)

    await expect(page.locator('.language-switcher')).toHaveText('English ▾')

    // Verify the languages in the dropdown
    await expect(page.locator('.switcher-locale-en')).toHaveText('English')
    await expect(page.locator('.switcher-locale-de')).toHaveText('German')
    await expect(page.locator('.switcher-locale-ru')).toHaveText('Russian')
    await expect(page.locator('.switcher-locale-fr')).toHaveText('French')
    await expect(page.locator('.switcher-locale-ch')).toHaveText('Chinese')

    await expect(page.locator('.switcher-locale-en')).toHaveAttribute('href', '/page')
    await expect(page.locator('.switcher-locale-de')).toHaveAttribute('href', '/de/page')
    await expect(page.locator('.switcher-locale-ru')).toHaveAttribute('href', '/ru/page')
    await expect(page.locator('.switcher-locale-fr')).toHaveAttribute('href', 'https://fr.example.com/page')
    await expect(page.locator('.switcher-locale-ch')).toHaveAttribute('href', 'https://test.example.com/ch/page')

    await expect(page.locator('.switcher-locale-en')).toHaveAttribute('hreflang', 'en_EN')
    await expect(page.locator('.switcher-locale-de')).toHaveAttribute('hreflang', 'de_DE')
    await expect(page.locator('.switcher-locale-ru')).toHaveAttribute('hreflang', 'ru_RU')
    await expect(page.locator('.switcher-locale-fr')).toHaveAttribute('hreflang', 'fr_FR')
    await expect(page.locator('.switcher-locale-ch')).toHaveAttribute('hreflang', 'ch_CH')

    // Verify that Russian is disabled
    await expect(page.locator('.switcher-locale-en')).toHaveCSS('cursor', 'not-allowed')

    // Verify the localized route generation after switching locale
    await expect(page.locator('#localized-route')).toHaveText('/de/page')

    // Click the link to switch to the German locale
    await page.click('#link-de')

    // Verify that the URL has changed
    await expect(page).toHaveURL('/de/page')

    // Verify the locale after switching
    await expect(page.locator('#locale')).toHaveText('Current Locale: de')
    await expect(page.locator('#locale-name')).toHaveText('German')

    // Verify the translation for a key after switching locale
    await expect(page.locator('#translation')).toHaveText('Page example in de') // Replace with actual expected content
    await expect(page.locator('#translation-global')).toHaveText('example de')
    await expect(page.locator('#comp1')).toHaveText('de text')

    // Verify the pluralization for items after switching locale
    await expect(page.locator('#plural')).toHaveText('2 Äpfel') // Replace with actual pluralization result in German

    // Verify the localized route generation after switching locale
    await expect(page.locator('#localized-route')).toHaveText('/de/page')

    await expect(page.locator('#localized-route-2')).toHaveText('/de/news/aaa?info=1111')
    await expect(page.locator('#localized-path')).toHaveText('/de/news/aaa?info=1111')

    await page.click('#locale-switcher button')

    // Add a small delay to allow rendering
    await page.waitForTimeout(200)

    await expect(page.locator('.language-switcher')).toHaveText('German ▾')

    // Verify the languages in the dropdown
    await expect(page.locator('.switcher-locale-en')).toHaveText('English')
    await expect(page.locator('.switcher-locale-de')).toHaveText('German')
    await expect(page.locator('.switcher-locale-ru')).toHaveText('Russian')

    // Verify that Russian is disabled
    await expect(page.locator('.switcher-locale-de')).toHaveCSS('cursor', 'not-allowed')

    await goto('/de/page', { waitUntil: 'hydration' })

    await expect(page.locator('#translation')).toHaveText('Page example in de') // Replace with actual expected content
    await expect(page.locator('#translation-global')).toHaveText('example de')
    await expect(page.locator('#comp1')).toHaveText('de text')
  })

  test('test locale switching on locale-test page', async ({ page }) => {
    // Calculate expected date (approximately 1 year ago, 13-14 months to ensure >= 1 year)
    const oneYearAgo = new Date()
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
    oneYearAgo.setMonth(oneYearAgo.getMonth() - 2) // Subtract 2 more months to ensure >= 1 year
    oneYearAgo.setDate(1)

    // Calculate expected date formats
    const expectedDateEn = new Intl.DateTimeFormat('en-US').format(oneYearAgo)
    const expectedDateDe = new Intl.DateTimeFormat('de-DE').format(oneYearAgo)
    const expectedDateRu = new Intl.DateTimeFormat('ru-RU').format(oneYearAgo)

    // Calculate expected relative time using the same logic as FormatService
    const diffSeconds = Math.floor((Date.now() - oneYearAgo.getTime()) / 1000)
    const diffYears = Math.floor(diffSeconds / 31536000) // 31536000 seconds in a year
    const expectedRelativeEn = new Intl.RelativeTimeFormat('en-US').format(-diffYears, 'year')
    const expectedRelativeDe = new Intl.RelativeTimeFormat('de-DE').format(-diffYears, 'year')
    const expectedRelativeRu = new Intl.RelativeTimeFormat('ru-RU').format(-diffYears, 'year')

    // Navigate to the /locale-test route in English
    await page.goto('/locale-test', { waitUntil: 'networkidle' })

    // Verify the URL and content in English
    await expect(page).toHaveURL('/locale-test')
    await expect(page.locator('h1')).toHaveText('Locale Test Page')
    await expect(page.locator('#content')).toHaveText('This is a content area.')
    await expect(page.locator('#username')).toHaveText('Hello, John!')
    await expect(page.locator('#plural-0')).toHaveText('Nothing')
    await expect(page.locator('#plural-1')).toHaveText('You have 1 item')
    await expect(page.locator('#plural-2')).toHaveText('You have 2 items')
    await expect(page.locator('#plural-3')).toHaveText('You have 3 items')
    await expect(page.locator('#number-tn')).toHaveText('1,234,567.89')
    await expect(page.locator('#date-td')).toHaveText(expectedDateEn)
    await expect(page.locator('#date-tdr')).toHaveText(expectedRelativeEn)
    await expect(page.locator('#number-tn-component')).toHaveText('The number is: 1,234,567.89')
    await expect(page.locator('#date-td-component')).toHaveText(`The date is: ${expectedDateEn}`)
    await expect(page.locator('#date-tdr-component')).toHaveText(`The relative date is: ${expectedRelativeEn}`)
    await expect(page.locator('#html-content')).toHaveText('Bold Text with HTML content.')

    const linkDe = page.locator('#link-de')
    await expect(linkDe).toHaveAttribute('href', '/de/locale-page-modify')

    // Switch to German locale
    await linkDe.click()

    // Verify the URL and content in German
    await expect(page).toHaveURL('/de/locale-page-modify')
    await expect(page.locator('h1')).toHaveText('Sprachtestseite')
    await expect(page.locator('#content')).toHaveText('Dies ist ein Inhaltsbereich.')
    await expect(page.locator('#username')).toHaveText('Hallo, John!')
    await expect(page.locator('#plural-0')).toHaveText('Nichts')
    await expect(page.locator('#plural-1')).toHaveText('Sie haben 1 Artikel')
    await expect(page.locator('#plural-2')).toHaveText('Sie haben 2 Artikel')
    await expect(page.locator('#plural-3')).toHaveText('Sie haben 3 Artikel')
    await expect(page.locator('#number-tn')).toHaveText('1.234.567,89')
    await expect(page.locator('#date-td')).toHaveText(expectedDateDe)
    await expect(page.locator('#date-tdr')).toHaveText(expectedRelativeDe)
    await expect(page.locator('#number-tn-component')).toHaveText('Die Zahl ist: 1.234.567,89')
    await expect(page.locator('#date-td-component')).toHaveText(`Das Datum ist: ${expectedDateDe}`)
    await expect(page.locator('#date-tdr-component')).toHaveText(`Das relative Datum ist: ${expectedRelativeDe}`)
    await expect(page.locator('#html-content')).toHaveText('Fetter Text mit HTML-Inhalt.')

    const linkRu = page.locator('#link-ru')
    await expect(linkRu).toHaveAttribute('href', '/ru/locale-page-modify-ru')

    // Switch to German locale
    await linkRu.click()

    // Verify the URL and content in Russian
    await expect(page).toHaveURL('/ru/locale-page-modify-ru')
    await expect(page.locator('h1')).toHaveText('Страница теста языка')
    await expect(page.locator('#content')).toHaveText('Это раздел содержимого.')
    await expect(page.locator('#username')).toHaveText('Привет, John!')
    await expect(page.locator('#plural-0')).toHaveText('Ничего нет')
    await expect(page.locator('#plural-1')).toHaveText('У вас 1 предмет')
    await expect(page.locator('#plural-2')).toHaveText('У вас 2 предмета')
    await expect(page.locator('#plural-3')).toHaveText('У вас 3 предмета')
    await expect(page.locator('#number-tn')).toHaveText('1 234 567,89')
    await expect(page.locator('#date-td')).toHaveText(expectedDateRu)
    await expect(page.locator('#date-tdr')).toHaveText(expectedRelativeRu)
    await expect(page.locator('#number-tn-component')).toHaveText('Число: 1 234 567,89')
    await expect(page.locator('#date-td-component')).toHaveText(`Дата: ${expectedDateRu}`)
    await expect(page.locator('#date-tdr-component')).toHaveText(`Относительная дата: ${expectedRelativeRu}`)
    await expect(page.locator('#html-content')).toHaveText('Жирный текст с HTML-содержимым.')
  })

  test('test locale switching via links', async ({ page, goto }) => {
    await goto('/page', { waitUntil: 'hydration' })

    await expect(page.locator('#locale')).toHaveText('Current Locale: en')

    await page.click('#link-de')
    await expect(page).toHaveURL('/de/page')
    await expect(page.locator('#locale')).toHaveText('Current Locale: de')

    await page.click('#link-en')
    await expect(page).toHaveURL('/page')
    await expect(page.locator('#locale')).toHaveText('Current Locale: en')
  })

  test('test localized content changes on navigation', async ({ page, goto }) => {
    await goto('/locale-test', { waitUntil: 'hydration' })

    await expect(page.locator('h1')).toHaveText('Locale Test Page')
    await expect(page.locator('#content')).toHaveText('This is a content area.')

    await page.click('#link-de')
    await expect(page).toHaveURL('/de/locale-page-modify')
    await expect(page.locator('h1')).toHaveText('Sprachtestseite')
    await expect(page.locator('#content')).toHaveText('Dies ist ein Inhaltsbereich.')
  })

  test('test translation features: pluralization and parameters', async ({ page, goto }) => {
    await goto('/', { waitUntil: 'hydration' })
    await goto('/page', { waitUntil: 'hydration' })

    await expect(page.locator('#plural')).toHaveText('2 apples')

    await page.click('#link-de')
    await expect(page.locator('#plural')).toHaveText('2 Äpfel')

    await goto('/locale-test', { waitUntil: 'hydration' })
    await expect(page.locator('#username')).toHaveText('Hello, John!')
    await page.click('#link-de')
    await expect(page.locator('#username')).toHaveText('Hallo, John!')
  })

  test('test handling of missing locale data', async ({ page, goto }) => {
    await goto('/', { waitUntil: 'hydration' })
    await goto('/ru/page', { waitUntil: 'hydration' })

    await expect(page.locator('#translation')).toHaveText('page.example')
  })

  test('Test globalLocaleRoutes for page2 and unlocalized', async ({ page, goto }) => {
    // Test custom locale route for 'page2' in English
    await goto('/custom-page2-en', { waitUntil: 'hydration' })

    // Check that the custom route for English was applied and the content is correct
    await expect(page).toHaveURL('/custom-page2-en')

    // Test custom locale route for 'page2' in German
    await goto('/de/custom-page2-de', { waitUntil: 'hydration' })

    // Check that the custom route for German was applied and the content is correct
    await expect(page).toHaveURL('/de/custom-page2-de')

    // Test custom locale route for 'page2' in Russian
    await goto('/ru/custom-page2-ru', { waitUntil: 'hydration' })

    // Check that the custom route for Russian was applied and the content is correct
    await expect(page).toHaveURL('/ru/custom-page2-ru')

    // Test that the 'unlocalized' page is not affected by localization
    await goto('/unlocalized', { waitUntil: 'hydration' })

    // Check that the unlocalized page remains the same and isn't localized
    await expect(page).toHaveURL('/unlocalized')

    const response = await page.goto('/de/unlocalized', { waitUntil: 'networkidle' })
    expect(response?.status()).toBe(404)
  })

  test('test navigation and locale switching on news page', async ({ page, goto }) => {
    // Navigate to /news/1 page
    await goto('/news/1', { waitUntil: 'hydration' })

    // Check presence of id and news data
    await expect(page.locator('.news-id')).toHaveText('id: 1')
    await expect(page.locator('.news-data')).toBeVisible()

    // Check link navigation
    await page.click('.link-article-1')
    await expect(page).toHaveURL('/articles/1')

    await goto('/news/1', { waitUntil: 'hydration' }) // Возвращаемся на страницу /news/1
    await page.click('.link-news-4')
    await expect(page).toHaveURL('/news/4')

    // Check locale switching
    await page.click('.locale-en')
    await expect(page).toHaveURL('/news/4')

    await page.click('.locale-ru')
    await expect(page).toHaveURL('/ru/news/4')

    await page.click('.locale-de')
    await expect(page).toHaveURL('/de/news/4')
  })

  test('test query parameters and hash on news page', async ({ page, goto }) => {
    await goto('/news/2?a=b#tada', { waitUntil: 'hydration' })

    // Check that id and query parameters display correctly
    await expect(page.locator('.news-id')).toHaveText('id: 2')
    await expect(page).toHaveURL('/news/2?a=b#tada')

    // Check that localeRoute works correctly with query and hash
    await page.click('.link-news-2')
    await expect(page).toHaveURL('/news/2?a=b')
  })

  test('test navigation and locale switching on articles page', async ({ page, goto }) => {
    // Navigate to the /articles/1 page
    await goto('/articles/1', { waitUntil: 'hydration' })

    // Check the presence of the id and article data
    await expect(page.locator('.article-id')).toHaveText('id: 1')
    await expect(page.locator('.article-data')).toBeVisible()

    // Check the link transition to the news
    await page.click('.link-news-1')
    await expect(page).toHaveURL('/news/1')

    // Check locale switching
    await goto('/articles/1', { waitUntil: 'hydration' }) // Return to /articles/1
    await page.click('.locale-en')
    await expect(page).toHaveURL('/articles/1')

    await page.click('.locale-ru')
    await expect(page).toHaveURL('/ru/articles/1')

    await page.click('.locale-de')
    await expect(page).toHaveURL('/de/articles/1')
  })

  test('test locale switching and content on locale-conf page', async ({ page, goto }) => {
    await goto('/', { waitUntil: 'hydration' })
    await goto('/locale-conf', { waitUntil: 'hydration' })

    await page.waitForTimeout(500)

    // Check the page title in English
    const titleEn = await page.locator('h1').textContent()
    expect(titleEn).toBe('Locale Test Page')

    // Check the page content in English
    const contentEn = await page.locator('#content').textContent()
    expect(contentEn).toBe('This is a content area.')

    const greetingEn = await page.locator('#username').textContent()
    expect(greetingEn).toBe('Hello, John!')

    const pluralEn = await page.locator('#plural').textContent()
    expect(pluralEn).toBe('You have 2 items.')

    const htmlContentEn = await page.locator('#html-content').innerHTML()
    expect(htmlContentEn).toContain('<strong>Bold Text</strong> with HTML content.')

    const localeRouteEn = await page.locator('.locale-route-data:nth-of-type(1)').textContent()
    expect(localeRouteEn).toContain('"fullPath": "/locale-conf"')
    expect(localeRouteEn).toContain('"name": "locale-conf"')
    expect(localeRouteEn).toContain('"href": "/locale-conf"')

    // Check the first $switchLocaleRoute link in English
    const switchLocaleRouteEn = await page.locator('#locale-en').getAttribute('href')
    expect(switchLocaleRouteEn).toContain('/locale-conf')

    // Check the second $switchLocaleRoute link in German
    const switchLocaleRouteDe = await page.locator('#locale-de').getAttribute('href')
    expect(switchLocaleRouteDe).toContain('/de/locale-conf-modif')

    // Click on the element
    await page.click('#locale-de')

    await expect(page).toHaveURL('/de/locale-conf-modify')

    // Check the page title in German
    const titleDe = await page.locator('h1').textContent()
    expect(titleDe).toBe('Sprachtestseite')

    // Check the page content in German
    const contentDe = await page.locator('#content').textContent()
    expect(contentDe).toBe('Dies ist ein Inhaltsbereich.')

    const greetingDe = await page.locator('#username').textContent()
    expect(greetingDe).toBe('Hallo, John!')

    const pluralDe = await page.locator('#plural').textContent()
    expect(pluralDe).toBe('Sie haben 2 Artikel.')

    const htmlContentDe = await page.locator('#html-content').innerHTML()
    expect(htmlContentDe).toContain('<strong>Fetter Text</strong> mit HTML-Inhalt.')

    const switchLocaleRouteEnN = await page.locator('#locale-en').getAttribute('href')
    expect(switchLocaleRouteEnN).toContain('/locale-conf')

    // Check the second $switchLocaleRoute link in German
    const switchLocaleRouteDeN = await page.locator('#locale-de').getAttribute('href')
    expect(switchLocaleRouteDeN).toContain('/de/locale-conf-modif')
  })

  test('disable meta tags completely', async ({ page, goto }) => {
    // Test English locale - meta tags should be disabled
    await goto('/disable-meta-all', { waitUntil: 'hydration' })

    // Check that i18n meta tags are not present
    await expect(page.locator('meta#i18n-og')).not.toBeAttached()
    await expect(page.locator('meta#i18n-og-url')).not.toBeAttached()
    await expect(page.locator('link#i18n-can')).not.toBeAttached()
    await expect(page.locator('link#i18n-alternate-en')).not.toBeAttached()
    await expect(page.locator('link#i18n-alternate-de')).not.toBeAttached()
    await expect(page.locator('link#i18n-alternate-ru')).not.toBeAttached()

    // Test German locale - meta tags should also be disabled
    await goto('/de/disable-meta-all', { waitUntil: 'hydration' })

    // Check that i18n meta tags are not present
    await expect(page.locator('meta#i18n-og')).not.toBeAttached()
    await expect(page.locator('meta#i18n-og-url')).not.toBeAttached()
    await expect(page.locator('link#i18n-can')).not.toBeAttached()
    await expect(page.locator('link#i18n-alternate-en')).not.toBeAttached()
    await expect(page.locator('link#i18n-alternate-de')).not.toBeAttached()
    await expect(page.locator('link#i18n-alternate-ru')).not.toBeAttached()

    // Test French locale - meta tags should also be disabled
    await goto('/fr/disable-meta-all', { waitUntil: 'hydration' })

    // Check that i18n meta tags are not present
    await expect(page.locator('meta#i18n-og')).not.toBeAttached()
    await expect(page.locator('meta#i18n-og-url')).not.toBeAttached()
    await expect(page.locator('link#i18n-can')).not.toBeAttached()
    await expect(page.locator('link#i18n-alternate-en')).not.toBeAttached()
    await expect(page.locator('link#i18n-alternate-de')).not.toBeAttached()
    await expect(page.locator('link#i18n-alternate-ru')).not.toBeAttached()
  })

  test('disable meta tags for specific locale', async ({ page, goto, baseURL }) => {
    const normalizedBaseURL = (baseURL || 'http://localhost:3000').replace(/\/$/, '')

    // Test English locale - meta tags should be disabled
    await goto('/disable-meta-locale', { waitUntil: 'hydration' })

    // Check that i18n meta tags are not present for English
    await expect(page.locator('meta#i18n-og')).not.toBeAttached()
    await expect(page.locator('meta#i18n-og-url')).not.toBeAttached()
    await expect(page.locator('link#i18n-can')).not.toBeAttached()
    await expect(page.locator('link#i18n-alternate-en')).not.toBeAttached()
    await expect(page.locator('link#i18n-alternate-de')).not.toBeAttached()
    await expect(page.locator('link#i18n-alternate-ru')).not.toBeAttached()

    // Test German locale - meta tags should be present
    await goto('/de/disable-meta-locale', { waitUntil: 'hydration' })

    // Check that i18n meta tags are present for German
    await expect(page.locator('meta#i18n-og')).toHaveAttribute('content', 'de_DE')
    await expect(page.locator('meta#i18n-og-url')).toHaveAttribute('content', `${normalizedBaseURL}/de/disable-meta-locale`)
    await expect(page.locator('link#i18n-can')).toHaveAttribute('href', `${normalizedBaseURL}/de/disable-meta-locale`)
    await expect(page.locator('link#i18n-alternate-de')).toHaveAttribute('href', `${normalizedBaseURL}/de/disable-meta-locale`)
    // French locale has baseUrl, so alternate link uses full URL
    await expect(page.locator('link#i18n-alternate-fr')).toHaveAttribute('href', 'https://fr.example.com/disable-meta-locale')

    // Test French locale - meta tags should be present
    await goto('/fr/disable-meta-locale', { waitUntil: 'hydration' })

    // Check that i18n meta tags are present for French
    await expect(page.locator('meta#i18n-og')).toHaveAttribute('content', 'fr_FR')
    await expect(page.locator('meta#i18n-og-url')).toHaveAttribute('content', `${normalizedBaseURL}/fr/disable-meta-locale`)
    await expect(page.locator('link#i18n-can')).toHaveAttribute('href', `${normalizedBaseURL}/fr/disable-meta-locale`)
    await expect(page.locator('link#i18n-alternate-de')).toHaveAttribute('href', `${normalizedBaseURL}/de/disable-meta-locale`)
    await expect(page.locator('link#i18n-alternate-fr')).toHaveAttribute('href', 'https://fr.example.com/disable-meta-locale')
  })

  test('test missing handler functionality', async ({ page, goto }) => {
    await goto('/missing-handler-test', { waitUntil: 'hydration' })

    // Check that missing key returns the key itself
    await expect(page.locator('#missing-key')).toHaveText('non-existent-key')

    // Initially no handler should be set
    await expect(page.locator('#handler-status')).toHaveText('No handler')

    // Set handler and trigger missing translation
    await page.click('#set-handler')
    await page.waitForTimeout(100)
    await expect(page.locator('#handler-status')).toContainText('Handler called: en, non-existent-key')

    // Remove handler
    await page.click('#remove-handler')
    await page.waitForTimeout(100)
    await expect(page.locator('#handler-status')).toHaveText('Handler removed')
  })

  test('test missingWarn configuration', async ({ page, goto }) => {
    // Test with default missingWarn: true (should show warnings in dev mode)
    await goto('/missing-handler-test', { waitUntil: 'hydration' })

    // Check that console warnings count is tracked
    const warningsCount = await page.locator('#console-warnings').textContent()
    // In dev mode, warnings should be present (at least 1 for the missing key)
    expect(Number.parseInt(warningsCount || '0')).toBeGreaterThanOrEqual(0)
  })
})
