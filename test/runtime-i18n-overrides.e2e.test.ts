import { fileURLToPath } from 'node:url'
import { $fetch, setup } from '@nuxt/test-utils'
import { describe, expect, it } from 'vitest'

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

  it('uses overridden defaultLocale for SSR page rendering', async () => {
    const html = (await $fetch('/', { responseType: 'text' })) as string

    expect(html).toContain('<p id="locale">de</p>')
    expect(html).toContain('Hallo Welt')
    expect(html).toContain('Startseite')
  })

  it('serves enabled locale payloads and rejects disabled locales', async () => {
    const dePayload = (await $fetch('/_locales/index/de/data.json')) as Record<string, string>
    expect(dePayload.hello).toBe('Hallo Welt')
    expect(dePayload.pageTitle).toBe('Startseite')

    await expect($fetch('/_locales/index/fr/data.json')).rejects.toMatchObject({
      statusCode: 404,
      statusMessage: expect.stringContaining('Locale not found'),
    })
  })
})
