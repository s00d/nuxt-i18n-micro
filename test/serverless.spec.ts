import { fileURLToPath } from 'node:url'
import { expect, test } from '@nuxt/test-utils/playwright'

// Test: Serverless environment with caching
// This simulates behavior similar to Cloudflare Workers with KV cache
test.use({
  nuxt: {
    rootDir: fileURLToPath(new URL('./fixtures/serverless', import.meta.url)),
  },
})

test.describe('serverless with caching', () => {
  test('translations load correctly on first request (cold start)', async ({ page, goto }) => {
    await goto('/', { waitUntil: 'hydration' })

    // Global translations should work
    await expect(page.locator('#hello')).toHaveText('Hello World')
    await expect(page.locator('#welcome')).toHaveText('Welcome to our site')

    // Page-specific translations should work
    await expect(page.locator('#pageTitle')).toHaveText('Home Page')
    await expect(page.locator('#pageContent')).toHaveText('This is the home page content')
  })

  test('translations work on subsequent requests (warm cache)', async ({ page, goto }) => {
    // First request
    await goto('/', { waitUntil: 'hydration' })
    await expect(page.locator('#hello')).toHaveText('Hello World')

    // Navigate away and back (simulates subsequent request)
    await goto('/de', { waitUntil: 'hydration' })
    await expect(page.locator('#hello')).toHaveText('Hallo Welt')
    await expect(page.locator('#pageTitle')).toHaveText('Startseite')

    // Back to English
    await goto('/', { waitUntil: 'hydration' })
    await expect(page.locator('#hello')).toHaveText('Hello World')
  })

  test('all locales have correct translations', async ({ page, goto }) => {
    // English
    await goto('/', { waitUntil: 'hydration' })
    await expect(page.locator('#locale')).toHaveText('en')
    await expect(page.locator('#hello')).toHaveText('Hello World')

    // German
    await goto('/de', { waitUntil: 'hydration' })
    await expect(page.locator('#locale')).toHaveText('de')
    await expect(page.locator('#hello')).toHaveText('Hallo Welt')

    // French
    await goto('/fr', { waitUntil: 'hydration' })
    await expect(page.locator('#locale')).toHaveText('fr')
    await expect(page.locator('#hello')).toHaveText('Bonjour le monde')
  })

  test('no placeholder keys shown (translations resolved)', async ({ page, goto }) => {
    await goto('/', { waitUntil: 'hydration' })

    // Check that no placeholder keys are shown
    const helloText = await page.locator('#hello').textContent()
    const welcomeText = await page.locator('#welcome').textContent()
    const pageTitleText = await page.locator('#pageTitle').textContent()

    // Should not contain the key itself (which would indicate translation failure)
    expect(helloText).not.toBe('hello')
    expect(welcomeText).not.toBe('welcome')
    expect(pageTitleText).not.toBe('pageTitle')

    // Should contain actual translations
    expect(helloText).toBe('Hello World')
    expect(welcomeText).toBe('Welcome to our site')
    expect(pageTitleText).toBe('Home Page')
  })

  test('translations work after multiple page loads (cache consistency)', async ({ page, goto }) => {
    // Simulate multiple requests to the same page
    for (let i = 0; i < 3; i++) {
      await goto('/', { waitUntil: 'hydration' })
      await expect(page.locator('#hello')).toHaveText('Hello World')
      await expect(page.locator('#pageTitle')).toHaveText('Home Page')
    }
  })
})
