import { mkdtempSync, rmSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { loadNuxt } from '@nuxt/kit'
import { afterAll, describe, expect, it } from 'vitest'

const moduleEntry = fileURLToPath(new URL('../src/module.ts', import.meta.url))
// inside the repo: Nuxt is resolved from the app's directory
const rootDir = mkdtempSync(fileURLToPath(new URL('./.locale-cookie-', import.meta.url)))

/** The `localeCookie` the module resolves: what goes into the generated config, without building an app. */
async function resolvedCookie(i18n: Record<string, unknown>): Promise<unknown> {
  const nuxt = await loadNuxt({
    cwd: rootDir,
    ready: true,
    overrides: { modules: [moduleEntry], pages: false, i18n: { locales: [{ code: 'en' }], ...i18n } as never },
  })
  try {
    const template = nuxt.options.build.templates.find((entry) => entry.filename === 'i18n.strategy.mjs')!
    const source = String(await template.getContents!({ nuxt, app: {} as never, options: {} }))
    return JSON.parse(/"localeCookie":(null|"[^"]*")/.exec(source)![1]!)
  } finally {
    await nuxt.close()
  }
}

describe('localeCookie option', () => {
  afterAll(() => rmSync(rootDir, { recursive: true, force: true }))

  it('defaults to user-locale under no_prefix', async () => {
    expect(await resolvedCookie({ strategy: 'no_prefix' })).toBe('user-locale')
  })

  it('keeps an explicit null off under no_prefix', async () => {
    expect(await resolvedCookie({ strategy: 'no_prefix', localeCookie: null })).toBeNull()
  })

  it('stays off by default under the prefix strategies', async () => {
    expect(await resolvedCookie({ strategy: 'prefix' })).toBeNull()
  })
})
