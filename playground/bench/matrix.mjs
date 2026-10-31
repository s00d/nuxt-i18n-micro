#!/usr/bin/env node
// Every build variant of the bench, with how to build and run it.
//
//   node bench/matrix.mjs list [--json]
//   node bench/matrix.mjs env <variant>            print the env, ready for a shell
//   node bench/matrix.mjs build <variant>
//   node bench/matrix.mjs start <variant> [port]   needs a build, except mode dev
//   node bench/matrix.mjs smoke <variant> [port]   start, request the smoke paths, stop; exit 1 on a failure
//                                                  --all: every page of bench/pages.json in en and de, status and marker only
//
// A variant's output is .bench/<variant>/.output. Modes:
//   dev       nuxi dev
//   build     nuxi build + node server (SSR, SPA, prerendered routes, hybrid: env decides)
//   generate  nuxi generate + bench/static.mjs
//   build-only  a target that cannot run here
import { spawn, spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, openSync, readFileSync } from 'node:fs'
import { get as httpGet } from 'node:http'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const benchRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
const nuxi = join(benchRoot, '../node_modules/.bin/nuxi')
const DEFAULT_PORT = 4700
const DOMAIN_PORT = 4790

const S = { prefix: 'prefix', pec: 'prefix_except_default', pad: 'prefix_and_default', nop: 'no_prefix' }
const i18n = (options) => ({ BENCH_I18N: JSON.stringify(options) })
const nuxt = (options) => ({ BENCH_NUXT: JSON.stringify(options) })
const strategy = (name) => ({ BENCH_STRATEGY: S[name] })
const spa = { BENCH_SSR: '0' }

const v = (name, mode, env = {}, extra = {}) => [name, { mode, env, ...extra }]
const perStrategy = (suffix, mode, env = {}, extra = {}) =>
  Object.keys(S).map((key) => v(`${key}${suffix}`, mode, { ...strategy(key), ...env }, extra))

