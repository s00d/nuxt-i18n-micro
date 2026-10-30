import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { rm } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { $fetch as nuxtFetch, setup } from '@nuxt/test-utils'
import { afterAll, describe, expect, test } from 'vitest'

// Untyped: Nitro MatchedRoutes on `/_locales/:page/:locale/...` → TS2321.
const $fetch = nuxtFetch as (url: string, opts?: object) => Promise<unknown>

// Serverless: no static `public/` (serveStatic off), so payloads come from Nitro server assets
// through the handler, behind the fixture's `/_locales/**` route cache. An fs cache driver makes
// that cache serialize, so a payload that does not survive JSON breaks here.
const cacheDir = fileURLToPath(new URL('../.data/test-cache', import.meta.url))
const payload = (locale: string) => $fetch(`/_locales/index/${locale}/data.json`) as Promise<Record<string, string>>
const cacheFiles = () => readdirSync(cacheDir, { recursive: true }).map(String)

describe('serverless: translation payloads through a serialized route cache', async () => {
  await rm(cacheDir, { recursive: true, force: true })
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/serverless', import.meta.url)),
    server: true,
    nuxtConfig: { nitro: { serveStatic: false, storage: { cache: { driver: 'fs', base: cacheDir } } } },
  })
  afterAll(() => rm(cacheDir, { recursive: true, force: true }))

  test('cold, warm, every locale, unknown locale, parallel cold start', async () => {
    // step 1: cold request → root and page keys merged, written to the disk cache
    const en = await payload('en')
    expect(en).toEqual({
      hello: 'Hello World',
      welcome: 'Welcome to our site',
      global: 'global en',
      pageTitle: 'Home Page',
      pageContent: 'This is the home page content',
    })
    // Nitro writes the entry after responding (waitUntil): wait until it is on disk and complete,
    // or the edit below can land on a half-written file and be overwritten
    const entryPath = () => join(cacheDir, cacheFiles().find((f) => f.includes('index') && f.includes('en')) ?? '')
    const entryText = () => {
      try {
        return readFileSync(entryPath(), 'utf-8')
      } catch {
        return ''
      }
    }
    await expect.poll(entryText).toContain('Hello World')

    // step 2: warm request → answered from the disk entry: an edit to that entry is what comes back
    writeFileSync(entryPath(), entryText().replace('Hello World', 'Hello Cache'))
    expect(await payload('en')).toEqual({ ...en, hello: 'Hello Cache' })

    // step 3: every locale is its own entry; the apostrophe survives the round trip
    const [de, fr] = [await payload('de'), await payload('fr')]
    expect(de).toMatchObject({ hello: 'Hallo Welt', pageTitle: 'Startseite' })
    expect(fr).toMatchObject({ pageTitle: "Page d'accueil" })
    for (const locale of ['de', 'fr']) expect(cacheFiles().some((f) => f.includes(locale))).toBe(true)

    // step 4: an unknown locale is a 404, not a crash
    await expect(payload('unknown-locale')).rejects.toMatchObject({ statusCode: 404, statusMessage: expect.stringContaining('Locale not found') })

    // step 5: cache wiped, 20 parallel cold requests → all succeed with the same payload
    await rm(cacheDir, { recursive: true, force: true })
    const results = await Promise.all(Array.from({ length: 20 }, () => payload('en')))
    for (const result of results) expect(result).toEqual(en)
  })
})
