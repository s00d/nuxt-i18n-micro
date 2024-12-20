import { fileURLToPath } from 'node:url'
import { expect, test } from '@nuxt/test-utils/playwright'

test.use({
  nuxt: {
    rootDir: fileURLToPath(new URL('./fixtures/custom-regex', import.meta.url)),
  },
  // launchOptions: {
  //   headless: false, // Показывать браузер
  //   slowMo: 500, // Замедлить выполнение шагов (в миллисекундах) для лучшей видимости
  // },
})

test.describe('custom-regex', () => {
  test('test 404 on unknown locale', async ({ goto }) => {
    const response = await goto('/un-kn', { waitUntil: 'networkidle' })
    expect(response?.status()).toBe(404)
  })

  test('test index', async ({ page, goto }) => {
    await goto('/', { waitUntil: 'hydration' })
    await expect(page.locator('#locale')).toHaveText('en')

    await goto('/de-de', { waitUntil: 'hydration' })
    await expect(page.locator('#locale')).toHaveText('de')
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
    await expect(page.locator('meta#i18n-og-url')).toHaveAttribute('content', `${normalizedBaseURL}/`)
    await expect(page.locator('meta#i18n-og-alt-de_DE')).toHaveAttribute('content', 'de_DE')
    await expect(page.locator('meta#i18n-og-alt-ru_RU')).toHaveAttribute('content', 'ru_RU')

    await expect(page.locator('link#i18n-can')).toHaveAttribute('href', `${normalizedBaseURL}/`)
    await expect(page.locator('link#i18n-alternate-en-us')).toHaveAttribute('href', `${normalizedBaseURL}/`)
    await expect(page.locator('link#i18n-alternate-en_EN')).toHaveAttribute('href', `${normalizedBaseURL}/`)
    await expect(page.locator('link#i18n-alternate-de-de')).toHaveAttribute('href', `${normalizedBaseURL}/de-de`)
    await expect(page.locator('link#i18n-alternate-de_DE')).toHaveAttribute('href', `${normalizedBaseURL}/de-de`)
    await expect(page.locator('link#i18n-alternate-ru-ru')).toHaveAttribute('href', `${normalizedBaseURL}/ru-ru`)
    await expect(page.locator('link#i18n-alternate-ru_RU')).toHaveAttribute('href', `${normalizedBaseURL}/ru-ru`)

    // Test for German locale
    await goto('/de-de', { waitUntil: 'hydration' })

    // Test meta tags for the German locale
    await expect(page.locator('meta#i18n-og')).toHaveAttribute('content', 'de_DE')
    await expect(page.locator('meta#i18n-og-url')).toHaveAttribute('content', `${normalizedBaseURL}/de-de`)
    await expect(page.locator('meta#i18n-og-alt-en_EN')).toHaveAttribute('content', 'en_EN')
    await expect(page.locator('meta#i18n-og-alt-ru_RU')).toHaveAttribute('content', 'ru_RU')

    await expect(page.locator('link#i18n-can')).toHaveAttribute('href', `${normalizedBaseURL}/de-de`)
    await expect(page.locator('link#i18n-alternate-en-us')).toHaveAttribute('href', `${normalizedBaseURL}/`)
    await expect(page.locator('link#i18n-alternate-en_EN')).toHaveAttribute('href', `${normalizedBaseURL}/`)
    await expect(page.locator('link#i18n-alternate-de-de')).toHaveAttribute('href', `${normalizedBaseURL}/de-de`)
    await expect(page.locator('link#i18n-alternate-de_DE')).toHaveAttribute('href', `${normalizedBaseURL}/de-de`)
    await expect(page.locator('link#i18n-alternate-ru-ru')).toHaveAttribute('href', `${normalizedBaseURL}/ru-ru`)
    await expect(page.locator('link#i18n-alternate-ru_RU')).toHaveAttribute('href', `${normalizedBaseURL}/ru-ru`)

    // Test for Russian locale
    await goto('/ru-ru', { waitUntil: 'hydration' })

    // Test meta tags for the Russian locale
    await expect(page.locator('meta#i18n-og')).toHaveAttribute('content', 'ru_RU')
    await expect(page.locator('meta#i18n-og-url')).toHaveAttribute('content', `${normalizedBaseURL}/ru-ru`)
    await expect(page.locator('meta#i18n-og-alt-en_EN')).toHaveAttribute('content', 'en_EN')
    await expect(page.locator('meta#i18n-og-alt-de_DE')).toHaveAttribute('content', 'de_DE')

    await expect(page.locator('link#i18n-can')).toHaveAttribute('href', `${normalizedBaseURL}/ru-ru`)
    await expect(page.locator('link#i18n-alternate-en-us')).toHaveAttribute('href', `${normalizedBaseURL}/`)
    await expect(page.locator('link#i18n-alternate-en_EN')).toHaveAttribute('href', `${normalizedBaseURL}/`)
    await expect(page.locator('link#i18n-alternate-de-de')).toHaveAttribute('href', `${normalizedBaseURL}/de-de`)
    await expect(page.locator('link#i18n-alternate-de_DE')).toHaveAttribute('href', `${normalizedBaseURL}/de-de`)
    await expect(page.locator('link#i18n-alternate-ru-ru')).toHaveAttribute('href', `${normalizedBaseURL}/ru-ru`)
    await expect(page.locator('link#i18n-alternate-ru_RU')).toHaveAttribute('href', `${normalizedBaseURL}/ru-ru`)
  })

  test('test links', async ({ page, goto }) => {
    await goto('/dir1/test', { waitUntil: 'hydration' })
    await expect(page.locator('#test_link')).toHaveText('link in en')

    await goto('/de-de/dir1/test', { waitUntil: 'hydration' })
    await expect(page.locator('#test_link')).toHaveText('link in de')
  })

  test('test plugin methods output on page', async ({ page, goto }) => {
    // Navigate to the /page route
    await goto('/page', { waitUntil: 'hydration' })

    // Verify the locale
    await expect(page.locator('#locale')).toHaveText('Current Locale: en-us')

    // Verify the list of locales
    await expect(page.locator('#locales')).toHaveText('en-us, de-de, ru-ru')

    // Verify the translation for a key
    await expect(page.locator('#translation')).toHaveText('Page example in en') // Replace with actual expected content

    // Verify the pluralization for items
    await expect(page.locator('#plural')).toHaveText('2 apples') // Replace with actual pluralization result

    await expect(page.locator('#plural-component')).toHaveText('5 apples') // Replace with actual pluralization result
    await expect(page.locator('#plural-component-custom')).toHaveText('5 apples') // Replace with actual pluralization result
    await expect(page.locator('#plural-component-custom-zero')).toHaveText('no apples') // Replace with actual pluralization result

    // Verify the localized route generation
    await expect(page.locator('#localized-route')).toHaveText('/de-de/page')
  })

  test('test locale switching on page', async ({ page, goto }) => {
    // Navigate to the /page route in English
    await goto('/page', { waitUntil: 'hydration' })

    await expect(page).toHaveURL('/page')

    await expect(page.locator('#locale')).toHaveText('Current Locale: en-us')

    // Verify the translation for a key after switching locale
    await expect(page.locator('#translation')).toHaveText('Page example in en') // Replace with actual expected content

    // Verify the pluralization for items after switching locale
    await expect(page.locator('#plural')).toHaveText('2 apples') // Replace with actual pluralization result in German

    // Verify the localized route generation after switching locale
    await expect(page.locator('#localized-route')).toHaveText('/de-de/page')

    // Click the link to switch to the German locale
    await page.click('#link-de')

    // Verify that the URL has changed
    await expect(page).toHaveURL('/de-de/page')

    // Verify the locale after switching
    await expect(page.locator('#locale')).toHaveText('Current Locale: de-de')

    // Verify the translation for a key after switching locale
    await expect(page.locator('#translation')).toHaveText('Page example in de') // Replace with actual expected content

    // Verify the pluralization for items after switching locale
    await expect(page.locator('#plural')).toHaveText('2 Äpfel') // Replace with actual pluralization result in German

    // Verify the localized route generation after switching locale
    await expect(page.locator('#localized-route')).toHaveText('/de-de/page')
  })

  test('test locale switching on locale-test page', async ({ page }) => {
    // Navigate to the /locale-test route in English
    await page.goto('/locale-test', { waitUntil: 'networkidle' })

    // Verify the URL and content in English
    await expect(page).toHaveURL('/locale-test')
    await expect(page.locator('h1')).toHaveText('Locale Test Page')
    await expect(page.locator('#content')).toHaveText('This is a content area.')
    await expect(page.locator('#username')).toHaveText('Hello, John!')
    await expect(page.locator('#plural')).toHaveText('You have 2 items.')
    await expect(page.locator('#html-content')).toHaveText('Bold Text with HTML content.')

    const linkDe = page.locator('#link-de')
    await expect(linkDe).toHaveAttribute('href', '/de-de/locale-page-modify')

    // Switch to German locale
    await linkDe.click()

    // Verify the URL and content in German
    await expect(page).toHaveURL('/de-de/locale-page-modify')
    await expect(page.locator('h1')).toHaveText('Sprachtestseite')
    await expect(page.locator('#content')).toHaveText('Dies ist ein Inhaltsbereich.')
    await expect(page.locator('#username')).toHaveText('Hallo, John!')
    await expect(page.locator('#plural')).toHaveText('Sie haben 2 Artikel.')
    await expect(page.locator('#html-content')).toHaveText('Fetter Text mit HTML-Inhalt.')
  })

  test('test locale switching via links', async ({ page, goto }) => {
    await goto('/page', { waitUntil: 'hydration' })

    await expect(page.locator('#locale')).toHaveText('Current Locale: en-us')

    await page.click('#link-de')
    await expect(page).toHaveURL('/de-de/page')
    await expect(page.locator('#locale')).toHaveText('Current Locale: de-de')

    await page.click('#link-en')
    await expect(page).toHaveURL('/page')
    await expect(page.locator('#locale')).toHaveText('Current Locale: en-us')
  })

  test('test localized content changes on navigation', async ({ page, goto }) => {
    await goto('/locale-test', { waitUntil: 'hydration' })

    await expect(page.locator('h1')).toHaveText('Locale Test Page')
    await expect(page.locator('#content')).toHaveText('This is a content area.')

    await page.click('#link-de')
    await expect(page).toHaveURL('/de-de/locale-page-modify')
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
    await goto('/ru-ru/page', { waitUntil: 'hydration' })

    await expect(page.locator('#translation')).toHaveText('page.example')
  })

  test('Test globalLocaleRoutes for page2 and unlocalized', async ({ page, goto }) => {
    // Test custom locale route for 'page2' in English
    await goto('/custom-page2-en', { waitUntil: 'hydration' })

    // Check that the custom route for English was applied and the content is correct
    await expect(page).toHaveURL('/custom-page2-en')

    // Test custom locale route for 'page2' in German
    await goto('/de-de/custom-page2-de', { waitUntil: 'hydration' })

    // Check that the custom route for German was applied and the content is correct
    await expect(page).toHaveURL('/de-de/custom-page2-de')

    // Test custom locale route for 'page2' in Russian
    await goto('/ru-ru/custom-page2-ru', { waitUntil: 'hydration' })

    // Check that the custom route for Russian was applied and the content is correct
    await expect(page).toHaveURL('/ru-ru/custom-page2-ru')

    // Test that the 'unlocalized' page is not affected by localization
    await goto('/unlocalized', { waitUntil: 'hydration' })

    // Check that the unlocalized page remains the same and isn't localized
    await expect(page).toHaveURL('/unlocalized')

    const response = await page.goto('/de-de/unlocalized', { waitUntil: 'networkidle' })
    expect(response?.status()).toBe(404)
  })

  test('test navigation and locale switching on news page', async ({ page, goto }) => {
    // Переход на страницу /news/1
    await goto('/news/1', { waitUntil: 'hydration' })

    // Проверяем наличие id и данных news
    await expect(page.locator('.news-id')).toHaveText('id: 1')
    await expect(page.locator('.news-data')).toBeVisible()

    // Проверяем переходы по ссылкам
    await page.click('.link-article-1')
    await expect(page).toHaveURL('/articles/1')

    await goto('/news/1', { waitUntil: 'hydration' }) // Возвращаемся на страницу /news/1
    await page.click('.link-news-4')
    await expect(page).toHaveURL('/news/4')

    // Проверяем переключение локалей
    await page.click('.locale-en')
    await expect(page).toHaveURL('/news/4')

    await page.click('.locale-ru')
    await expect(page).toHaveURL('/ru-ru/news/4')

    await page.click('.locale-de')
    await expect(page).toHaveURL('/de-de/news/4')
  })

  test('test query parameters and hash on news page', async ({ page, goto }) => {
    await goto('/news/2?a=b#tada', { waitUntil: 'hydration' })

    // Проверяем, что id и query параметры корректно отображаются
    await expect(page.locator('.news-id')).toHaveText('id: 2')
    await expect(page).toHaveURL('/news/2?a=b#tada')

    // Проверяем, что localeRoute корректно работает с query и hash
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
    await expect(page).toHaveURL('/ru-ru/articles/1')

    await page.click('.locale-de')
    await expect(page).toHaveURL('/de-de/articles/1')
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
    expect(switchLocaleRouteDe).toContain('/de-de/locale-conf-modif')

    // Click on the element
    await page.click('#locale-de')

    await expect(page).toHaveURL('/de-de/locale-conf-modify')

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
    expect(switchLocaleRouteDeN).toContain('/de-de/locale-conf-modif')
  })
})
