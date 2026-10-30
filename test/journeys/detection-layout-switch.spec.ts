import { getLocaleCookie } from 'untestutils/utils'
import { describe, expect, test } from 'untestutils/vitest'

describe('J5 detection: layout switch (layout-switch, pec, autoDetectPath /, cookie i18n_locale)', () => {
  test.override({ harness: 'layout-switch' })

  // was: layout-switch › layout updates via $switchLocale / cookie redirect on homepage / direct URL nav;
  // cookie-replace › custom cookie name (the non-default name i18n_locale is honored)
  test('L-T1 switching updates layout and page, the cookie brings you back', async ({ page, goto }) => {
    // step 1: open / → en layout and page
    await goto('/', { waitUntil: 'hydration' })
    await expect(page.locator('.layout-title')).toHaveText('My App')
    await expect(page.locator('.nav-home')).toHaveText('Home')
    await expect(page.locator('.nav-about')).toHaveText('About')
    await expect(page.locator('.page-welcome')).toHaveText('Welcome to our site')

    // step 2: [data-locale=zh] → /zh, zh layout + page; [data-locale=ja] → /ja, ja (was: waitForURL + sleep)
    await page.click('[data-locale="zh"]')
    await expect(page).toHaveURL('/zh')
    await expect(page.locator('.layout-title')).toHaveText('我的应用')
    await expect(page.locator('.nav-home')).toHaveText('首页')
    await expect(page.locator('.nav-about')).toHaveText('关于')
    await expect(page.locator('.page-welcome')).toHaveText('欢迎来到我们的网站')
    await expect(page.locator('.locale-value')).toHaveText('zh')
    await page.click('[data-locale="ja"]')
    await expect(page).toHaveURL('/ja')
    await expect(page.locator('.layout-title')).toHaveText('マイアプリ')
    await expect(page.locator('.nav-home')).toHaveText('ホーム')
    await expect(page.locator('.page-welcome')).toHaveText('私たちのサイトへようこそ')
    await expect(page.locator('.locale-value')).toHaveText('ja')

    // step 3: the switch wrote i18n_locale=ja → open / → /ja; then [data-locale=en] → /, en layout
    await expect.poll(() => getLocaleCookie(page, 'i18n_locale')).toBe('ja')
    await goto('/', { waitUntil: 'hydration' })
    await expect(page).toHaveURL('/ja')
    await expect(page.locator('.locale-value')).toHaveText('ja')
    await expect(page.locator('.layout-title')).toHaveText('マイアプリ')
    await page.click('[data-locale="en"]')
    await expect(page).toHaveURL('/')
    await expect(page.locator('.layout-title')).toHaveText('My App')
    await expect(page.locator('.nav-home')).toHaveText('Home')

    // step 4: direct SSR loads /zh then /ja → layout per locale
    await goto('/zh', { waitUntil: 'hydration' })
    await expect(page.locator('.layout-title')).toHaveText('我的应用')
    await expect(page.locator('.page-welcome')).toHaveText('欢迎来到我们的网站')
    await goto('/ja', { waitUntil: 'hydration' })
    await expect(page.locator('.layout-title')).toHaveText('マイアプリ')
    await expect(page.locator('.page-welcome')).toHaveText('私たちのサイトへようこそ')
  })

  // was: layout-switch › cookie > AL; auto-detect-path › cookie redirects / / dotted query / deep links untouched
  test('L-T2 cookie beats Accept-Language on / only', async ({ page, goto, baseURL }) => {
    // step 1: cookie ja + AL zh-CN, open / → /ja
    await page.context().addCookies([{ name: 'i18n_locale', value: 'ja', url: baseURL }])
    await page.setExtraHTTPHeaders({ 'Accept-Language': 'zh-CN,zh;q=0.9' })
    await goto('/', { waitUntil: 'hydration' })
    await expect(page).toHaveURL('/ja')
    await expect(page.locator('.locale-value')).toHaveText('ja')
    await expect(page.locator('.layout-title')).toHaveText('マイアプリ')

    // step 2: a dot in the query is not a static-asset extension → /ja keeps the query
    await goto('/?utm_source=news.example.com', { waitUntil: 'hydration' })
    await expect(page).toHaveURL('/ja?utm_source=news.example.com')

    // step 3: deep unprefixed link /page is not rewritten by cookie or AL → stays /page, en
    await goto('/page', { waitUntil: 'hydration' })
    await expect(page).toHaveURL('/page')
    await expect(page.locator('#locale')).toHaveText('en')
  })
})
