/**
 * The published package in a real Astro build, over HTTP: dist entries, `.astro` components, island
 * adapters, the integration's own middleware. The playground is the site, built once as it is and
 * once under a `base`.
 */
import { type ChildProcess, spawn, spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { join } from 'node:path'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import { packageRootFromImportMeta } from '../../../test-utils/src/publish-smoke'

const packageRoot = packageRootFromImportMeta(import.meta.url)
const playground = join(packageRoot, 'playground')
const astroBin = join(playground, 'node_modules/astro/bin/astro.mjs')

function build(env: Record<string, string> = {}) {
  const run = spawnSync(process.execPath, [astroBin, 'build'], { cwd: playground, env: { ...process.env, ...env }, encoding: 'utf8' })
  if (run.status !== 0) throw new Error(`astro build failed\n${run.stdout}\n${run.stderr}`)
}

async function start(outDir: string, port: number): Promise<ChildProcess> {
  const server = spawn(process.execPath, [join(playground, outDir, 'server/entry.mjs')], {
    cwd: playground,
    env: { ...process.env, PORT: String(port), HOST: '127.0.0.1' },
    stdio: ['ignore', 'pipe', 'inherit'],
  })
  await new Promise<void>((resolve, reject) => {
    server.stdout!.on('data', (chunk) => {
      if (/listening/i.test(String(chunk))) resolve()
    })
    server.once('exit', (code) => reject(new Error(`server exited with ${code}`)))
  })
  return server
}

const PORT = 4871
const BASE_PORT = 4872
const origin = `http://127.0.0.1:${PORT}`
const baseOrigin = `http://127.0.0.1:${BASE_PORT}`
let servers: ChildProcess[] = []

const get = (url: string, headers: Record<string, string> = {}) => fetch(url, { headers, redirect: 'manual' })
const html = async (url: string, headers: Record<string, string> = {}) => (await get(url, headers)).text()
const text = (page: string, id: string) => page.match(new RegExp(`id="${id}"[^>]*>([^<]*)<`))?.[1]
const links = (page: string, id: string) => {
  const block = page.match(new RegExp(`id="${id}"[\\s\\S]*?</(?:nav|div)>`))?.[0] ?? ''
  return [...block.matchAll(/<a href="([^"]*)"/g)].map((match) => match[1])
}
const decode = (value: string) => value.replace(/&quot;/g, '"').replace(/&#34;/g, '"').replace(/&amp;/g, '&')
/** The island's own URL, as the deferred script of the page fetches it. */
const islandUrl = (page: string) => decode(page).match(/(\/[^'"`\s]*_server-islands\/[^'"`\s]+)/)?.[1]

beforeAll(async () => {
  build()
  build({ I18N_BASE: '/docs' })
  servers = [await start('dist', PORT), await start('dist-base', BASE_PORT)]
}, 300_000)

afterAll(() => {
  for (const server of servers) {
    server.removeAllListeners('exit')
    server.kill()
  }
})

describe('routing', () => {
  test('the URL decides the locale, with no src/middleware.ts in the site', async () => {
    expect(text(await html(`${origin}/island`), 'page')).toBe('en:Welcome')
    expect(text(await html(`${origin}/de/island`), 'page')).toMatch(/^de:/)
  })

  test('a disabled locale is no redirect target', async () => {
    const response = await get(`${origin}/`, { 'accept-language': 'es' })
    expect([response.status, response.headers.get('location')]).toEqual([200, null])
    expect((await get(`${origin}/es/island`)).status).toBe(404)
  })

  test('the home redirects to the preferred locale, and the switcher gets back to the default one', async () => {
    const landing = await get(`${origin}/`, { 'accept-language': 'de' })
    expect([landing.status, landing.headers.get('location')]).toEqual([302, '/de'])
    expect(landing.headers.get('vary')).toBe('Cookie, Accept-Language')

    const back = await get(`${origin}/`, { 'accept-language': 'de', referer: `${origin}/de/about` })
    expect(back.status).toBe(200)
    const cookie = back.headers.get('set-cookie')!
    expect(cookie).toMatch(/^i18n-locale=en;/)

    const later = await get(`${origin}/`, { 'accept-language': 'de', cookie: cookie.split(';')[0]! })
    expect(later.status).toBe(200)
  })
})

describe('dynamic routes', () => {
  test('page dictionaries apply: one route name per pattern', async () => {
    const en = await html(`${origin}/blog/hello`)
    expect([text(en, 'route'), text(en, 'title')]).toEqual(['blog-slug', 'Post page'])
    const de = await html(`${origin}/de/blog/hello`)
    expect([text(de, 'route'), text(de, 'title')]).toEqual(['blog-slug', 'Beitragsseite'])
  })

  test('after a rewrite the head still names the page that was asked for', async () => {
    const page = await html(`${origin}/de/blog/hello`)
    expect(page).toContain('rel="canonical" href="https://site.test/de/blog/hello"')
    expect(page).toContain('hreflang="en-US"')
    expect(page).toContain('href="https://site.test/blog/hello" hreflang="en-US"')
  })

  test('getI18nProps gives islands what the page answers, root and fallback keys too', async () => {
    const props = JSON.parse(decode(text(await html(`${origin}/de/blog/hello`), 'props')!))
    expect(props.locale).toBe('de')
    expect(props.fallbackLocale).toBe('en')
    expect(props.translations['blog-slug'].post.title).toBe('Beitragsseite')
    expect(props.translations['blog-slug'].welcome).toBeDefined()
  })
})

describe('server islands', () => {
  test('render in the locale of the page that asked', async () => {
    const page = await html(`${origin}/de/island`)
    const url = islandUrl(page)
    expect(url).toBeDefined()
    const island = await html(`${origin}${url}`, { referer: `${origin}/de/island` })
    expect(text(island, 'late')).toMatch(/^de:island:/)
    expect(island).toContain('href="/de/about"')
  })

  test('without a Referer they fall back to the default locale', async () => {
    const url = islandUrl(await html(`${origin}/de/island`))
    expect(text(await html(`${origin}${url}`), 'late')).toMatch(/^en:/)
  })
})

describe('components', () => {
  test('I18nLink leaves external URLs alone and keeps what it was given', async () => {
    expect(links(await html(`${origin}/de/links`), 'links')).toEqual([
      'https://example.com/x',
      'mailto:a@b.c',
      '#top',
      '/de/about?x=1#y',
      '/de/about/',
      '/fr/about',
    ])
  })

  test('I18nLink passes attributes through', async () => {
    expect(await html(`${origin}/links`)).toMatch(/<a href="\/fr\/about" class="to-fr" data-x="1"/)
  })

  test('I18nSwitcher links the page in every enabled locale, with its query', async () => {
    const page = await html(`${origin}/de/links?q=1`)
    const hrefs = [...page.matchAll(/<a href="([^"]*)"[^>]*data-locale="(\w+)"/g)].map((match) => [match[2], decode(match[1]!)])
    expect(hrefs.slice(0, 3)).toEqual([
      ['en', '/links?q=1'],
      ['fr', '/fr/links?q=1'],
      ['de', '/de/links?q=1'],
    ])
    expect(page).toMatch(/class="i18n-switcher-wrapper mine[^"]*"[^>]*id="switcher"/)
    expect(page).toContain('aria-current="page"')
    // two switchers on the page, one script: nothing to leak under <ClientRouter>
    expect((page.match(/addEventListener\(['"]click/g) ?? []).length).toBeLessThanOrEqual(1)
    expect(page).not.toContain('data-switcher-id')
  })

  test('I18nT: any tag and attributes, params escaped with and without html', async () => {
    const page = await html(`${origin}/links`)
    expect(page).toMatch(/<h2[^>]*class="t"[^>]*>[^<]*&lt;b&gt;x&lt;\/b&gt;/)
    expect(page).toMatch(/<section[^>]*>[^<]*&lt;b&gt;x&lt;\/b&gt;[^<]*<\/section>/)
    expect(page).toMatch(/<em[^>]*>Fallback text<\/em>/)
  })
})

describe('island adapters from dist', () => {
  test('Vue and React islands render on the server with the app’s own framework', async () => {
    const page = await html(`${origin}/de/blog/hello`)
    expect(page).toContain('<astro-island')
    expect(page).toContain('component-export="default"')
    const client = page.match(/renderer-url="([^"]+)"/)?.[1]
    expect((await get(`${origin}${client}`)).status).toBe(200)
  })

  test('client bundles hold one Vue: the adapter imports the app’s', () => {
    const adapter = readFileSync(join(packageRoot, 'dist/client/vue.js'), 'utf8')
    expect(adapter).toMatch(/from ['"]vue['"]/)
  })

  test('the pure client entry needs no framework installed', () => {
    const entry = readFileSync(join(packageRoot, 'dist/client/index.js'), 'utf8')
    for (const framework of ['vue', 'react', 'preact', 'svelte']) expect(entry).not.toMatch(new RegExp(`from ['"]${framework}`))
  })
})

describe('under a base', () => {
  const docs = `${baseOrigin}/docs`

  test('the locale comes from the path after it', async () => {
    expect(text(await html(`${docs}/de/island`), 'page')).toMatch(/^de:/)
    expect(text(await html(`${docs}/island`), 'page')).toMatch(/^en:/)
  })

  test('the home redirect stays under it', async () => {
    const response = await get(`${docs}/`, { 'accept-language': 'de' })
    expect(response.headers.get('location')).toBe('/docs/de')
  })

  test('route names and page dictionaries ignore it', async () => {
    const page = await html(`${docs}/de/blog/hello`)
    expect([text(page, 'route'), text(page, 'title')]).toEqual(['blog-slug', 'Beitragsseite'])
    expect(page).toContain('rel="canonical" href="https://site.test/docs/de/blog/hello"')
  })

  test('links and the switcher carry it', async () => {
    const page = await html(`${docs}/de/links`)
    expect(links(page, 'links').slice(3)).toEqual(['/docs/de/about?x=1#y', '/docs/de/about/', '/docs/fr/about'])
    expect(page).toContain('href="/docs/links"')
  })

  test('a server island finds the page under it', async () => {
    const url = islandUrl(await html(`${docs}/de/island`))
    const island = await html(`${baseOrigin}${url}`, { referer: `${docs}/de/island` })
    expect(text(island, 'late')).toMatch(/^de:/)
    expect(island).toContain('href="/docs/de/about"')
  })
})

describe('the main entry on an edge runtime', () => {
  test('createI18n and the middleware bundle with no node builtin', () => {
    const require = createRequire(join(packageRoot, 'package.json'))
    const esbuild = require(require.resolve('esbuild', { paths: [packageRoot, join(packageRoot, '../..')] })) as typeof import('esbuild')
    const output = esbuild.buildSync({
      stdin: { contents: `export { createI18n, createI18nMiddleware } from ${JSON.stringify(join(packageRoot, 'dist/index.mjs'))}`, resolveDir: packageRoot },
      bundle: true,
      format: 'esm',
      platform: 'neutral',
      mainFields: ['module', 'main'],
      conditions: ['import'],
      treeShaking: true,
      write: false,
      external: ['astro'],
    })
    const code = output.outputFiles[0]!.text
    expect(code).not.toMatch(/node:(fs|path|async_hooks|url)/)
  })
})
