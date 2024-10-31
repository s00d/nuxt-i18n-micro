import { fileURLToPath } from 'node:url'
import { expect, test } from '@nuxt/test-utils/playwright'

test.use({
  nuxt: {
    rootDir: fileURLToPath(new URL('./fixtures/named', import.meta.url)),
  },
})

test('test navigation links and buttons', async ({ page, goto }) => {
  // Go to the main page
  await goto('/', { waitUntil: 'hydration' })

  await expect(page.locator('#localized-route-2')).toHaveText('/en/page/id-222?info=1111')
  await expect(page.locator('#localized-path')).toHaveText('/en/page/id-222?info=1111')

  // Test Link 1
  await page.click('#link1')
  await expect(page).toHaveURL('/en/page/my-id')

  // Navigate back to the main page
  await goto('/', { waitUntil: 'hydration' })

  // Test Link 2, go to default locale - de
  await page.click('#link2')
  await expect(page).toHaveURL('/de/test-my-id')

  // Navigate back to the main page
  await goto('/', { waitUntil: 'hydration' })

  // Test Button 3
  await page.click('#link3')
  await expect(page).toHaveURL('/de/page/my-id') // Assuming this is the expected URL for navigateBroken()

  // Navigate back to the main page
  await goto('/', { waitUntil: 'hydration' })

  // Test Button 4
  await page.click('#link4')
  await expect(page).toHaveURL('/de/test-my-id') // Assuming this is the expected URL for navigateBrokenDefaultNuxtPageNaming()

  // Navigate back to the main page
  await goto('/', { waitUntil: 'hydration' })

  await page.click('#link6')
  await expect(page).toHaveURL('/de/page/id-123')
})

test('test navigation links and buttons de', async ({ page, goto }) => {
  // Go to the main page
  await goto('/', { waitUntil: 'hydration' })
  await goto('/de', { waitUntil: 'hydration' })

  await expect(page.locator('#localized-route-2')).toHaveText('/de/page/id-222?info=1111')
  await expect(page.locator('#localized-path')).toHaveText('/de/page/id-222?info=1111')

  // Test Link 1
  await page.click('#link1')
  await expect(page).toHaveURL('/de/page/my-id')

  // Navigate back to the main page
  await goto('/de', { waitUntil: 'hydration' })

  // Test Link 2
  await page.click('#link2')
  await expect(page).toHaveURL('/de/test-my-id')

  // Navigate back to the main page
  await goto('/de', { waitUntil: 'hydration' })

  // Test Button 3
  await page.click('#link3')
  await expect(page).toHaveURL('/de/page/my-id') // Assuming this is the expected URL for navigateBroken()

  // Navigate back to the main page
  await goto('/de', { waitUntil: 'hydration' })

  // Test Button 4
  await page.click('#link4')
  await expect(page).toHaveURL('/de/test-my-id') // Assuming this is the expected URL for navigateBrokenDefaultNuxtPageNaming()

  await goto('/de', { waitUntil: 'hydration' })

  await page.click('#link6')
  await expect(page).toHaveURL('/de/page/id-123')
})
