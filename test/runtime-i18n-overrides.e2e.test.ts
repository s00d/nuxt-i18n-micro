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

    try {
      await $fetch('/_locales/index/fr/data.json')
      expect.fail('Disabled locale must return 404')
    } catch (error: unknown) {
      const e = error as { statusCode?: number; statusMessage?: string }
      expect(e.statusCode).toBe(404)
      expect(e.statusMessage).toContain('Locale not found')
    }
  })
})
