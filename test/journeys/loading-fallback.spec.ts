import type { Page } from '@playwright/test'
import { describe, expect, test } from 'untestutils/vitest'

async function switchTo(page: Page, code: string) {
  await page.click('.language-switcher')
  await page.click(`a.switcher-locale-${code}`)
  await expect(page).toHaveURL(`/${code}`)
}

describe('J8 translation loading: fallbackLocale', () => {
  test.override({ harness: 'fallback-locale' })

  // was: fallback-locale › verify fallbackLocale functionality and content update when switching
  test('global and per-locale fallback chain, by switcher and by direct load', async ({ page, goto }) => {
    // step 1: open / → en texts, arrays and array of objects
    await goto('/', { waitUntil: 'hydration' })
    await expect(page.locator('.welcome')).toHaveText('Welcome to the page!')
    await expect(page.locator('.title')).toHaveText('Page Title!')
    await expect(page.locator('.global')).toHaveText('global en')
    await expect(page.locator('.page')).toHaveText('page en')
    await expect(page.locator('.arr')).toHaveText('[ "aaaa", "bbbb", "cccc" ]')
    await expect(page.locator('.arr_obj')).toHaveText('[ { "key1": "val" }, { "key2": "val2" } ]')

    // step 2: switch to de → de texts, title falls back to en
    await switchTo(page, 'de')
    await expect(page.locator('.welcome')).toHaveText('Willkommen auf der Seite!')
    await expect(page.locator('.title')).toHaveText('Page Title!')
    await expect(page.locator('.global')).toHaveText('global de')
    await expect(page.locator('.page')).toHaveText('page de')

    // step 3: load /de directly → same texts plus de arrays
    await goto('/de', { waitUntil: 'hydration' })
    await expect(page).toHaveURL('/de')
    await expect(page.locator('.welcome')).toHaveText('Willkommen auf der Seite!')
    await expect(page.locator('.title')).toHaveText('Page Title!')
    await expect(page.locator('.arr')).toHaveText('[ "dddd" ]')
    await expect(page.locator('.arr_obj')).toHaveText('[ { "key": "vvvv" } ]')
    await expect(page.locator('.global')).toHaveText('global de')
    await expect(page.locator('.page')).toHaveText('page de')

    // step 4: switch to ru → global fallback en
    await switchTo(page, 'ru')
    await expect(page.locator('.global')).toHaveText('global en')
    await expect(page.locator('.page')).toHaveText('page en')

    // step 5: load /ru directly → still en
    await goto('/ru', { waitUntil: 'hydration' })
    await expect(page).toHaveURL('/ru')
    await expect(page.locator('.global')).toHaveText('global en')
    await expect(page.locator('.page')).toHaveText('page en')

    // step 6: switch to fr → per-locale fallback de
    await switchTo(page, 'fr')
    await expect(page.locator('.global')).toHaveText('global de')
    await expect(page.locator('.page')).toHaveText('page de')

    // step 7: load /fr directly → still de
    await goto('/fr', { waitUntil: 'hydration' })
    await expect(page).toHaveURL('/fr')
    await expect(page.locator('.global')).toHaveText('global de')
    await expect(page.locator('.page')).toHaveText('page de')
  })
})