export const variants = Object.fromEntries([
  // one per strategy and mode
  ...perStrategy('', 'build'),
  ...perStrategy('-dev', 'dev', { BENCH_DEVTOOLS: '0' }),
  ...perStrategy('-generate', 'generate'),
  ...perStrategy('-spa', 'build', spa),
  ...perStrategy('-spa-generate', 'generate', spa),
  ...perStrategy('-hash', 'build', { BENCH_HASH: '1' }),
  ...perStrategy('-base', 'build', { BENCH_BASE_URL: '/shop/' }),
  ...perStrategy('-domains', 'build', { BENCH_LOCALES: 'domains' }, { port: DOMAIN_PORT }),

  // the other ways to run a build
  v('prerender', 'build', {
    ...strategy('pec'),
    ...nuxt({ nitro: { prerender: { routes: ['/', '/de', '/static-page', '/de/static-page'], crawlLinks: true } } }),
  }),
  v('hybrid', 'build', { ...strategy('pec'), BENCH_RULES: 'hybrid' }),
  v('hash-spa', 'build', { ...strategy('pec'), ...spa, BENCH_HASH: '1' }),
  v('hash-generate', 'generate', { ...strategy('pec'), BENCH_HASH: '1' }),
  v(
    'domains-generate-de',
    'generate',
    { ...strategy('pec'), BENCH_LOCALES: 'domains', NUXT_I18N_DOMAIN: `de.bench.localhost:${DOMAIN_PORT}` },
    { port: DOMAIN_PORT },
  ),
  v('node-cluster', 'build', { ...strategy('pec'), ...nuxt({ nitro: { preset: 'node-cluster' } }) }),
  v('edge-cloudflare', 'build-only', {
    ...strategy('pec'),
    BENCH_HUGE: '0',
    ...nuxt({ nitro: { preset: 'cloudflare_module' } }),
    ...i18n({ translationPayloads: { mode: 'source' } }),
  }),
  v('vercel', 'build-only', { ...strategy('pec'), BENCH_HUGE: '0', ...nuxt({ nitro: { preset: 'vercel' } }) }),

  // detection and redirects
  v('detect-off', 'build', { ...strategy('prefix'), ...i18n({ autoDetectLanguage: false }) }),
  v('detect-all', 'build', { ...strategy('pec'), ...i18n({ autoDetectPath: '*' }) }),
  v('detect-no-prefix', 'build', { ...strategy('pec'), ...i18n({ autoDetectPath: 'no_prefix' }) }),
  v('detect-path', 'build', { ...strategy('pec'), ...i18n({ autoDetectPath: '/welcome' }) }),
  v('detect-custom', 'build', { ...strategy('pec'), BENCH_DETECT: '1' }),
  v('no-redirects', 'build', { ...strategy('prefix'), ...i18n({ redirects: false }) }),
  v('cookie-off', 'build', { ...strategy('pec'), ...i18n({ localeCookie: null }) }),
  v('cookie-off-nop', 'build', { ...strategy('nop'), ...i18n({ localeCookie: null }) }),
  v('cookie-custom', 'build', { ...strategy('pec'), ...i18n({ localeCookie: 'bench-locale' }) }),
  v('no-prefix-redirect', 'build', { ...strategy('nop'), ...i18n({ noPrefixRedirect: true }) }),

  // routing
  v('exclude', 'build', { ...strategy('pec'), BENCH_EXCLUDE: '1' }),
  v('trailing-append', 'build', { ...strategy('pec'), ...i18n({ trailingSlash: 'append' }) }),
  v('trailing-remove', 'build', { ...strategy('pec'), ...i18n({ trailingSlash: 'remove' }) }),
  v('trailing-nuxt', 'build', { ...strategy('pec'), ...nuxt({ experimental: { defaults: { nuxtLink: { trailingSlash: 'append' } } } }) }),
  v('regex', 'build', { ...strategy('prefix'), ...i18n({ customRegexMatcher: '[a-z]{2}' }) }),
  v('name-prefix', 'build', { ...strategy('pec'), ...i18n({ localizedRouteNamePrefix: 'loc-' }) }),
  v('no-layer', 'build', { ...strategy('pec'), BENCH_LAYER: '0' }),

  // translations
  v('no-fallback', 'build', { ...strategy('pec'), ...i18n({ fallbackLocale: null }) }),
  v('no-page-locales', 'build', { ...strategy('pec'), ...i18n({ disablePageLocales: true }) }),
  v('custom-plural', 'build', { ...strategy('pec'), BENCH_PLURAL: '1' }),
  v('alt-dir', 'build', { ...strategy('pec'), ...i18n({ translationDir: 'locales-alt', additionalTranslationDirs: [] }) }),
  v('types-gen', 'build', { ...strategy('pec'), BENCH_HUGE: '0', BENCH_TYPES_GEN: '1' }),

  // payloads
  v('payload-source', 'build', { ...strategy('pec'), ...i18n({ translationPayloads: { mode: 'source' } }) }),
  v('payload-source-cluster', 'build', {
    ...strategy('pec'),
    ...nuxt({ nitro: { preset: 'node-cluster' } }),
    ...i18n({ translationPayloads: { mode: 'source' } }),
  }),
  v('payload-prerender', 'build', {
    ...strategy('pec'),
    ...i18n({ translationPayloads: { prerenderRoutes: true }, serverTranslationPreload: true }),
  }),
  v('public-dir', 'build', { ...strategy('pec'), ...i18n({ apiBaseUrl: 'i18n-data', translationPayloads: { publicDir: 'i18n-data' } }) }),
  v(
    'cdn',
    'build',
    {
      ...strategy('pec'),
      ...i18n({
        apiBaseServerHost: 'http://127.0.0.1:4791',
        apiBaseClientHost: 'http://127.0.0.1:4791',
        translationPayloads: { serverHandler: false, serverAssets: false, publicAssets: false },
      }),
    },
    { cdn: { from: 'pec', port: 4791 } },
  ),
  v('cache', 'build', { ...strategy('pec'), ...i18n({ cacheMaxSize: 2, cacheTtl: 1, httpCacheDuration: 60, dateBuild: 'bench' }) }),
  v('no-cache-bust', 'build', { ...strategy('pec'), ...i18n({ dateBuild: 0, httpCacheDuration: 0 }) }),

  // SEO
  v('seo-off', 'build', { ...strategy('pec'), ...i18n({ meta: false }) }),
  v('seo-tuned', 'build', {
    ...strategy('pec'),
    ...i18n({ metaBaseUrl: 'https://bench.example', hreflangBaseLanguage: true, canonicalQueryWhitelist: ['keep'] }),
  }),
  v('seo-no-trust', 'build', {
    ...strategy('pec'),
    ...i18n({ metaTrustForwardedHost: false, metaTrustForwardedProto: false, trustForwardedHost: true }),
  }),

  // parts switched off. The pages use all of them, so these prove the build and what is left of a render.
  v('no-define', 'build', { ...strategy('pec'), ...i18n({ define: false }) }),
  v('no-hooks', 'build', { ...strategy('pec'), ...i18n({ hooks: false }) }),
  v('no-components', 'build', { ...strategy('pec'), ...i18n({ components: false }) }),
  v('no-plugin', 'build-only', { ...strategy('pec'), ...i18n({ plugin: false }) }),
  v('no-types', 'build', { ...strategy('pec'), ...i18n({ types: false }) }),

  // runtime overrides: same build, env at start
  v('runtime-prefix', 'build', strategy('prefix'), {
    runEnv: { NUXT_I18N_DEFAULT_LOCALE: 'de', NUXT_I18N_FALLBACK_LOCALE: 'de', NUXT_I18N_DISABLED_LOCALES: 'ru' },
    buildAs: 'prefix',
  }),
  v('runtime-nop', 'build', strategy('nop'), { runEnv: { NUXT_I18N_DEFAULT_LOCALE: 'de', NUXT_I18N_DISABLED_LOCALES: 'fr' }, buildAs: 'nop' }),

  // development
  // DevTools serves the i18n tab from a client/ dev server on port 3030 when client/ has no prebuilt UI
  v('dev-devtools', 'dev', strategy('pec')),
  v('dev-debug', 'dev', { ...strategy('pec'), BENCH_DEVTOOLS: '0', ...i18n({ debug: true, missingWarn: true }) }),
  v('dev-quiet', 'dev', {
    ...strategy('pec'),
    BENCH_DEVTOOLS: '0',
    ...i18n({ hmr: false, disableWatcher: true, vueDevtools: false, missingWarn: false }),
  }),
  v('dev-spa', 'dev', { ...strategy('pec'), ...spa, BENCH_DEVTOOLS: '0' }),
  v('dev-domains', 'dev', { ...strategy('pec'), BENCH_DEVTOOLS: '0', BENCH_LOCALES: 'domains' }, { port: DOMAIN_PORT }),
])

