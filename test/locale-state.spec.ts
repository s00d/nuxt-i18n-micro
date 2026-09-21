import { collectConsole, collectHydrationIssues, getLocaleCookie } from 'untestutils/utils'
import { describe, expect, test } from 'untestutils/vitest'

// Test: no_prefix strategy (default for this fixture)

describe('useState locale override - no_prefix', () => {
  test.override({ harness: 'locale-state-no-prefix' })

  test('server plugin sets locale via useState before i18n init', async ({ page, goto }) => {
    await goto('/', { waitUntil: 'hydration' })

    await expect(page).toHaveURL('/')
    await expect(page.locator('#locale')).toHaveText('ja')
    await expect(page.locator('#greeting')).toHaveText('こんにちは')

    expect(await getLocaleCookie(page)).toBe('ja')
  })

  test('no hydration mismatch when locale set via useState', async ({ page, goto }) => {
    const { messages, stop } = collectHydrationIssues(page)

    await goto('/', { waitUntil: 'hydration' })
    await page.waitForTimeout(500)

    expect(messages.filter((e) => e.text.toLowerCase().includes('hydration'))).toHaveLength(0)
    await expect(page.locator('#greeting')).toHaveText('こんにちは')
    stop()
  })

  test('cookie is not overwritten when useState sets locale', async ({ page, goto }) => {
    const { messages, stop } = collectConsole(page, (msg) => msg.text().includes('cookie') && msg.text().includes('overridden'))

    await goto('/', { waitUntil: 'hydration' })
    await page.waitForTimeout(500)

    expect(messages).toHaveLength(0)
    stop()
  })
})
