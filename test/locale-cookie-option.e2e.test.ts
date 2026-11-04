import { mkdtempSync, rmSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { loadNuxt } from '@nuxt/kit'
import { afterAll, describe, expect, it, vi } from 'vitest'

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

/** The route middleware the module registers. */
async function middlewareNames(i18n: Record<string, unknown>): Promise<string[]> {
  const nuxt = await loadNuxt({
    cwd: rootDir,
    ready: true,
    overrides: { modules: [moduleEntry], pages: false, i18n: { locales: [{ code: 'en' }], ...i18n } as never },
  })
  try {
    const app = { middleware: [] as { name: string }[] }
    await nuxt.callHook('app:resolve', app as never)
    return app.middleware.map((entry) => entry.name)
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

  it('registers no client redirect under no_prefix: it never has a URL to move', async () => {
    expect(await middlewareNames({ strategy: 'prefix' })).toContain('i18n-redirect')
    expect(await middlewareNames({ strategy: 'no_prefix' })).not.toContain('i18n-redirect')
  })

  it('the runtime config carries no option that only the build reads', async () => {
    const source = await strategySource({ routeLocales: { about: ['en'] }, routeDisableMeta: { about: true }, noPrefixRedirect: true, hmr: true })
    for (const key of ['isSSG', 'routeLocales', 'routeDisableMeta', 'noPrefixRedirect', 'hmr', 'hooks']) expect(source).not.toContain(`"${key}":`)
  })

  it('ships localeCookieOptions only to a build that writes a cookie', async () => {
    const options = { domain: '.example.com', secure: true, sameSite: 'none' }
    expect(await strategySource({ strategy: 'prefix', localeCookie: 'x', localeCookieOptions: options })).toContain(
      '"localeCookieOptions":{"domain":".example.com","secure":true,"sameSite":"none"}',
    )
    expect(await strategySource({ strategy: 'prefix', localeCookieOptions: options })).not.toContain('localeCookieOptions')
    expect(await strategySource({ strategy: 'prefix', localeCookie: 'x' })).not.toContain('localeCookieOptions')
  })

  it("warns at build about sameSite 'none' without secure", async () => {
    // the module logs through consola, which writes to the stream, not through console.warn
    const warn = vi.spyOn(process.stderr, 'write')
    const seen = () => warn.mock.calls.some((args) => String(args[0]).includes("sameSite 'none' needs secure"))
    try {
      await strategySource({ localeCookie: 'x', localeCookieOptions: { sameSite: 'none', secure: true } })
      expect(seen()).toBe(false)
      await strategySource({ localeCookie: 'x', localeCookieOptions: { sameSite: 'none' } })
      expect(seen()).toBe(true)
    } finally {
      warn.mockRestore()
    }
  })

  it('redirectStatusCode: shipped only when set, a code that is no redirect is dropped with a warning', async () => {
    expect(await strategySource({})).not.toContain('redirectStatusCode')
    expect(await strategySource({ redirectStatusCode: 301 })).toContain('"redirectStatusCode":301')
    const warn = vi.spyOn(process.stderr, 'write')
    try {
      expect(await strategySource({ redirectStatusCode: 200 })).not.toContain('redirectStatusCode')
      expect(warn.mock.calls.some((args) => String(args[0]).includes('redirectStatusCode 200 is no redirect status'))).toBe(true)
    } finally {
      warn.mockRestore()
    }
  })

  it('keeps useCookie in the build only when a cookie can be used', async () => {
    expect(await strategySource({ strategy: 'prefix' })).toContain('export const cookies = false')
    expect(await strategySource({ strategy: 'prefix', localeCookie: 'x' })).toContain('export const cookies = true')
    expect(await strategySource({ strategy: 'no_prefix' })).toContain('export const cookies = true')
    expect(await strategySource({ strategy: 'prefix' }, { router: { options: { hashMode: true } } })).toContain('export const cookies = true')
  })
})