const fail = (message) => {
  console.error(message)
  process.exit(1)
}

function resolve(name) {
  const variant = variants[name]
  if (!variant) fail(`Unknown variant "${name}". Try: list`)
  const output = variant.buildAs ?? name
  return { name, ...variant, output, dir: join(benchRoot, '.bench', output, '.output') }
}

const buildEnv = (variant) => ({ ...process.env, ...variant.env, BENCH_VARIANT: variant.output })

/** tsconfig.json extends .nuxt/tsconfig.json, and a variant builds elsewhere: Vite needs that file to exist. */
function ensurePrepared() {
  if (existsSync(join(benchRoot, '.nuxt/tsconfig.json'))) return
  const { BENCH_VARIANT: _, ...env } = process.env
  spawnSync(nuxi, ['prepare', '.'], { cwd: benchRoot, env, stdio: 'inherit' })
}

function buildCommand(variant) {
  return [nuxi, [variant.mode === 'generate' ? 'generate' : 'build', '.'], { cwd: benchRoot, env: buildEnv(variant) }]
}

function startCommand(variant, port) {
  const env = { ...buildEnv(variant), ...variant.runEnv, PORT: String(port), NITRO_PORT: String(port), HOST: '127.0.0.1', NITRO_HOST: '127.0.0.1' }
  if (variant.mode === 'dev') return [nuxi, ['dev', '.', '--port', String(port), '--host', '127.0.0.1'], { cwd: benchRoot, env }]
  if (variant.mode === 'generate')
    return [
      process.execPath,
      [join(benchRoot, 'bench/static.mjs'), join(variant.dir, 'public'), String(port), variant.env.BENCH_BASE_URL ?? '/'],
      { cwd: benchRoot, env },
    ]
  return [process.execPath, [join(variant.dir, 'server/index.mjs')], { cwd: benchRoot, env }]
}

