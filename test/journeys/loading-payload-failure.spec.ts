import type { Route } from '@playwright/test'
import { describe, expect, test } from '../helpers/guarded-test.ts'

const json = (body: string) => (route: Route) => route.fulfill({ status: 200, contentType: 'application/json', body })
const status = (code: number) => (route: Route) => route.fulfill({ status: code, body: 'failed' })

const FAILURES: [string, (route: Route) => Promise<void>][] = [
  ['abort', (route) => route.abort()],
  ['500', status(500)],
  ['404', status(404)],
  ['bad JSON', json('{ not json')],
  ['array body', json('["a"]')],
]

// `strategy-prefix`: app.vue renders root keys around every page, so a layout string shows which dictionary is active.
/** The console line of a blocked payload request, with the URL the guard adds; a failed asset still fails the test. */
const FAILED_PAYLOAD = /Failed to load resource.*\/_locales\//

describe('J8 translation loading: a chunk fails on the client', () => {
  test.override({ harness: 'strategy-prefix' })

  test.for(FAILURES)('%s keeps the old dictionary, the next navigation loads it', async ([, fail], { page, goto, guard }) => {
    guard.allow(FAILED_PAYLOAD)
    await page.route('**/_locales/contact/en/**', fail)
    await page.route('**/_locales/index/de/**', fail)

    // step 1: open /en → layout string from the en chunk
    await goto('/en', { waitUntil: 'hydration' })
    await expect(page.locator('.layout-title')).toHaveText('My App')

    // step 2: navigate to a page whose chunk fails → the navigation completes, the layout keeps its string
    await page.click('#contact')
    await expect(page).toHaveURL('/en/contact')
    await expect(page.locator('.layout-title')).toHaveText('My App')

    // step 3: back on / and on a working chunk, the dictionary is whole again
    await page.goBack()
    await expect(page).toHaveURL('/en')
    await expect(page.locator('#content')).toHaveText('en')

    // step 4: switching to a locale whose chunk fails keeps the old texts on the new URL
    await page.click('.language-switcher')
    await page.click('a.switcher-locale-de')
    await expect(page).toHaveURL('/de')
    await expect(page.locator('.layout-title')).toHaveText('My App')

    // step 5: the failure is not cached: once the chunk answers, a navigation loads de
    await page.unroute('**/_locales/contact/en/**')
    await page.unroute('**/_locales/index/de/**')
    await page.click('#contact')
    await expect(page).toHaveURL('/de/kontakt')
    await expect(page.locator('.layout-title')).toHaveText('Meine App')
    await page.goBack()
    await expect(page).toHaveURL('/de')
    await expect(page.locator('#content')).toHaveText('de')
  })

  test('a failed first chunk is loaded again on the way back', async ({ page, goto, guard }) => {
    guard.allow(FAILED_PAYLOAD)
    await page.route('**/_locales/index/en/**', (route) => route.abort())

    // step 1: open /en with its chunk failing → the browser has no dictionary for it
    await goto('/en', { waitUntil: 'hydration' })

    // step 2: the chunk answers again, leave and come back → translated
    await page.unroute('**/_locales/index/en/**')
    await page.click('#contact')
    await expect(page).toHaveURL('/en/contact')
    await page.goBack()
    await expect(page).toHaveURL('/en')
    await expect(page.locator('#content')).toHaveText('en')
  })

  test('the switcher tries a failed locale again', async ({ page, goto, guard }) => {
    guard.allow(FAILED_PAYLOAD)
    await page.route('**/_locales/index/de/**', (route) => route.abort())

    // step 1: switching to de fails → the URL moved, the texts stayed
    await goto('/en', { waitUntil: 'hydration' })
    await page.click('.language-switcher')
    await page.click('a.switcher-locale-de')
    await expect(page).toHaveURL('/de')
    await expect(page.locator('.layout-title')).toHaveText('My App')

    // step 2: the chunk answers again, the same link → de
    await page.unroute('**/_locales/index/de/**')
    await page.click('.language-switcher')
    await page.click('a.switcher-locale-de')
    await expect(page.locator('.layout-title')).toHaveText('Meine App')
    await expect(page.locator('#content')).toHaveText('de')
  })
})
