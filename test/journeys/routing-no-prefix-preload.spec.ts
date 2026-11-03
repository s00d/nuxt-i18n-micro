import { ssr } from '../helpers/journeys-b'
import { describe, expect, test } from '../helpers/guarded-test.ts'

describe('journey: serverTranslationPreload under no_prefix', () => {
  test.override({ harness: 'strategy-no-prefix-preload' })

  test('a custom path renders its own dictionary, the preloaded one stays with its locale', async ({ baseURL }) => {
    // step 1: preference en on the German path → German texts
    const german = await ssr(baseURL, '/kontakt', { cookie: 'user-locale=en', accept: 'text/html' })
    expect(german.html).toContain('Meine App')

    // step 2: the shared cache kept nothing English under de
    const again = await ssr(baseURL, '/kontakt', { cookie: 'user-locale=de', accept: 'text/html' })
    expect(again.html).toContain('Meine App')

    // step 3: the preference itself still renders from the preload
    expect((await ssr(baseURL, '/', { cookie: 'user-locale=en', accept: 'text/html' })).html).toContain('My App')
  })
})
