import { fileURLToPath } from 'node:url'
import { expect, test } from '@nuxt/test-utils/playwright'

test.use({
  nuxt: {
    rootDir: fileURLToPath(new URL('./fixtures/transition-merge', import.meta.url)),
  },
})

test.describe('Cumulative merge: translations survive page transition', () => {
  test('page A translations remain visible during leave animation when navigating to page B', async ({ page, goto }) => {
    // 1. Open page A — verify translations work
    await goto('/en/page-a', { waitUntil: 'hydration' })
    await expect(page.locator('#page-a-title')).toHaveText('Page A Title EN')
    await expect(page.locator('#page-a-body')).toHaveText('Page A Body EN')

    // 2. Click link to navigate to page B.
    //    The 1.5 s CSS transition keeps BOTH pages in the DOM simultaneously.
    await page.click('#go-to-b')

    // 3. Wait a short moment for router.beforeEach + switchContext to fire,
    //    but NOT long enough for the transition to finish.
    await page.waitForTimeout(300)

    // 4. Page A is still in the DOM (leave animation running).
    //    Its text must NOT be the raw translation key — the old translations must survive.
    const pageATitle = page.locator('#page-a-title')
    if (await pageATitle.count() > 0) {
      const text = await pageATitle.textContent()
      // The text must be the translated value, not the raw key
      expect(text).not.toBe('pageA.title')
      expect(text).toBe('Page A Title EN')
    }

    // 5. Wait for transition to finish and verify page B loaded correctly
    await page.waitForURL('**/en/page-b')
    await page.waitForTimeout(1600) // transition is 1.5s
    await expect(page.locator('#page-b-title')).toHaveText('Page B Title EN')
    await expect(page.locator('#page-b-body')).toHaveText('Page B Body EN')
  })

  test('navigating back from B to A also preserves translations', async ({ page, goto }) => {
    await goto('/en/page-b', { waitUntil: 'hydration' })
    await expect(page.locator('#page-b-title')).toHaveText('Page B Title EN')

    await page.click('#go-to-a')
    await page.waitForTimeout(300)

    const pageBTitle = page.locator('#page-b-title')
    if (await pageBTitle.count() > 0) {
      const text = await pageBTitle.textContent()
      expect(text).not.toBe('pageB.title')
      expect(text).toBe('Page B Title EN')
    }

    await page.waitForURL('**/en/page-a')
    await page.waitForTimeout(1600)
    await expect(page.locator('#page-a-title')).toHaveText('Page A Title EN')
  })

  test('switching locale clears cache — no cross-language mixing', async ({ page, goto }) => {
    // Start on page A in English
    await goto('/en/page-a', { waitUntil: 'hydration' })
    await expect(page.locator('#page-a-title')).toHaveText('Page A Title EN')

    // Navigate to page A in German
    await goto('/de/page-a', { waitUntil: 'hydration' })
    await expect(page.locator('#page-a-title')).toHaveText('Seite A Titel DE')
    // Shared key must be in German, not English
    await expect(page.locator('#page-a-shared')).toHaveText('Shared DE')
  })
})
