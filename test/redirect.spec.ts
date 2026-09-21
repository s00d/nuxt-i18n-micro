import { setAcceptLanguage } from 'untestutils/utils'
import { describe, expect, test } from 'untestutils/vitest'

describe('redirect', () => {
  test.override({ harness: 'redirect' })

  test('language detection redirects based on Accept-Language', async ({ page, goto }) => {
    await setAcceptLanguage(page, 'en-US,en;q=0.9')
    await goto('/ru/page', { waitUntil: 'hydration' })
    expect(new URL(page.url()).pathname).toBe('/page')
    await expect(page.locator('#locale')).toHaveText('en')
  })
})
