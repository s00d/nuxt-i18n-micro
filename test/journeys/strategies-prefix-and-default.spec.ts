import { describe, expect, test } from '../helpers/guarded-test.ts'
import { directRoutes, forcedLocale, walkStrategy } from '../helpers/journeys-b.ts'

describe('J2 strategies: prefix_and_default', () => {
  test.override({ harness: 'strategy-prefix-and-default' })

  // was: prefix-and-default › navigate/switch
  test('PAD-T1 walk: / and /en both serve the default', async ({ page, goto, baseURL }) => {
    // steps 1–5: shared walk (contact from / is /en/contact; the switch starts from /en)
    await walkStrategy(page, goto, {
      home: '/',
      contact: '/en/contact',
      switchFrom: '/en',
      deHome: '/de',
      deContact: '/de/kontakt',
    })

    // step 6: /de stays /de
    await goto('/de', { waitUntil: 'hydration' })
    await expect(page).toHaveURL('/de')

    // step 7: every localized URL on a direct cookie-less request → 200 and its content
    await directRoutes(baseURL, 'prefix_and_default')
  })

  // was: locale-state-prefix-and-default › *
  test('PAD-T2 forced locale: / stays /, content ru', async ({ page, goto }) => {
    await forcedLocale(page, goto, '/')
  })
})
