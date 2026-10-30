import { describe, expect, test } from '../helpers/guarded-test.ts'
import { ssr } from '../helpers/journeys-b.ts'

describe('J4 loading: plugin:false (basic, BASIC_VARIANT=no-plugin)', () => {
  test.override({ harness: 'basic-no-plugin' })

  test('NP-T1 the app renders and hydrates without the module plugins', async ({ page, goto, baseURL }) => {
    expect((await ssr(baseURL, '/')).status).toBe(200)
    await goto('/', { waitUntil: 'hydration' })
    await expect(page.locator('#plain')).toHaveText('plain app')
  })
})
