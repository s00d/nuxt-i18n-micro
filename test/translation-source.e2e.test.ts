import { fileURLToPath } from 'node:url'
import { $fetch as nuxtFetch, setup } from '@nuxt/test-utils'
import { describe, expect, test } from 'vitest'

// Untyped: Nitro MatchedRoutes on `/_locales/:page/:locale/...` → TS2321.
const $fetch = nuxtFetch as (url: string, opts?: object) => Promise<unknown>

describe('translationPayloads mode: source (serverless fixture)', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/serverless', import.meta.url)),
    server: true,
    nuxtConfig: {
      i18n: {
        translationPayloads: { mode: 'source' },
      },
    },
  })

  test('API route merges root and page files at runtime for every locale; SSR renders them', async () => {
    // step 1: en payload = root + page keys, merged by the handler (no premerged tree)
    const en = (await $fetch('/_locales/index/en/data.json')) as Record<string, string>
    expect(en).toEqual({
      hello: 'Hello World',
      welcome: 'Welcome to our site',
      global: 'global en',
      pageTitle: 'Home Page',
      pageContent: 'This is the home page content',
    })

    // step 2: repeat → same payload from the cache
    expect(await $fetch('/_locales/index/en/data.json')).toEqual(en)

    // step 3: de and fr merge the same way
    expect(await $fetch('/_locales/index/de/data.json')).toMatchObject({ hello: 'Hallo Welt', pageTitle: 'Startseite' })
    expect(await $fetch('/_locales/index/fr/data.json')).toMatchObject({ hello: 'Bonjour le monde', pageTitle: "Page d'accueil" })

    // step 4: SSR of / renders both layers
    const html = (await $fetch('/', { responseType: 'text' })) as string
    expect(html).toContain('Hello World')
    expect(html).toContain('Home Page')
  })
})