function start(variant, port, stdio) {
  if (variant.mode === 'build-only') fail(`${variant.name} is build-only`)
  ensurePrepared()
  if (variant.mode !== 'dev' && !existsSync(variant.dir)) fail(`No output at ${variant.dir}. Run: build ${variant.name}`)
  // the payload host of `cdn`: another variant's public tree, as a CDN would hold it
  const cdn = variant.cdn
    ? spawn(process.execPath, [join(benchRoot, 'bench/static.mjs'), join(resolve(variant.cdn.from).dir, 'public'), String(variant.cdn.port)], {
        stdio,
      })
    : null
  const [command, args, options] = startCommand(variant, port)
  const server = spawn(command, args, { ...options, stdio, detached: true })
  const stop = (signal = 'SIGTERM') => {
    cdn?.kill()
    try {
      process.kill(-server.pid, signal)
    } catch {}
  }
  return { server, stop }
}

/** node:http, as fetch() drops a `host` header and a domain build would answer as an unknown host. */
const get = (url, headers = {}) =>
  new Promise((done, failed) => {
    httpGet(url, { headers }, (response) => {
      const parts = []
      response.on('data', (part) => parts.push(part))
      response.on('end', () => done({ status: response.statusCode, headers: response.headers, body: Buffer.concat(parts).toString() }))
    })
      .on('error', failed)
      .setTimeout(60_000, function () {
        this.destroy(new Error(`no answer from ${url} in 60s`))
      })
  })

async function waitFor(url, ms) {
  const deadline = Date.now() + ms
  while (Date.now() < deadline) {
    try {
      await get(url)
      return true
    } catch {
      await new Promise((done) => setTimeout(done, 300))
    }
  }
  return false
}

/** A page proves itself by its marker: an empty 200 from a broken render is not a pass. */
const pageMarker = (html) => /data-page="([^"]+)"/.exec(html)?.[1] ?? null

function smokePaths(variant) {
  const strategyName = variant.env.BENCH_STRATEGY
  const base = (variant.env.BENCH_BASE_URL ?? '/').replace(/\/$/, '')
  const prefix = strategyName === 'prefix' ? '/en' : ''
  // on a domain build de belongs to another host, where its URLs are a 404; fr has no domain
  const de = strategyName === 'no_prefix' ? '' : variant.env.BENCH_LOCALES === 'domains' ? '/fr' : '/de'
  const isStatic = variant.mode === 'generate'
  const isSpa = variant.env.BENCH_SSR === '0'
  const pages = [`${prefix}/t/basic`, `${de}/t/basic`, `${prefix}/products/1`, `${prefix}/comp/i18n-t`, `${prefix}/huge/1k`].map((path) => ({
    path: base + path,
    page: !isSpa,
  }))
  const home = { path: `${base}/`, page: false }
  return isStatic ? [home, ...pages] : [home, ...pages, { path: `${base}/api/bench/greeting?locale=de`, page: false }]
}

