import { fileURLToPath } from 'node:url'
import { expect, test } from '@nuxt/test-utils/playwright'

test.use({
  nuxt: {
    rootDir: fileURLToPath(new URL('./fixtures/basic', import.meta.url)),
  },
  // launchOptions: {
  //   headless: false, // Показывать браузер
  //   slowMo: 500, // Замедлить выполнение шагов (в миллисекундах) для лучшей видимости
  // },
})

test('test index', async ({ page, goto }) => {
  await goto('/', { waitUntil: 'hydration' })
  await expect(page.locator('#locale')).toHaveText('en')

  await goto('/de', { waitUntil: 'hydration' })
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
  await expect(page.locator('link#i18n-alternate-en')).toHaveAttribute('href', `${normalizedBaseURL}/`)
  await expect(page.locator('link#i18n-alternate-en_EN')).toHaveAttribute('href', `${normalizedBaseURL}/`)
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
  await expect(page.locator('link#i18n-alternate-en')).toHaveAttribute('href', `${normalizedBaseURL}/`)
  await expect(page.locator('link#i18n-alternate-en_EN')).toHaveAttribute('href', `${normalizedBaseURL}/`)
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
  await expect(page.locator('link#i18n-alternate-en')).toHaveAttribute('href', `${normalizedBaseURL}/`)
  await expect(page.locator('link#i18n-alternate-en_EN')).toHaveAttribute('href', `${normalizedBaseURL}/`)
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
  await expect(page.locator('#locales')).toHaveText('en, de, ru')

  // Verify the translation for a key
  await expect(page.locator('#translation')).toHaveText('Page example in en') // Replace with actual expected content

  // Verify the pluralization for items
  await expect(page.locator('#plural')).toHaveText('2 apples') // Replace with actual pluralization result

  await expect(page.locator('#plural-component')).toHaveText('5 apples') // Replace with actual pluralization result
  await expect(page.locator('#plural-component-custom')).toHaveText('5 apples') // Replace with actual pluralization result
  await expect(page.locator('#plural-component-custom-zero')).toHaveText('no apples') // Replace with actual pluralization result

  // Verify the localized route generation
  await expect(page.locator('#localized-route')).toHaveText('/de/page')
})

test('test locale switching on page', async ({ page, goto }) => {
  // Navigate to the /page route in English
  await goto('/page', { waitUntil: 'hydration' })

  await expect(page).toHaveURL('/page')

  await expect(page.locator('#locale')).toHaveText('Current Locale: en')

  // Verify the translation for a key after switching locale
  await expect(page.locator('#translation')).toHaveText('Page example in en') // Replace with actual expected content

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

  // Verify the pluralization for items after switching locale
  await expect(page.locator('#plural')).toHaveText('2 Äpfel') // Replace with actual pluralization result in German

  // Verify the localized route generation after switching locale
  await expect(page.locator('#localized-route')).toHaveText('/de/page')

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
  await expect(linkDe).toHaveAttribute('href', '/de/locale-page-modify')

  // Switch to German locale
  await linkDe.click()

  // Verify the URL and content in German
  await expect(page).toHaveURL('/de/locale-page-modify')
  await expect(page.locator('h1')).toHaveText('Sprachtestseite')
  await expect(page.locator('#content')).toHaveText('Dies ist ein Inhaltsbereich.')
  await expect(page.locator('#username')).toHaveText('Hallo, John!')
  await expect(page.locator('#plural')).toHaveText('Sie haben 2 Artikel.')
  await expect(page.locator('#html-content')).toHaveText('Fetter Text mit HTML-Inhalt.')
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
  await expect(page).toHaveURL('/ru/news/4')

  await page.click('.locale-de')
  await expect(page).toHaveURL('/de/news/4')
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
