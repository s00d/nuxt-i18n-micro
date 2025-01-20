import { fileURLToPath } from 'node:url'
import { expect, test } from '@nuxt/test-utils/playwright'

test.use({
  nuxt: {
    rootDir: fileURLToPath(new URL('./fixtures/hook', import.meta.url)),
  },
  // launchOptions: {
  //   headless: false, // Показывать браузер
  //   slowMo: 500, // Замедлить выполнение шагов (в миллисекундах) для лучшей видимости
  // },
})

test.describe('hook', () => {
  test('navigate to test-page, check URL and text, switch language to de and recheck text', async ({ page, goto }) => {
    // Go to the main page
    await goto('/', { waitUntil: 'hydration' })

    await expect(page.locator('#hook')).toHaveText('hook value')

    // Click on the link to navigate to the test-page
    await page.click('#test-page') // Assuming the link has an id 'test-page'

    // Check the text inside the div with id 'text'
    await expect(page.locator('#text')).toHaveText('hook en title') // Adjust expected text as needed

    // Click on the language switcher to show language options using a class
    await page.click('.language-switcher') // Assuming the switcher has a class 'language-switcher'

    // Click on the link to switch language to 'de' using a class
    await page.click('a.switcher-locale-de') // Click the link to switch to German locale with class 'switcher-locale-de'

    // Wait for the language switch to take effect
    await page.waitForTimeout(500) // Wait briefly to ensure the language change is applied, adjust timing if needed

    await expect(page.locator('#hook')).toHaveText('hook value')

    // Recheck the text inside the div with id 'text' after switching language to 'de'
    await expect(page.locator('#text')).toHaveText('hook de title') // Adjust expected text as needed for 'de'
  })
})
