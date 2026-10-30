import type { Page } from '@playwright/test'
import { collectConsole } from 'untestutils/utils'
import { describe, expect, test } from '../helpers/guarded-test.ts'
import { deActivity, enActivity, walkActivity } from '../helpers/journeys-a.ts'

// J1 basic: prefix_except_default; en, de, ru, fr (baseUrl fr.example.com), ch (baseUrl test.example.com); dateBuild 12345.
describe('journey: basic app', () => {
  test.override({ harness: 'basic' })

  /** og / canonical / alternates / x-default of a locale home page. was: basic › test head */
  async function expectHomeHead(page: Page, base: string, code: 'en' | 'de' | 'ru') {
    const iso = { en: 'en_EN', de: 'de_DE', ru: 'ru_RU' }
    const url = code === 'en' ? base : `${base}/${code}`
    await expect(page.locator('meta#i18n-og')).toHaveAttribute('content', iso[code])
    await expect(page.locator('meta#i18n-og-url')).toHaveAttribute('content', url)
    for (const other of (['en', 'de', 'ru'] as const).filter((c) => c !== code)) {
      await expect(page.locator(`meta#i18n-og-alt-${iso[other]}`)).toHaveAttribute('content', iso[other])
    }
    await expect(page.locator('link#i18n-can')).toHaveAttribute('href', url)
    await expect(page.locator('link#i18n-alternate-en_EN')).toHaveAttribute('href', base)
    await expect(page.locator('link#i18n-alternate-de_DE')).toHaveAttribute('href', `${base}/de`)
    await expect(page.locator('link#i18n-alternate-ru_RU')).toHaveAttribute('href', `${base}/ru`)
    await expect(page.locator('link#i18n-xd')).toHaveAttribute('hreflang', 'x-default')
    await expect(page.locator('link#i18n-xd')).toHaveAttribute('href', base)
  }

  test('first visit, browse, switch locale', async ({ page, goto, request, baseURL }) => {
    const base = baseURL.replace(/\/$/, '')
    const preloadHref = '/_locales/index/en/data.json?v=12345'

    // step 1: GET / → 200; SSR has the en locale, the preload link of the first chunk, the literal escaped text
    // was: basic › test index, › SSR preloads the first chunk…, › test text escaping; reactivity › security: escapes HTML
    const res = await request.get('/')
    expect(res.status()).toBe(200)
    const html = await res.text()
    expect(html).toMatch(/id="locale"[^>]*>\s*en\s*</)
    const preloadTag = html.match(/<link[^>]*href="\/_locales\/index\/en\/data\.json\?v=12345"[^>]*>/)?.[0]
    expect(preloadTag).toMatch(/rel="preload"/)
    expect(preloadTag).toMatch(/as="fetch"/)
    expect(preloadTag).toMatch(/crossorigin="anonymous"/)
    const escaping = html.match(/<p class="text_escaping"[^>]*>([\s\S]*?)<\/p>/)?.[1]
    expect(escaping?.trim()).toBe('test {text_escaping} } { {')
    expect(escaping).not.toMatch(/<script/i)

    // step 2: recorder armed, open / → hydrated en; the client fetched the preloaded URL and no other locale; activeStyle
    // was: basic › SSR preloads…, › i18n-link applies activeStyle…; reactivity › performance: does not load other locales (upgraded from a tautology)
    const fetched: string[] = []
    page.on('request', (r) => {
      const u = new URL(r.url())
      if (u.pathname.startsWith('/_locales/')) fetched.push(u.pathname + u.search)
    })
    await goto('/', { waitUntil: 'hydration' })
    await expect(page.locator('#locale')).toHaveText('en')
    await expect(page.locator('.text_escaping')).toHaveText('test {text_escaping} } { { ')
    await expect(page.locator('link[rel="preload"][as="fetch"]')).toHaveAttribute('href', preloadHref)
    await expect(page.locator('link[rel="preload"][as="fetch"]')).toHaveAttribute('crossorigin', 'anonymous')
    expect(fetched).toContain(preloadHref)
    expect(fetched.filter((u) => /^\/_locales\/[^/]+\/(de|ru)\//.test(u))).toEqual([])
    await expect(page.locator('#home-link')).toHaveCSS('color', 'rgb(255, 0, 0)')
    await expect(page.locator('#page-link-styled')).not.toHaveCSS('color', 'rgb(255, 0, 0)')

    // step 3: head on / → en og, canonical, alternates, x-default
    // was: basic › test head (en)
    await expectHomeHead(page, base, 'en')

    // step 4: click #page-link → /page, the client chunk fetch carries ?v=12345 and gets 200; back and forth
    // was: basic › cache busting uses configured i18n.dateBuild, › test routes (en)
    const chunk = page.waitForResponse((r) => r.url().includes('/_locales/') && r.url().includes('/data.json') && r.url().includes('v=12345'))
    await page.click('#page-link')
    await expect(page).toHaveURL('/page')
    expect((await chunk).status()).toBe(200)
    await page.click('#page-link')
    await expect(page).toHaveURL('/')
    await page.click('#page-link')
    await expect(page).toHaveURL('/page')

    // step 5: /page in en → plugin methods, plurals, i18n-t, localeRoute / localePath, computed $ts, external link
    // was: basic › test plugin methods output on page, › test external link; reactivity › computed with $ts, › localeRoute keeps query, › i18n-t pluralization, › merge precedence
    await expect(page.locator('#locale')).toHaveText('Current Locale: en')
    await expect(page.locator('#locale-name')).toHaveText('English')
    await expect(page.locator('#locales')).toHaveText('en, de, ru, fr, ch')
    await expect(page.locator('#translation')).toHaveText('Page example in en')
    await expect(page.locator('#translation-global')).toHaveText('example en')
    await expect(page.locator('#comp1')).toHaveText('en text')
    await expect(page.locator('#plural')).toHaveText('2 apples')
    await expect(page.locator('#plural-component')).toHaveText('5 apples')
    await expect(page.locator('#plural-component-custom')).toHaveText('5 apples')
    await expect(page.locator('#plural-component-custom-zero')).toHaveText('no apples')
    await expect(page.locator('#localized-route')).toHaveText('/de/page')
    await expect(page.locator('#localized-route-2')).toHaveText('/news/aaa?info=1111')
    await expect(page.locator('#localized-path')).toHaveText('/news/aaa?info=1111')
    await expect(page.locator('#computed-ts')).toHaveText('Page example in en')
    await expect(page.locator('#computed-t')).toHaveText('example en')
    await expect(page.locator('#external-link')).toHaveAttribute('href', 'https://www.external-link.fr')
    await expect(page.locator('#tel-link')).toHaveAttribute('href', 'tel:+100')
    // $has: own page key, missing key, root key, a key of the route object passed in
    for (const [id, value] of [
      ['#has-existing-key', 'true'],
      ['#has-missing-key', 'false'],
      ['#has-global-key', 'true'],
      ['#has-with-route-object', 'true'],
    ]) {
      await expect(page.locator(id!), id).toHaveText(value!)
    }

    // step 6: open the switcher → label, names, hrefs (with locale baseUrl), hreflang, current locale disabled
    // was: basic › test locale switching on page (en half)
    await page.click('#locale-switcher button')
    await expect(page.locator('.switcher-locale-en')).toBeVisible()
    await expect(page.locator('.language-switcher')).toHaveText('English ▾')
    const switcher = [
      ['en', 'English', '/page', 'en_EN'],
      ['de', 'German', '/de/page', 'de_DE'],
      ['ru', 'Russian', '/ru/page', 'ru_RU'],
      ['fr', 'French', 'https://fr.example.com/page', 'fr_FR'],
      ['ch', 'Chinese', 'https://test.example.com/ch/page', 'ch_CH'],
    ]
    for (const [code, name, href, hreflang] of switcher) {
      const item = page.locator(`.switcher-locale-${code}`)
      await expect(item).toHaveText(name!)
      await expect(item).toHaveAttribute('href', href!)
      await expect(item).toHaveAttribute('hreflang', hreflang!)
    }
    await expect(page.locator('.switcher-locale-en')).toHaveCSS('cursor', 'not-allowed')
    // the open dropdown covers the #link-* row, so close it again
    await page.click('#locale-switcher button')
    await expect(page.locator('.switcher-locale-en')).toBeHidden()

    // step 7: click #link-de → /de/page with de values, query kept in localeRoute, external link unchanged
    // was: basic › test locale switching on page (de half), › via links, › pluralization and parameters; reactivity › computed translations update…
    await page.click('#link-de')
    await expect(page).toHaveURL('/de/page')
    await expect(page.locator('#locale')).toHaveText('Current Locale: de')
    await expect(page.locator('#locale-name')).toHaveText('German')
    await expect(page.locator('#translation')).toHaveText('Page example in de')
    await expect(page.locator('#translation-global')).toHaveText('example de')
    await expect(page.locator('#comp1')).toHaveText('de text')
    await expect(page.locator('#plural')).toHaveText('2 Äpfel')
    await expect(page.locator('#plural-component')).toHaveText('5 Äpfel')
    await expect(page.locator('#computed-ts')).toHaveText('Page example in de')
    await expect(page.locator('#computed-t')).toHaveText('example de')
    await expect(page.locator('#localized-route')).toHaveText('/de/page')
    await expect(page.locator('#localized-route-2')).toHaveText('/de/news/aaa?info=1111')
    await expect(page.locator('#localized-path')).toHaveText('/de/news/aaa?info=1111')
    await expect(page.locator('#external-link')).toHaveAttribute('href', 'https://www.external-link.fr')

    // step 8: open the switcher → German label, de disabled
    await page.click('#locale-switcher button')
    await expect(page.locator('.switcher-locale-de')).toBeVisible()
    await expect(page.locator('.language-switcher')).toHaveText('German ▾')
    await expect(page.locator('.switcher-locale-de')).toHaveCSS('cursor', 'not-allowed')
    await page.click('#locale-switcher button')
    await expect(page.locator('.switcher-locale-de')).toBeHidden()

    // step 9: #link-en → /page in en; then de, en, de in quick succession → ends German
    // was: reactivity › computed translations update…, › computed with $ts (back to en), › concurrency: parallel locale switch
    await page.click('#link-en')
    await expect(page).toHaveURL('/page')
    await expect(page.locator('#locale')).toHaveText('Current Locale: en')
    await expect(page.locator('#locale-name')).toHaveText('English')
    await expect(page.locator('#translation')).toHaveText('Page example in en')
    await expect(page.locator('#computed-ts')).toHaveText('Page example in en')
    await expect(page.locator('#computed-t')).toHaveText('example en')
    for (const [link, url] of [
      ['#link-de', '/de/page'],
      ['#link-en', '/page'],
      ['#link-de', '/de/page'],
    ]) {
      await page.click(link!)
      await expect(page).toHaveURL(url!)
    }
    await expect(page.locator('#locale-name')).toHaveText('German')
    await expect(page.locator('#translation')).toHaveText('Page example in de')

    // step 10: open /de/page directly (SSR de) → page, global and component translations
    await goto('/de/page', { waitUntil: 'hydration' })
    await expect(page.locator('#translation')).toHaveText('Page example in de')
    await expect(page.locator('#translation-global')).toHaveText('example de')
    await expect(page.locator('#comp1')).toHaveText('de text')

    // step 11: open /de → de head, activeStyle; #page-link → /de/page → /de; open /ru → ru head
    // was: basic › test head (de, ru), › i18n-link applies activeStyle… (/de), › test routes (de), › test index (de)
    await goto('/de', { waitUntil: 'hydration' })
    await expect(page.locator('#locale')).toHaveText('de')
    await expectHomeHead(page, base, 'de')
    await expect(page.locator('#home-link')).toHaveCSS('color', 'rgb(255, 0, 0)')
    await expect(page.locator('#page-link-styled')).not.toHaveCSS('color', 'rgb(255, 0, 0)')
    await page.click('#page-link')
    await expect(page).toHaveURL('/de/page')
    await page.click('#page-link')
    await expect(page).toHaveURL('/de')
    await goto('/ru', { waitUntil: 'hydration' })
    await expectHomeHead(page, base, 'ru')

    // step 13: open /ru/page (no ru page file) → the raw key
    // was: basic › test handling of missing locale data
    await goto('/ru/page', { waitUntil: 'hydration' })
    await expect(page.locator('#translation')).toHaveText('page.example')
  })

  test('formatting and page-level routes', async ({ browser, baseURL }) => {
    // A context pinned to UTC, so $td / $tdr match the expected values computed here.
    const context = await browser.newContext({ baseURL, timezoneId: 'UTC' })
    const page = await context.newPage()
    const goto = async (path: string) => {
      await page.goto(path)
      await page.waitForFunction(() => (globalThis as { useNuxtApp?: () => { isHydrating?: boolean } }).useNuxtApp?.()?.isHydrating === false)
    }
    try {
      // Same pipeline as pages/locale-test.vue, in UTC: 14 months back, day 1, ISO date, parsed back.
      const d = new Date()
      d.setUTCFullYear(d.getUTCFullYear() - 1)
      d.setUTCMonth(d.getUTCMonth() - 2)
      d.setUTCDate(1)
      const oneYearAgo = new Date(d.toISOString().split('T')[0]!)
      const years = Math.floor((Date.now() - oneYearAgo.getTime()) / 1000 / 31536000)
      const date = (l: string) => new Intl.DateTimeFormat(l, { timeZone: 'UTC' }).format(oneYearAgo)
      const rel = (l: string) => new Intl.RelativeTimeFormat(l).format(-years, 'year')

      const rows = {
        en: {
          h1: 'Locale Test Page',
          content: 'This is a content area.',
          username: 'Hello, John!',
          plurals: ['Nothing', 'You have 1 item', 'You have 2 items', 'You have 3 items'],
          tn: '1,234,567.89',
          td: date('en-US'),
          tdr: rel('en-US'),
          tnC: 'The number is: 1,234,567.89',
          tdC: `The date is: ${date('en-US')}`,
          tdrC: `The relative date is: ${rel('en-US')}`,
          html: 'Bold Text with HTML content.',
        },
        de: {
          h1: 'Sprachtestseite',
          content: 'Dies ist ein Inhaltsbereich.',
          username: 'Hallo, John!',
          plurals: ['Nichts', 'Sie haben 1 Artikel', 'Sie haben 2 Artikel', 'Sie haben 3 Artikel'],
          tn: '1.234.567,89',
          td: date('de-DE'),
          tdr: rel('de-DE'),
          tnC: 'Die Zahl ist: 1.234.567,89',
          tdC: `Das Datum ist: ${date('de-DE')}`,
          tdrC: `Das relative Datum ist: ${rel('de-DE')}`,
          html: 'Fetter Text mit HTML-Inhalt.',
        },
        ru: {
          h1: 'Страница теста языка',
          content: 'Это раздел содержимого.',
          username: 'Привет, John!',
          plurals: ['Ничего нет', 'У вас 1 предмет', 'У вас 2 предмета', 'У вас 3 предмета'],
          tn: '1 234 567,89',
          td: date('ru-RU'),
          tdr: rel('ru-RU'),
          tnC: 'Число: 1 234 567,89',
          tdC: `Дата: ${date('ru-RU')}`,
          tdrC: `Относительная дата: ${rel('ru-RU')}`,
          html: 'Жирный текст с HTML-содержимым.',
        },
      }
      const expectLocaleTest = async (r: (typeof rows)['en']) => {
        await expect(page.locator('h1')).toHaveText(r.h1)
        await expect(page.locator('#content')).toHaveText(r.content)
        await expect(page.locator('#username')).toHaveText(r.username)
        for (const [n, text] of r.plurals.entries()) await expect(page.locator(`#plural-${n}`)).toHaveText(text)
        await expect(page.locator('#number-tn')).toHaveText(r.tn)
        await expect(page.locator('#date-td')).toHaveText(r.td)
        await expect(page.locator('#date-tdr')).toHaveText(r.tdr)
        await expect(page.locator('#number-tn-component')).toHaveText(r.tnC)
        await expect(page.locator('#date-td-component')).toHaveText(r.tdC)
        await expect(page.locator('#date-tdr-component')).toHaveText(r.tdrC)
        await expect(page.locator('#html-content')).toHaveText(r.html)
      }

      // step 1: open /locale-test → en $t params, plurals 0–3, $tn, $td, $tdr, components, html
      // was: basic › test locale switching on locale-test page (en); reactivity › useHead updates…, › i18n-t params
      await goto('/locale-test')
      await expect(page).toHaveURL('/locale-test')
      await expectLocaleTest(rows.en)
      await expect(page.locator('#number-params')).toHaveText('Distance: 5 km')
      // useI18n's bare aliases: t answers like $t, helper is the plugin's
      await expect(page.locator('#use-i18n-t')).toHaveText((await page.locator('h1').textContent())!)
      await expect(page.locator('#use-i18n-helper')).toHaveText('function')
      await expect(page.locator('#link-de')).toHaveAttribute('href', '/de/locale-page-modify')

      // step 2: click #link-de → /de/locale-page-modify with de formatting
      // was: basic › test locale switching on locale-test page (de), › localized content changes on navigation
      await page.click('#link-de')
      await expect(page).toHaveURL('/de/locale-page-modify')
      await expectLocaleTest(rows.de)
      await expect(page.locator('#number-params')).toHaveText('Entfernung: 5 km')
      await expect(page.locator('#link-ru')).toHaveAttribute('href', '/ru/locale-page-modify-ru')

      // step 3: click #link-ru → /ru/locale-page-modify-ru with ru formatting
      await page.click('#link-ru')
      await expect(page).toHaveURL('/ru/locale-page-modify-ru')
      await expectLocaleTest(rows.ru)
      await expect(page.locator('#number-params')).toHaveText('Расстояние: 5 km')

      // step 4: /locale-conf → page-level routes in localeRoute data and switchLocaleRoute; #locale-de → /de/locale-conf-modify
      // was: basic › test locale switching and content on locale-conf page
      await goto('/locale-conf')
      await expect(page.locator('h1')).toHaveText('Locale Test Page')
      await expect(page.locator('#content')).toHaveText('This is a content area.')
      await expect(page.locator('#username')).toHaveText('Hello, John!')
      await expect(page.locator('#plural')).toHaveText('You have 2 items.')
      await expect.poll(() => page.locator('#html-content').innerHTML()).toContain('<strong>Bold Text</strong> with HTML content.')
      const routeData = page.locator('.locale-route-data:nth-of-type(1)')
      await expect(routeData).toContainText('"path": "/locale-conf"')
      await expect(routeData).toContainText('"fullPath": "/locale-conf"')
      await expect(routeData).toContainText('"href": "/locale-conf"')
      await expect(page.locator('#locale-en')).toHaveAttribute('href', '/locale-conf')
      await expect(page.locator('#locale-de')).toHaveAttribute('href', '/de/locale-conf-modify')
      await page.click('#locale-de')
      await expect(page).toHaveURL('/de/locale-conf-modify')
      await expect(page.locator('h1')).toHaveText('Sprachtestseite')
      await expect(page.locator('#content')).toHaveText('Dies ist ein Inhaltsbereich.')
      await expect(page.locator('#username')).toHaveText('Hallo, John!')
      await expect(page.locator('#plural')).toHaveText('Sie haben 2 Artikel.')
      await expect.poll(() => page.locator('#html-content').innerHTML()).toContain('<strong>Fetter Text</strong> mit HTML-Inhalt.')
      await expect(page.locator('#locale-en')).toHaveAttribute('href', '/locale-conf')
      await expect(page.locator('#locale-de')).toHaveAttribute('href', '/de/locale-conf-modify')

      // step 5: /custom-props → custom locale props of the current locale and the list; /de/custom-props → de
      // was: basic › custom locale properties are accessible via $getLocales
      await goto('/custom-props')
      await expect(page.locator('#current-locale')).toHaveText('en')
      await expect(page.locator('#current-flag')).toHaveText('🇬🇧')
      await expect(page.locator('#current-currency')).toHaveText('GBP')
      for (const [code, flag, currency] of [
        ['en', '🇬🇧', 'GBP'],
        ['de', '🇩🇪', 'EUR'],
        ['ru', '🇷🇺', 'RUB'],
      ]) {
        const li = page.locator(`#locale-list li[data-code="${code}"]`)
        await expect(li).toHaveAttribute('data-flag', flag!)
        await expect(li).toHaveAttribute('data-currency', currency!)
      }
      await goto('/de/custom-props')
      await expect(page.locator('#current-locale')).toHaveText('de')
      await expect(page.locator('#current-flag')).toHaveText('🇩🇪')
      await expect(page.locator('#current-currency')).toHaveText('EUR')
    } finally {
      await context.close()
    }
  })

  test('routing: links, slugs, query/hash, redirects, 404, client-only', async ({ page, goto, request }) => {
    // step 1: /news/1 → id, data; article link; news-4 link; switchLocaleRoute keeps the id per locale
    // was: basic › test navigation and locale switching on news page
    await goto('/news/1', { waitUntil: 'hydration' })
    await expect(page.locator('.news-id')).toHaveText('id: 1')
    await expect(page.locator('.news-data')).toBeVisible()
    await page.click('.link-article-1')
    await expect(page).toHaveURL('/articles/1')
    await goto('/news/1', { waitUntil: 'hydration' })
    await page.click('.link-news-4')
    await expect(page).toHaveURL('/news/4')
    for (const [cls, url] of [
      ['.locale-en', '/news/4'],
      ['.locale-ru', '/ru/news/4'],
      ['.locale-de', '/de/news/4'],
    ]) {
      await page.click(cls!)
      await expect(page).toHaveURL(url!)
    }

    // step 2: /articles/1 → id, data; news link; locale links per locale
    // was: basic › test navigation and locale switching on articles page
    await goto('/articles/1', { waitUntil: 'hydration' })
    await expect(page.locator('.article-id')).toHaveText('id: 1')
    await expect(page.locator('.article-data')).toBeVisible()
    await page.click('.link-news-1')
    await expect(page).toHaveURL('/news/1')
    await goto('/articles/1', { waitUntil: 'hydration' })
    for (const [cls, url] of [
      ['.locale-en', '/articles/1'],
      ['.locale-ru', '/ru/articles/1'],
      ['.locale-de', '/de/articles/1'],
    ]) {
      await page.click(cls!)
      await expect(page).toHaveURL(url!)
    }

    // step 3: localeRoute keeps the query, drops the hash; a string path keeps its query; locale switch keeps query + hash
    // was: basic › test query parameters and hash on news page; reactivity › preserves query params and hash…, › complex query and hash
    await goto('/news/2?a=b#tada', { waitUntil: 'hydration' })
    await expect(page.locator('.news-id')).toHaveText('id: 2')
    await expect(page).toHaveURL('/news/2?a=b#tada')
    await page.click('.link-news-2')
    await expect(page).toHaveURL('/news/2?a=b')
    await page.click('.link-news-3-string')
    await expect(page).toHaveURL('/news/3?sort=date')
    await goto('/news/2?search=vue&page=1#top', { waitUntil: 'hydration' })
    await expect(page).toHaveURL(/\/news\/2\?search=vue&page=1#top/)
    for (const [cls, re] of [
      ['.locale-de', /\/de\/news\/2\?search=vue&page=1#top/],
      ['.locale-ru', /\/ru\/news\/2\?search=vue&page=1#top/],
      ['.locale-en', /\/news\/2\?search=vue&page=1#top/],
    ] as const) {
      await page.click(cls)
      await expect(page).toHaveURL(re)
    }
    await goto('/news/1?category=tech&sort=date&page=2&filter=active#comments', { waitUntil: 'hydration' })
    await page.click('.locale-de')
    await expect(page).toHaveURL(/\/de\/news\/1/)
    const switched = new URL(page.url())
    expect(Object.fromEntries(switched.searchParams)).toEqual({ category: 'tech', sort: 'date', page: '2', filter: 'active' })
    expect(switched.hash).toBe('#comments')

    // step 4: routesLocaleLinks → /dir1/test uses index translations per locale
    // was: basic › test links
    await goto('/dir1/test', { waitUntil: 'hydration' })
    await expect(page.locator('#test_link')).toHaveText('link in en')
    await goto('/de/dir1/test', { waitUntil: 'hydration' })
    await expect(page.locator('#test_link')).toHaveText('link in de')

    // step 5: the activity slug tree, en then de
    // was: locale-slug › Test Locale Path, › Test Locale Path de
    await walkActivity(page, goto, enActivity(''))
    await walkActivity(page, goto, deActivity('/de'))

    // step 6: globalLocaleRoutes custom paths per locale; /unlocalized stays; GET /de/unlocalized → 404
    // was: basic › Test globalLocaleRoutes for page2 and unlocalized
    for (const url of ['/custom-page2-en', '/de/custom-page2-de', '/ru/custom-page2-ru', '/unlocalized']) {
      await goto(url, { waitUntil: 'hydration' })
      await expect(page).toHaveURL(url)
    }
    expect((await request.get('/de/unlocalized')).status()).toBe(404)

    // step 7: routeRules redirects → /old-product → /page, /de/old-product stays, /ru/old-product → /ru/page
    // was: basic › redirect from /old-product to /products
    for (const [from, to] of [
      ['/old-product', '/page'],
      ['/de/old-product', '/de/old-product'],
      ['/ru/old-product', '/ru/page'],
    ]) {
      await goto(from!, { waitUntil: 'hydration' })
      await expect(page).toHaveURL(to!)
    }

    // step 8: /fr/inventory → fr text; #link-en → /inventory en text, no flicker to the raw key, no missing-key warning
    // was: basic › repro #210: component-local $defineI18nRoute flickers to key
    const missing = collectConsole(page, (msg) => msg.text().includes('[i18n] Missing key') && msg.text().includes('vehicleType'))
    await goto('/fr/inventory', { waitUntil: 'hydration' })
    await expect(page.locator('#vehicle-type')).toHaveText('Type de véhicule')
    await page.click('#link-en')
    await expect(page).toHaveURL('/inventory')
    await expect(page.locator('#vehicle-type')).toHaveText('Vehicle type')
    // Intentional bounded negative check: the bug was a transient flicker back to the key after the switch,
    // so the wait for the key must time out (1.2 s); a web-first assertion cannot express "never".
    const sawKey = await page
      .waitForFunction(() => document.querySelector('#vehicle-type')?.textContent?.trim() === 'vehicleType', undefined, { timeout: 1200 })
      .then(() => true)
      .catch(() => false)
    expect(sawKey).toBe(false)
    missing.stop()
    expect(missing.messages).toEqual([])

    // step 9: /client and /de/client SSR lack the client-only text; the client renders it with locale and $t
    // was: basic › renders only on client; no-ssr › no-ssr test (whole-app ssr:false recipe dropped)
    for (const url of ['/client', '/de/client']) {
      expect(await (await request.get(url)).text()).not.toContain('Client only page - SSR disabled')
    }
    await goto('/client', { waitUntil: 'hydration' })
    await expect(page.locator('#client-text')).toHaveText('Client only page - SSR disabled')
    await expect(page.locator('#client-locale')).toHaveText('en')
    await expect(page.locator('#client-t')).toHaveText('English')
    await goto('/de/client', { waitUntil: 'hydration' })
    await expect(page.locator('#client-text')).toHaveText('Client only page - SSR disabled')
    await expect(page.locator('#client-locale')).toHaveText('de')
    await expect(page.locator('#client-t')).toHaveText('Deutsch')
  })

  test('per-page meta toggles', async ({ page, goto, baseURL }) => {
    const base = baseURL.replace(/\/$/, '')
    const i18nTags = [
      'meta#i18n-og',
      'meta#i18n-og-url',
      'link#i18n-can',
      'link#i18n-alternate-en_EN',
      'link#i18n-alternate-de_DE',
      'link#i18n-alternate-ru_RU',
      'link#i18n-xd',
    ]

    // step 1: /disable-meta-all in en, de, fr → no i18n tags
    // was: basic › disable meta tags completely
    // /disable-meta-config: the same through the routeDisableMeta option
    for (const url of ['/disable-meta-all', '/de/disable-meta-all', '/fr/disable-meta-all', '/disable-meta-config']) {
      await goto(url, { waitUntil: 'hydration' })
      await expect(page.locator('h1')).toBeVisible()
      for (const tag of i18nTags) await expect(page.locator(tag)).not.toBeAttached()
    }

    // step 2: /disable-meta-locale → en none; de present; fr uses its baseUrl
    // was: basic › disable meta tags for specific locale
    await goto('/disable-meta-locale', { waitUntil: 'hydration' })
    await expect(page.locator('h1')).toHaveText('Disable Meta Locale')
    for (const tag of i18nTags) await expect(page.locator(tag)).not.toBeAttached()
    await goto('/de/disable-meta-locale', { waitUntil: 'hydration' })
    await expect(page.locator('h1')).toHaveText('Disable Meta Locale')
    await expect(page.locator('meta#i18n-og')).toHaveAttribute('content', 'de_DE')
    await expect(page.locator('meta#i18n-og-url')).toHaveAttribute('content', `${base}/de/disable-meta-locale`)
    await expect(page.locator('link#i18n-can')).toHaveAttribute('href', `${base}/de/disable-meta-locale`)
    await expect(page.locator('link#i18n-alternate-de_DE')).toHaveAttribute('href', `${base}/de/disable-meta-locale`)
    await expect(page.locator('link#i18n-alternate-fr_FR')).toHaveAttribute('href', 'https://fr.example.com/disable-meta-locale')
    await goto('/fr/disable-meta-locale', { waitUntil: 'hydration' })
    await expect(page.locator('h1')).toHaveText('Disable Meta Locale')
    await expect(page.locator('meta#i18n-og')).toHaveAttribute('content', 'fr_FR')
    await expect(page.locator('meta#i18n-og-url')).toHaveAttribute('content', 'https://fr.example.com/disable-meta-locale')
    await expect(page.locator('link#i18n-can')).toHaveAttribute('href', 'https://fr.example.com/disable-meta-locale')
    await expect(page.locator('link#i18n-alternate-de_DE')).toHaveAttribute('href', `${base}/de/disable-meta-locale`)
    await expect(page.locator('link#i18n-alternate-fr_FR')).toHaveAttribute('href', 'https://fr.example.com/disable-meta-locale')
  })

  test('missing-key handler', async ({ page, goto }) => {
    // step 1: /missing-handler-test → raw key, no handler; set → called with locale + key; remove → removed
    // was: basic › test missing handler functionality
    await goto('/missing-handler-test', { waitUntil: 'hydration' })
    await expect(page.locator('#missing-key')).toHaveText('non-existent-key')
    await expect(page.locator('#handler-status')).toHaveText('No handler')
    await page.click('#set-handler')
    await expect(page.locator('#handler-status')).toContainText('Handler called: en, non-existent-key')
    await page.click('#remove-handler')
    await expect(page.locator('#handler-status')).toHaveText('Handler removed')
  })

  test('server routes', async ({ request }) => {
    // step 1: /api/server → server-side translations per locale; a second helper in en gets the en
    // dictionary, not the first one's (F4)
    // was: server › test server-side translations
    for (const code of ['en', 'ru']) {
      const res = await request.get(`/api/server?locale=${code}`)
      expect(res.status()).toBe(200)
      expect(await res.json()).toEqual({ hello: `test_val_${code}`, helloEn: 'test_val_en' })
    }

    // step 2: /api/locale-info → locale from query, Accept-Language, cookie, and the default fallback
    // was: locale-server-middleware › en, › ru, › Accept-Language, › cookie, › fallback, › structure (no `if (data.locale)` guard)
    const info = async (path: string, headers?: Record<string, string>) => {
      const res = await request.get(path, { headers })
      expect(res.status()).toBe(200)
      const body = await res.json()
      expect(body.success).toBe(true)
      return body.data
    }
    const en = await info('/api/locale-info?locale=en')
    expect(en).toMatchObject({ current: 'en', default: 'en', isDefault: true, isFallback: true })
    expect(en.available).toEqual(expect.arrayContaining(['en', 'ru']))
    expect(en.locale).toBeDefined()
    const ru = await info('/api/locale-info?locale=ru')
    expect(ru).toMatchObject({ current: 'ru', default: 'en', isDefault: false, isFallback: false })
    expect(ru.available).toEqual(expect.arrayContaining(['en', 'ru']))
    expect(typeof ru.fallback).toBe('string')
    expect(typeof ru.locale.code).toBe('string')
    // F3: autoDetectLanguage: false in this app — Accept-Language does not pick the locale, the cookie does
    expect((await info('/api/locale-info', { 'Accept-Language': 'ru-RU,ru;q=0.9,en;q=0.8' })).current).toBe('en')
    // F3: no localeCookie in this app (default null) — a user-locale cookie is not read either
    expect((await info('/api/locale-info', { Cookie: 'user-locale=ru' })).current).toBe('en')
    expect(await info('/api/locale-info')).toMatchObject({ current: 'en', isDefault: true })

    // step 2b: a server route outside /api keeps the API order: ?locale and a [locale] param pick the
    // locale (the page-render locale of that URL would be en)
    for (const path of ['/server-locale?locale=ru', '/server-locale/ru']) {
      const res = await request.get(path)
      expect(res.status(), path).toBe(200)
      expect(await res.json(), path).toEqual({ current: 'ru', hello: 'test_val_ru' })
    }

    // step 3: a page without its own folder → a non-empty subset of index's dictionary
    // was: server › a page without its own folder gets the root dictionary
    const index = await (await request.get('/_locales/index/en/data.json')).json()
    const unknown = await request.get('/_locales/no-such-page-123/en/data.json')
    expect(unknown.status()).toBe(200)
    const root = await unknown.json()
    expect(Object.keys(root).length).toBeGreaterThan(0)
    expect(Object.keys(root).every((key) => key in index)).toBe(true)
  })
})
