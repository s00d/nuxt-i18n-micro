import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { $fetch as nuxtFetch, setup } from '@nuxt/test-utils'
import { describe, expect, test } from 'vitest'

// Untyped: Nitro MatchedRoutes on `/_locales/:page/:locale/...` → TS2321.
const $fetch = nuxtFetch as (url: string, opts?: object) => Promise<unknown>

const basicDir = fileURLToPath(new URL('./fixtures/basic', import.meta.url))
const readLocale = (file: string) => JSON.parse(readFileSync(join(basicDir, 'locales', file), 'utf-8')) as Record<string, unknown>

describe('translationPayloads mode: source (basic, BASIC_VARIANT=serverless)', async () => {
  // nuxt.config reads it at build time, in this process
  process.env.BASIC_VARIANT = 'serverless'
  await setup({
    rootDir: basicDir,
    server: true,
    nuxtConfig: {
      i18n: {
        translationPayloads: { mode: 'source' },
      },
    },
  })

  test('API route merges root and page files at runtime for every locale; SSR renders them', async () => {
    // step 1: en payload = root + page keys, merged by the handler (no premerged tree)
    const en = (await $fetch('/_locales/cache/en/data.json')) as Record<string, string>
    expect(en).toEqual({ ...readLocale('en.json'), ...readLocale('pages/cache/en.json') })
    expect(en).toMatchObject({ hello: 'Hello World', pageTitle: 'Home Page' })

    // step 2: repeat → same payload from the cache
    expect(await $fetch('/_locales/cache/en/data.json')).toEqual(en)

    // step 3: de and fr merge the same way
    expect(await $fetch('/_locales/cache/de/data.json')).toMatchObject({ hello: 'Hallo Welt', pageTitle: 'Startseite' })
    expect(await $fetch('/_locales/cache/fr/data.json')).toMatchObject({ hello: 'Bonjour le monde', pageTitle: "Page d'accueil" })

    // step 4: SSR of /cache renders both layers
    const html = (await $fetch('/cache', { responseType: 'text' })) as string
    expect(html).toContain('Hello World')
    expect(html).toContain('Home Page')
  })
})
