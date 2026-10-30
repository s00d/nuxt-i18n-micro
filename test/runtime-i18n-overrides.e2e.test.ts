import { fileURLToPath } from 'node:url'
import { $fetch as nuxtFetch, setup } from '@nuxt/test-utils'
import { describe, expect, test } from 'vitest'

// Untyped: Nitro MatchedRoutes on `/_locales/:page/:locale/...` → TS2321.
const $fetch = nuxtFetch as (url: string, opts?: object) => Promise<unknown>

describe('runtime i18n overrides (Nuxt runtimeConfig)', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/serverless', import.meta.url)),
    server: true,
    nuxtConfig: {
      nitro: {
        prerender: {
          failOnError: false,
        },
      },
      // Build-time disabled: no public/_locales/.../fr/data.json (static would bypass the handler).
      i18n: {
        locales: [
          { code: 'en', iso: 'en_EN' },
          { code: 'de', iso: 'de_DE' },
          { code: 'fr', iso: 'fr_FR', disabled: true },
        ],
      },
      runtimeConfig: {
        public: {
          i18nRuntime: {
            defaultLocale: 'de',
            fallbackLocale: 'en',
            disabledLocales: ['fr'],
          },
        },
      },
    },
  })

  test('runtimeConfig overrides the default locale and disables fr', async () => {
    // step 1: SSR / renders de (the overridden default), root and page keys
    const html = (await $fetch('/', { responseType: 'text' })) as string
    expect(html).toContain('<p id="locale">de</p>')
    expect(html).toContain('Hallo Welt')
    expect(html).toContain('Startseite')

    // step 2: the de payload is served
    expect(await $fetch('/_locales/index/de/data.json')).toMatchObject({ hello: 'Hallo Welt', pageTitle: 'Startseite' })

    // step 3: fr, disabled at runtime, is a 404
    await expect($fetch('/_locales/index/fr/data.json')).rejects.toMatchObject({
      statusCode: 404,
      statusMessage: expect.stringContaining('Locale not found'),
    })
  })
})
