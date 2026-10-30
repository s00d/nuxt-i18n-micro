import { getLocaleCookie } from 'untestutils/utils'
import { describe, expect, test } from 'untestutils/vitest'

// strategy fixture, pec, Accept-Language detection on / only (autoDetectPath '/'), cookie user-locale;
// app.vue renders a translated header with one [data-locale] button per locale.
describe('J5 detection: layout switch (strategy-prefix-except-default)', () => {
  test.override({ harness: 'strategy-prefix-except-default' })

  // was: layout-switch › layout updates via $switchLocale / cookie redirect on homepage / direct URL nav;
  // cookie-replace › custom cookie name (any explicit name: the default is no cookie)
  test('L-T1 switching updates layout and page, the cookie brings you back', async ({ page, goto }) => {
    // step 1: open / → en layout and page
    await goto('/', { waitUntil: 'hydration' })
    await expect(page.locator('.layout-title')).toHaveText('My App')
    await expect(page.locator('.nav-home')).toHaveText('Home')
    await expect(page.locator('.nav-about')).toHaveText('About')
    await expect(page.locator('.page-welcome')).toHaveText('Welcome to our site')

    // step 2: [data-locale=de] → /de, de layout + page; [data-locale=ru] → /ru, ru
    await page.click('[data-locale="de"]')
    await expect(page).toHaveURL('/de')
    await expect(page.locator('.layout-title')).toHaveText('Meine App')
    await expect(page.locator('.nav-home')).toHaveText('Startseite')
    await expect(page.locator('.nav-about')).toHaveText('Über uns')
    await expect(page.locator('.page-welcome')).toHaveText('Willkommen auf unserer Seite')
    await expect(page.locator('.locale-value')).toHaveText('de')
    await page.click('[data-locale="ru"]')
    await expect(page).toHaveURL('/ru')
    await expect(page.locator('.layout-title')).toHaveText('Моё приложение')
    await expect(page.locator('.nav-home')).toHaveText('Главная')
    await expect(page.locator('.page-welcome')).toHaveText('Добро пожаловать на наш сайт')
    await expect(page.locator('.locale-value')).toHaveText('ru')

    // step 3: the switch wrote user-locale=ru → open / → /ru; then [data-locale=en] → /, en layout
    await expect.poll(() => getLocaleCookie(page, 'user-locale')).toBe('ru')
    await goto('/', { waitUntil: 'hydration' })
    await expect(page).toHaveURL('/ru')
    await expect(page.locator('.locale-value')).toHaveText('ru')
    await expect(page.locator('.layout-title')).toHaveText('Моё приложение')
    await page.click('[data-locale="en"]')
    await expect(page).toHaveURL('/')
    await expect(page.locator('.layout-title')).toHaveText('My App')
    await expect(page.locator('.nav-home')).toHaveText('Home')

    // step 4: direct SSR loads /de then /ru → layout per locale
    await goto('/de', { waitUntil: 'hydration' })
    await expect(page.locator('.layout-title')).toHaveText('Meine App')
    await expect(page.locator('.page-welcome')).toHaveText('Willkommen auf unserer Seite')
    await goto('/ru', { waitUntil: 'hydration' })
    await expect(page.locator('.layout-title')).toHaveText('Моё приложение')
    await expect(page.locator('.page-welcome')).toHaveText('Добро пожаловать на наш сайт')
  })

  // was: layout-switch › cookie > AL; auto-detect-path › cookie redirects / / dotted query / deep links untouched
  test('L-T2 cookie beats Accept-Language on / only', async ({ page, goto, baseURL }) => {
    // step 1: cookie ru + AL de-DE, open / → /ru
    await page.context().addCookies([{ name: 'user-locale', value: 'ru', url: baseURL }])
    await page.setExtraHTTPHeaders({ 'Accept-Language': 'de-DE,de;q=0.9' })
    await goto('/', { waitUntil: 'hydration' })
    await expect(page).toHaveURL('/ru')
    await expect(page.locator('.locale-value')).toHaveText('ru')
    await expect(page.locator('.layout-title')).toHaveText('Моё приложение')

    // step 2: a dot in the query is not a static-asset extension → /ru keeps the query
    await goto('/?utm_source=news.example.com', { waitUntil: 'hydration' })
    await expect(page).toHaveURL('/ru?utm_source=news.example.com')

    // step 3: deep unprefixed link /contact is not rewritten by cookie or AL → stays /contact, en
    await goto('/contact', { waitUntil: 'hydration' })
    await expect(page).toHaveURL('/contact')
    await expect(page.locator('.locale-value')).toHaveText('en')
    await expect(page.locator('#content')).toHaveText('contact')
  })
})
