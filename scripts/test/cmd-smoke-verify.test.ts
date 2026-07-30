import { afterEach, describe, expect, it, vi } from 'vitest'
import { type SmokeVerifyReport, smokeVerifyCommand } from '../src/commands/smoke-verify'
import { runCli } from './helpers'

/**
 * The smoke command is the release gate for a live deployment, so what matters is not
 * that it runs but that each individual assertion still fails when its subject breaks.
 * These tests serve a fake app and then break one thing at a time.
 */

const BASE = 'http://smoke.test'

const page = (opts: { title: string; greeting: string; lang: string; body?: string; head?: string }) => `<!DOCTYPE html>
<html lang="${opts.lang}">
<head>
<link rel="canonical" href="${BASE}/">
<meta property="og:locale" content="${opts.lang}">
<link rel="alternate" hreflang="en" href="${BASE}/">
<link rel="alternate" hreflang="de" href="${BASE}/de">
<link rel="alternate" hreflang="fr" href="${BASE}/fr">
<link rel="alternate" hreflang="x-default" href="${BASE}/">
${opts.head ?? ''}
</head>
<body><main><h1>${opts.title}</h1><p>${opts.greeting}</p>${opts.body ?? ''}</main></body>
</html>`

/** A working deployment of `test/deploy-smoke`, reduced to what the checks read. */
function goodApp(): Record<string, { body: string; status?: number; headers?: Record<string, string> }> {
  return {
    '/': { body: page({ title: 'Smoke Home EN', greeting: 'Hello World EN', lang: 'en' }) },
    '/de': { body: page({ title: 'Smoke Home DE', greeting: 'Hallo World DE', lang: 'de', body: '<p>2 Einträge</p>' }) },
    '/fr': { body: page({ title: 'Smoke Home FR', greeting: 'Bonjour World FR', lang: 'fr' }) },
    '/de/about': { body: page({ title: 'Smoke About DE', greeting: 'About body DE', lang: 'de' }) },
    '/_locales/index/de/data.json': {
      body: JSON.stringify({ title: 'Smoke Home DE' }),
      headers: { 'cache-control': 'public, max-age=31536000, immutable' },
    },
  }
}

type App = ReturnType<typeof goodApp>

function serve(app: App) {
  vi.stubGlobal('fetch', async (url: string) => {
    const path = String(url).slice(BASE.length) || '/'
    const route = app[path]
    if (!route) return new Response('not found', { status: 404 })
    return new Response(route.body, { status: route.status ?? 200, headers: route.headers })
  })
}

/** Names of the checks that failed, for a deployment broken by `mutate`. */
async function failuresFor(mutate: (app: App) => void) {
  const app = goodApp()
  mutate(app)
  serve(app)
  const run = await runCli(smokeVerifyCommand, { url: BASE, json: true })
  const report = run.json<SmokeVerifyReport>()
  return { exitCode: run.exitCode, names: report.results.filter((r) => !r.ok).map((r) => r.name) }
}

afterEach(() => vi.unstubAllGlobals())

describe('smoke-verify', () => {
  it('passes against a working deployment without exiting', async () => {
    // `runCli` reports null when the command returned normally; only a `process.exit`
    // produces a code, so this is the success case.
    const { exitCode, names } = await failuresFor(() => {})
    expect(names).toEqual([])
    expect(exitCode).toBeNull()
  })

  it('strips a trailing slash from the base URL instead of doubling it', async () => {
    const app = goodApp()
    serve(app)
    const seen: string[] = []
    const inner = globalThis.fetch
    vi.stubGlobal('fetch', (url: string, init: RequestInit) => {
      seen.push(String(url))
      return inner(url, init)
    })
    await runCli(smokeVerifyCommand, { url: `${BASE}/`, json: true })
    expect(seen.every((u) => !u.includes('//_locales') && !u.endsWith('//'))).toBe(true)
  })

  it('fails when a locale renders the default language', async () => {
    const { exitCode, names } = await failuresFor((app) => {
      app['/de'] = { body: page({ title: 'Smoke Home EN', greeting: 'Hello World EN', lang: 'de', body: '<p>2 Einträge</p>' }) }
    })
    expect(names).toContain('/de renders its own translations')
    expect(exitCode).toBe(1)
  })

  it('fails when a page renders a raw translation key', async () => {
    const { names } = await failuresFor((app) => {
      app['/fr'] = { body: page({ title: 'Smoke Home FR', greeting: 'Bonjour World FR', lang: 'fr', body: '<p>nav.about</p>' }) }
    })
    expect(names).toContain('no raw translation keys in the HTML')
  })

  it('fails when the page-scoped route loses its own translations', async () => {
    const { names } = await failuresFor((app) => {
      app['/de/about'] = { body: page({ title: 'Smoke Home DE', greeting: 'Hallo World DE', lang: 'de' }) }
    })
    expect(names).toContain('page-scoped translations resolve on a second route')
  })

  it('fails when the plural form does not resolve', async () => {
    const { names } = await failuresFor((app) => {
      app['/de'] = { body: page({ title: 'Smoke Home DE', greeting: 'Hallo World DE', lang: 'de' }) }
    })
    expect(names).toContain('plural form resolves')
  })

  it('fails when the payload route is missing or serves the wrong chunk', async () => {
    expect((await failuresFor((app) => delete app['/_locales/index/de/data.json'])).names).toContain('_locales payload responds with translations')

    const wrong = await failuresFor((app) => {
      app['/_locales/index/de/data.json'] = { body: JSON.stringify({ title: 'Smoke Home EN' }) }
    })
    expect(wrong.names).toContain('_locales payload responds with translations')
  })

  it('fails when the payload is served no-store, but tolerates a rewritten Cache-Control', async () => {
    const noStore = await failuresFor((app) => {
      app['/_locales/index/de/data.json']!.headers = { 'cache-control': 'no-store' }
    })
    expect(noStore.names).toContain('_locales payload is cacheable')

    // A static host answering from its own CDN layer may rewrite this; only an explicit
    // no-store is a real problem.
    const rewritten = await failuresFor((app) => {
      app['/_locales/index/de/data.json']!.headers = { 'cache-control': 'public, max-age=0, must-revalidate' }
    })
    expect(rewritten.names).toEqual([])
  })

  it('fails when a hreflang alternate or x-default is missing', async () => {
    const { names } = await failuresFor((app) => {
      app['/de']!.body = app['/de']!.body.replace(/<link rel="alternate" hreflang="fr"[^>]*>/, '')
    })
    expect(names).toContain('hreflang alternates are emitted')

    const noDefault = await failuresFor((app) => {
      app['/de']!.body = app['/de']!.body.replace(/hreflang="x-default"/, 'hreflang="es"')
    })
    expect(noDefault.names).toContain('hreflang alternates are emitted')
  })

  it('fails when canonical or og:locale is missing', async () => {
    const { names } = await failuresFor((app) => {
      app['/fr']!.body = app['/fr']!.body.replace(/<link rel="canonical"[^>]*>/, '')
    })
    expect(names).toContain('canonical and og:locale are emitted')
  })

  it('fails when html lang does not follow the locale', async () => {
    const { names } = await failuresFor((app) => {
      app['/de']!.body = app['/de']!.body.replace('lang="de"', 'lang="en"')
    })
    expect(names).toContain('html lang matches the locale')
  })

  it('reports an HTTP error rather than throwing', async () => {
    const { exitCode, names } = await failuresFor((app) => {
      app['/'] = { body: 'boom', status: 500 }
    })
    expect(names).toContain('default locale renders translated content')
    expect(exitCode).toBe(1)
  })
})
