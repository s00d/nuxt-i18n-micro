import { describe, expect, test } from 'untestutils/vitest'
import { directRoutes, forcedLocale, ssr, walkStrategy } from '../helpers/journeys-b.ts'

describe('J2 strategies: no_prefix', () => {
  test.override({ harness: 'strategy-no-prefix' })

  // was: no-prefix › navigate/switch
  test('NP-T1 walk: URLs never get a prefix, the cookie keeps de', async ({ page, goto, baseURL }) => {
    // steps 1–5: shared walk
    await walkStrategy(page, goto, { home: '/', contact: '/contact', deHome: '/', deContact: '/kontakt' })

    // step 6: reload / → stays /, still de through the cookie
    await goto('/', { waitUntil: 'hydration' })
    await expect(page).toHaveURL('/')
    await expect(page.locator('#content')).toHaveText('de')

    // step 7: every localized URL on a direct cookie-less request → 200 and its content
    await directRoutes(baseURL, 'no_prefix')
  })

  // was: auto-detect-no-prefix › * (fixture merged into strategy-no-prefix via AUTO_DETECT_LANGUAGE)
  test('NP-T2 detection: Accept-Language, cookie priority, head', async ({ page, goto, baseURL }) => {
    // step 1: SSR with AL de → de; AL ru → ru (was: detects German / Russian from Accept-Language)
    const de = await ssr(baseURL, '/', { 'Accept-Language': 'de-DE,de;q=0.9,en;q=0.8' })
    expect(de.status).toBe(200)
    expect(de.html).toContain('id="content">de</p>')
    const ru = await ssr(baseURL, '/', { 'Accept-Language': 'ru-RU,ru;q=0.9' })
    expect(ru.status).toBe(200)
    expect(ru.html).toContain('id="content">ru</p>')

    // step 2: browser AL zh → default en; AL en → en (was: unknown language / AL matches default)
    await page.setExtraHTTPHeaders({ 'Accept-Language': 'zh-CN,zh;q=0.9' })
    await goto('/', { waitUntil: 'hydration' })
    await expect(page).toHaveURL('/')
    await expect(page.locator('#content')).toHaveText('en')
    await page.context().clearCookies()
    await page.setExtraHTTPHeaders({ 'Accept-Language': 'en-US,en;q=0.9' })
    await goto('/', { waitUntil: 'hydration' })
    await expect(page).toHaveURL('/')
    await expect(page.locator('#content')).toHaveText('en')

    // step 3: cookie en + AL de → en, SSR and client (was: respects cookie when it equals defaultLocale #224)
    const cookieEn = await ssr(baseURL, '/', { Cookie: 'user-locale=en', 'Accept-Language': 'de-DE,de;q=0.9' })
    expect(cookieEn.status).toBe(200)
    expect(cookieEn.html).toContain('id="content">en</p>')
    await page.context().clearCookies()
    await page.context().addCookies([{ name: 'user-locale', value: 'en', url: baseURL }])
    await page.setExtraHTTPHeaders({ 'Accept-Language': 'de-DE,de;q=0.9' })
    await goto('/', { waitUntil: 'hydration' })
    await expect(page.locator('#content')).toHaveText('en')

    // step 4: cookie de + AL ru → de (was: respects existing cookie over Accept-Language)
    await page.context().clearCookies()
    await page.context().addCookies([{ name: 'user-locale', value: 'de', url: baseURL }])
    await page.setExtraHTTPHeaders({ 'Accept-Language': 'ru-RU,ru;q=0.9' })
    await goto('/', { waitUntil: 'hydration' })
    await expect(page.locator('#content')).toHaveText('de')

    // step 5: fresh en visit → canonical = og:url = base, og en_EN, lang en_EN, no hreflang, no x-default
    // was: auto-detect-no-prefix › SEO for no_prefix
    const base = baseURL.replace(/\/$/, '')
    await page.context().clearCookies()
    await page.setExtraHTTPHeaders({ 'Accept-Language': 'en-US,en;q=0.9' })
    await goto('/', { waitUntil: 'hydration' })
    await expect(page.locator('link#i18n-can')).toHaveAttribute('href', base)
    await expect(page.locator('meta#i18n-og-url')).toHaveAttribute('content', base)
    await expect(page.locator('meta#i18n-og')).toHaveAttribute('content', 'en_EN')
    await expect(page.locator('html')).toHaveAttribute('lang', 'en_EN')
    await expect(page.locator('link#i18n-alternate-en_EN')).not.toBeAttached()
    await expect(page.locator('link#i18n-alternate-de_DE')).not.toBeAttached()
    await expect(page.locator('link#i18n-alternate-ru_RU')).not.toBeAttached()
    await expect(page.locator('link#i18n-xd')).not.toBeAttached()
  })

  // was: locale-state (no_prefix) › * (fixture merged: header-gated force-locale plugin)
  test('NP-T3 forced locale: server plugin sets ru, URL stays /', async ({ page, goto }) => {
    await forcedLocale(page, goto, '/')
  })
})
