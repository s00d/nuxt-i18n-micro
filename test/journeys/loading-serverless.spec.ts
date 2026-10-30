import { describe, expect, test } from 'untestutils/vitest'

describe('J8 translation loading: serverless with cache', () => {
  test.override({ harness: 'serverless' })

  test('cold then warm requests across locales stay consistent', async ({ page, goto }) => {
    // step 1: cold / → global and page translations, exact strings (so no raw keys)
    // was: serverless › cold start; › no placeholder keys shown
    await goto('/', { waitUntil: 'hydration' })
    await expect(page.locator('#locale')).toHaveText('en')
    await expect(page.locator('#hello')).toHaveText('Hello World')
    await expect(page.locator('#welcome')).toHaveText('Welcome to our site')
    await expect(page.locator('#pageTitle')).toHaveText('Home Page')
    await expect(page.locator('#pageContent')).toHaveText('This is the home page content')

    // step 2: /de → de
    // was: serverless › warm cache; › all locales have correct translations
    await goto('/de', { waitUntil: 'hydration' })
    await expect(page.locator('#locale')).toHaveText('de')
    await expect(page.locator('#hello')).toHaveText('Hallo Welt')
    await expect(page.locator('#pageTitle')).toHaveText('Startseite')

    // step 3: /fr → fr
    await goto('/fr', { waitUntil: 'hydration' })
    await expect(page.locator('#locale')).toHaveText('fr')
    await expect(page.locator('#hello')).toHaveText('Bonjour le monde')

    // step 4: / three more times (warm cache) → en each time
    // was: serverless › translations work after multiple page loads
    for (let i = 0; i < 3; i++) {
      await goto('/', { waitUntil: 'hydration' })
      await expect(page.locator('#hello')).toHaveText('Hello World')
      await expect(page.locator('#pageTitle')).toHaveText('Home Page')
    }
  })
})
