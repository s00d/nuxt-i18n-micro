import { fileURLToPath } from 'node:url'
import { expect, test } from '@nuxt/test-utils/playwright'

test.use({
  nuxt: {
    rootDir: fileURLToPath(new URL('./fixtures/basic', import.meta.url)),
  },
})
test.describe('locale-slug', () => {
  test('Test Locale Path', async ({ page, goto }) => {
    // Test main activity page
    await goto('/activity', { waitUntil: 'hydration' })

    // Check the URL and text content
    await expect(page).toHaveURL('/activity')
    await expect(page.locator('h1')).toHaveText('Activity Parent Page')

    // Check links on the page
    await expect(page.locator('#activity')).toHaveAttribute('href', '/activity')
    await expect(page.locator('#activity-skiing')).toHaveAttribute('href', '/activity/skiing')
    await expect(page.locator('#activity-hiking')).toHaveAttribute('href', '/activity/hiking')
    await expect(page.locator('#activity-skiing-locale')).toHaveAttribute('href', '/activity/book-activity/skiing')
    await expect(page.locator('#activity-hiking-locale')).toHaveAttribute('href', '/activity/book-activity/hiking')
    await expect(page.locator('#activity-locale')).toHaveAttribute('href', '/change-activity')

    // Test link navigation
    await page.click('#activity-skiing')
    await expect(page).toHaveURL('/activity/skiing')
    await expect(page.locator('#title')).toHaveText('Skiing Subpage')
    await expect(page.locator('#text')).toHaveText('Welcome to the page!')

    // Test localized activity page
    await goto('/activity', { waitUntil: 'hydration' })

    await page.click('#activity-hiking')
    await expect(page).toHaveURL('/activity/hiking')
    await expect(page.locator('#title')).toHaveText('Hiking Subpage')
    await expect(page.locator('#text')).toHaveText('Welcome to the page!')

    await goto('/activity', { waitUntil: 'hydration' })

    await page.click('#activity-skiing-locale')
    await expect(page).toHaveURL('/activity/book-activity/skiing')
    await expect(page.locator('#title')).toHaveText('Skiing Locale Subpage')
    await expect(page.locator('#text')).toHaveText('Welcome to the page!')

    await goto('/activity', { waitUntil: 'hydration' })

    await page.click('#activity-hiking-locale')
    await expect(page).toHaveURL('/activity/book-activity/hiking')
    await expect(page.locator('#title')).toHaveText('Hiking Locale Subpage')
    await expect(page.locator('#text')).toHaveText('Welcome to the page!')

    await goto('/activity', { waitUntil: 'hydration' })

    await page.click('#activity-locale')
    await expect(page).toHaveURL('/change-activity')
    await expect(page.locator('#activity-locale-skiing')).toHaveAttribute('href', '/change-activity/book-activity/skiing')
    await expect(page.locator('#activity-locale-hiking')).toHaveAttribute('href', '/change-activity/hiking')

    await page.click('#activity-locale-hiking')
    await expect(page).toHaveURL('/change-activity/hiking')

    await page.click('#activity-locale')

    await page.click('#activity-locale-skiing')
    await expect(page).toHaveURL('/change-activity/book-activity/skiing')
  })

  test('Test Locale Path de', async ({ page, goto }) => {
    // Test main activity page
    await goto('/activity', { waitUntil: 'hydration' })
    await goto('/de/activity', { waitUntil: 'hydration' })

    // Check the URL and text content
    await expect(page).toHaveURL('/de/activity')
    await expect(page.locator('h1')).toHaveText('Activity Parent Page')

    // Check links on the page
    await expect(page.locator('#activity')).toHaveAttribute('href', '/de/activity')
    await expect(page.locator('#activity-skiing')).toHaveAttribute('href', '/de/activity/skiing')
    await expect(page.locator('#activity-hiking')).toHaveAttribute('href', '/de/activity/hiking')
    await expect(page.locator('#activity-skiing-locale')).toHaveAttribute('href', '/de/activity/aktivitaet-buchen/ski-fahren')
    await expect(page.locator('#activity-hiking-locale')).toHaveAttribute('href', '/de/activity/aktivitaet-buchen/wandern')
    await expect(page.locator('#activity-locale')).toHaveAttribute('href', '/de/change-buchen')

    // Test link navigation
    await page.click('#activity-skiing')
    await expect(page).toHaveURL('/de/activity/skiing')
    await expect(page.locator('#title')).toHaveText('Skiing Subpage')
    await expect(page.locator('#text')).toHaveText('Willkommen auf der Seite!')

    // Test localized activity page
    await goto('/de/activity', { waitUntil: 'hydration' })

    await page.click('#activity-hiking')
    await expect(page).toHaveURL('/de/activity/hiking')
    await expect(page.locator('#title')).toHaveText('Hiking Subpage')
    await expect(page.locator('#text')).toHaveText('Willkommen auf der Seite!')

    await goto('/de/activity', { waitUntil: 'hydration' })

    await page.click('#activity-skiing-locale')
    await expect(page).toHaveURL('/de/activity/aktivitaet-buchen/ski-fahren')
    await expect(page.locator('#title')).toHaveText('Skiing Locale Subpage')
    await expect(page.locator('#text')).toHaveText('Willkommen auf der Seite!')

    await goto('/de/activity', { waitUntil: 'hydration' })

    await page.click('#activity-hiking-locale')
    await expect(page).toHaveURL('/de/activity/aktivitaet-buchen/wandern')
    await expect(page.locator('#title')).toHaveText('Hiking Locale Subpage')
    await expect(page.locator('#text')).toHaveText('Willkommen auf der Seite!')

    await goto('/de/activity', { waitUntil: 'hydration' })

    await page.click('#activity-locale')
    await expect(page).toHaveURL('/de/change-buchen')
    await expect(page.locator('#activity-locale-skiing')).toHaveAttribute('href', '/de/change-buchen/aktivitaet-buchen/ski-fahren')
    await expect(page.locator('#activity-locale-hiking')).toHaveAttribute('href', '/de/change-buchen/hiking')

    await page.click('#activity-locale-hiking')
    await expect(page).toHaveURL('/de/change-buchen/hiking')

    await page.click('#activity-locale')

    await page.click('#activity-locale-skiing')
    await expect(page).toHaveURL('/de/change-buchen/aktivitaet-buchen/ski-fahren')
  })
})