function allPaths(variant) {
  const strategyName = variant.env.BENCH_STRATEGY
  const base = (variant.env.BENCH_BASE_URL ?? '/').replace(/\/$/, '')
  const prefix = strategyName === 'prefix' ? '/en' : ''
  const pages = JSON.parse(readFileSync(join(benchRoot, 'bench/pages.json'), 'utf8'))
  const de = strategyName === 'no_prefix' ? [] : pages.map((path) => `${base}/de${path}`)
  return [...pages.map((path) => base + prefix + path), ...de].map((path) => ({ path, page: false }))
}

async function smoke(variant, port) {
  // what the server said, for a smoke that fails
  mkdirSync(join(benchRoot, '.bench', variant.output), { recursive: true })
  const log = openSync(join(benchRoot, '.bench', variant.output, 'server.log'), 'w')
  const { stop } = start(variant, port, ['ignore', log, log])
  // throwaway server: SIGKILL, so a killed smoke leaves nothing behind and no dev lock in use
  for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => (stop('SIGKILL'), process.exit(1)))
  const base = `http://127.0.0.1:${port}`
  let failed = 0
  try {
    if (!(await waitFor(base, variant.mode === 'dev' ? 100_000 : 20_000))) throw new Error('server did not answer')
    for (const { path, page } of process.argv.includes('--all') ? allPaths(variant) : smokePaths(variant)) {
      const headers = variant.env.BENCH_LOCALES === 'domains' ? { host: `en.bench.localhost:${DOMAIN_PORT}` } : {}
      const { status, headers: answer, body } = await get(base + path, headers)
      const marker = pageMarker(body)
      const ok = process.argv.includes('--all') || (status < 400 && (!page || marker !== null || status >= 300))
      if (!ok) failed++
      console.log(`${ok ? 'ok  ' : 'FAIL'} ${status} ${path} page=${marker} ${answer.location ?? ''}`.trimEnd())
    }
  } finally {
    stop('SIGKILL')
  }
  process.exit(failed ? 1 : 0)
}

const [command, name, portArg] = process.argv.slice(2).filter((arg) => !arg.startsWith('--'))
if (command === 'list') {
  if (process.argv.includes('--json')) console.log(JSON.stringify(variants, null, 2))
  else
    for (const [key, variant] of Object.entries(variants)) console.log(`${key.padEnd(24)} ${variant.mode.padEnd(11)} ${JSON.stringify(variant.env)}`)
} else if (command === 'env') {
  const { env, runEnv, output } = resolve(name)
  for (const [key, value] of Object.entries({ BENCH_VARIANT: output, ...env, ...runEnv })) console.log(`export ${key}='${value}'`)
} else if (command === 'build') {
  const variant = resolve(name)
  if (variant.mode === 'dev') fail(`${name} is a dev variant: use start`)
  ensurePrepared()
  const [bin, args, options] = buildCommand(variant)
  const run = spawnSync(bin, args, { ...options, stdio: 'inherit' })
  process.exit(run.status ?? 1)
} else if (command === 'start') {
  const variant = resolve(name)
  const { server, stop } = start(variant, Number(portArg ?? variant.port ?? DEFAULT_PORT), 'inherit')
  // the server has its own process group: it does not hear a signal sent to this one
  for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => (stop(), process.exit(0)))
  server.on('exit', (code) => process.exit(code ?? 0))
} else if (command === 'smoke') {
  const variant = resolve(name)
  await smoke(variant, Number(portArg ?? variant.port ?? DEFAULT_PORT))
} else {
  console.log(
    readFileSync(fileURLToPath(import.meta.url), 'utf8')
      .split('\n')
      .slice(1, 12)
      .join('\n'),
  )
}
