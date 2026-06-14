import { fileURLToPath } from 'node:url'
import { $fetch, setup } from '@nuxt/test-utils'
import { describe, expect, it } from 'vitest'

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

  it('merges root and page translations through the API route', async () => {
    const data = (await $fetch('/_locales/index/en/data.json')) as Record<string, string>

    expect(data.hello).toBe('Hello World')
    expect(data.welcome).toBe('Welcome to our site')
    expect(data.pageTitle).toBe('Home Page')
    expect(data.pageContent).toBe('This is the home page content')
  })

  it('renders merged translations during SSR', async () => {
    const html = (await $fetch('/', { responseType: 'text' })) as string

    expect(html).toContain('Hello World')
    expect(html).toContain('Home Page')
  })

  it('serves all configured locales through runtime merge', async () => {
    const de = (await $fetch('/_locales/index/de/data.json')) as Record<string, string>
    const fr = (await $fetch('/_locales/index/fr/data.json')) as Record<string, string>

    expect(de.hello).toBe('Hallo Welt')
    expect(de.pageTitle).toBe('Startseite')
    expect(fr.pageTitle).toBe("Page d'accueil")
  })

  it('reuses cached payloads on repeated API requests', async () => {
    const first = await $fetch('/_locales/index/en/data.json')
    const second = await $fetch('/_locales/index/en/data.json')

    expect(second).toEqual(first)
  })
})
