import { mkdtempSync, rmSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { loadNuxt } from '@nuxt/kit'
import { afterAll, describe, expect, it } from 'vitest'

const moduleEntry = fileURLToPath(new URL('../src/module.ts', import.meta.url))
// inside the repo: Nuxt is resolved from the app's directory
const rootDir = mkdtempSync(fileURLToPath(new URL('./.locale-cookie-', import.meta.url)))

/** The generated strategy template, without building an app. */
async function strategySource(i18n: Record<string, unknown>, overrides: Record<string, unknown> = {}): Promise<string> {
  const nuxt = await loadNuxt({
    cwd: rootDir,
    ready: true,
    overrides: { modules: [moduleEntry], pages: false, i18n: { locales: [{ code: 'en' }], ...i18n } as never, ...overrides },
  })
  try {
    const template = nuxt.options.build.templates.find((entry) => entry.filename === 'i18n.strategy.mjs')!
    return String(await template.getContents!({ nuxt, app: {} as never, options: {} }))
  } finally {
    await nuxt.close()
  }
}

/** The `localeCookie` the module resolves: what goes into the generated config. */
async function resolvedCookie(i18n: Record<string, unknown>): Promise<unknown> {
  return JSON.parse(/"localeCookie":(null|"[^"]*")/.exec(await strategySource(i18n))![1]!)
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

  it('keeps useCookie in the build only when a cookie can be used', async () => {
    expect(await strategySource({ strategy: 'prefix' })).toContain('export const cookies = false')
    expect(await strategySource({ strategy: 'prefix', localeCookie: 'x' })).toContain('export const cookies = true')
    expect(await strategySource({ strategy: 'no_prefix' })).toContain('export const cookies = true')
    expect(await strategySource({ strategy: 'prefix' }, { router: { options: { hashMode: true } } })).toContain('export const cookies = true')
  })
})
