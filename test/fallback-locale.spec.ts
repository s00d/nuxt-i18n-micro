import { fileURLToPath } from 'node:url'
import { expect, test } from '@nuxt/test-utils/playwright'

test.use({
  nuxt: {
    rootDir: fileURLToPath(new URL('./fixtures/fallback-locale', import.meta.url)),
  },
  // launchOptions: {
  //   headless: false, // Show browser
  //   slowMo: 500, // Slow down execution steps (in milliseconds) for better visibility
  // },
})

test.describe('fallback-locale', () => {
  test('verify fallbackLocale functionality and content update when switching', async ({ page, goto }) => {
    // Go to the main page
    await goto('/', { waitUntil: 'hydration' })

    // Check the text inside the div with id 'text'
    await expect(page.locator('.welcome')).toHaveText('Welcome to the page!') // Adjust expected text as needed
    await expect(page.locator('.title')).toHaveText('Page Title!') // Adjust expected text as needed
    await expect(page.locator('.global')).toHaveText('global en') // Adjust expected text as needed
    await expect(page.locator('.page')).toHaveText('page en') // Adjust expected text as needed
    await expect(page.locator('.arr')).toHaveText('[ "aaaa", "bbbb", "cccc" ]') // Adjust expected text as needed
    await expect(page.locator('.arr_obj')).toHaveText('[ { "key1": "val" }, { "key2": "val2" } ]') // Adjust expected text as needed

    // Click on the language switcher to show language options using a class
    await page.click('.language-switcher') // Assuming the switcher has a class 'language-switcher'

    // Click on the link to switch language to 'de' using a class
    await page.click('a.switcher-locale-de') // Click the link to switch to German locale with class 'switcher-locale-de'

    // Wait for the language switch to take effect
    await page.waitForTimeout(500) // Wait briefly to ensure the language change is applied, adjust timing if needed

    await expect(page).toHaveURL('/de')

    await expect(page.locator('.welcome')).toHaveText('Willkommen auf der Seite!') // Adjust expected text as needed
    await expect(page.locator('.title')).toHaveText('Page Title!') // Adjust expected text as needed
    await expect(page.locator('.global')).toHaveText('global de') // Adjust expected text as needed
    await expect(page.locator('.page')).toHaveText('page de') // Adjust expected text as needed

    await goto('/de', { waitUntil: 'hydration' })

    await page.waitForTimeout(500)

    await expect(page).toHaveURL('/de')

    await expect(page.locator('.welcome')).toHaveText('Willkommen auf der Seite!') // Adjust expected text as needed
    await expect(page.locator('.title')).toHaveText('Page Title!') // Adjust expected text as needed
    await expect(page.locator('.arr')).toHaveText('[ "dddd" ]') // Adjust expected text as needed
    await expect(page.locator('.arr_obj')).toHaveText('[ { "key": "vvvv" } ]') // Adjust expected text as needed
    await expect(page.locator('.global')).toHaveText('global de') // Adjust expected text as needed
    await expect(page.locator('.page')).toHaveText('page de') // Adjust expected text as needed

    // Click on the language switcher to show language options using a class
    await page.click('.language-switcher') // Assuming the switcher has a class 'language-switcher'

    // Click on the link to switch language to 'de' using a class
    await page.click('a.switcher-locale-ru') // Click the link to switch to German locale with class 'switcher-locale-de'

    // Wait for the language switch to take effect
    await page.waitForTimeout(500) // Wait briefly to ensure the language change is applied, adjust timing if needed

    await expect(page).toHaveURL('/ru')

    await expect(page.locator('.global')).toHaveText('global en') // Adjust expected text as needed
    await expect(page.locator('.page')).toHaveText('page en') // Adjust expected text as needed

    await goto('/ru', { waitUntil: 'hydration' })

    await page.waitForTimeout(500)

    await expect(page).toHaveURL('/ru')

    await expect(page.locator('.global')).toHaveText('global en') // Adjust expected text as needed
    await expect(page.locator('.page')).toHaveText('page en') // Adjust expected text as needed

    // Click on the language switcher to show language options using a class
    await page.click('.language-switcher') // Assuming the switcher has a class 'language-switcher'

    // Click on the link to switch language to 'de' using a class
    await page.click('a.switcher-locale-fr') // Click the link to switch to German locale with class 'switcher-locale-de'

    // Wait for the language switch to take effect
    await page.waitForTimeout(500) // Wait briefly to ensure the language change is applied, adjust timing if needed

    await expect(page).toHaveURL('/fr')

    await expect(page.locator('.global')).toHaveText('global de') // Adjust expected text as needed
    await expect(page.locator('.page')).toHaveText('page de') // Adjust expected text as needed

    await goto('/fr', { waitUntil: 'hydration' })

    await page.waitForTimeout(500)

    await expect(page).toHaveURL('/fr')

    await expect(page.locator('.global')).toHaveText('global de') // Adjust expected text as needed
    await expect(page.locator('.page')).toHaveText('page de') // Adjust expected text as needed
  })
})
