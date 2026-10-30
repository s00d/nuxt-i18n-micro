/**
 * Shared suite for the i18n strategy tests: `nuxi generate` and `nuxi build` of
 * test/fixtures/strategy for one strategy. The journeys (test/journeys/strategies-*.spec.ts)
 * walk the same fixture in a browser on a server build; generate is what they cannot do, and
 * here every localized URL is requested directly instead of reached by a click.
 *
 * One file per strategy (test/strategies-<strategy>.test.ts) so Vitest — which parallelizes
 * per file — runs the four at once. Each phase builds into its own `NUXT_TEST_BUILD_DIR`
 * (`strategies-<strategy>-<phase>`), so concurrent files never touch each other's output.
 *
 * Ports come from getFreePort() (`listen(0)`); the server is stopped through its ChildProcess
 * handle via stopChild(), which kills the whole process group. Never free a port by killing
 * whoever owns it — that can hit a sibling worker.
 */
import type { ChildProcess } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { rm } from 'node:fs/promises'
import { join } from 'node:path'
import { setTimeout as delay } from 'node:timers/promises'
import { stripVTControlCharacters } from 'node:util'
import { afterAll, expect, test } from 'vitest'
import { isolatedBuild } from './isolated-build'
import { getFreePort } from './port'
import { runCommand, spawnServer, stopChild } from './subprocess'

const HOST = '127.0.0.1'

export type StrategyName = 'no_prefix' | 'prefix_except_default' | 'prefix' | 'prefix_and_default'

interface StrategyCase {
  /** URL → the `#content` text the page renders (index: the locale, contact: `contact`). */
  routes: Record<string, string>
  /** Extra prerendered pages (`<dir>/index.html`) besides `routes`. */
  pages: string[]
  /** Prerendered pages that must not exist. */
  absent?: string[]
  /** `prefix` prerenders `/` as a redirect page to the default locale. */
  rootRedirect?: string
  /** An unprefixed URL that belongs to the default locale, whatever the visitor prefers. */
  unprefixedDefault?: string
}

const SETTINGS = (prefix: string) => [`${prefix}settings/profile`, `${prefix}settings/team`]

const CASES: Record<StrategyName, StrategyCase> = {
  no_prefix: {
    routes: { '/': 'en', '/contact': 'contact', '/kontakt': 'contact' },
    pages: ['about', 'a-propos', ...SETTINGS('')],
    absent: ['de'],
  },
  prefix_except_default: {
    routes: { '/': 'en', '/ru': 'ru', '/de': 'de', '/ru/contact': 'contact', '/de/kontakt': 'contact' },
    pages: ['about', 'contact', 'de/a-propos', 'ru/about', ...SETTINGS(''), ...SETTINGS('de/'), ...SETTINGS('ru/')],
    unprefixedDefault: '/contact',
  },
  prefix: {
    routes: { '/en': 'en', '/ru': 'ru', '/de': 'de', '/en/contact': 'contact', '/ru/contact': 'contact', '/de/kontakt': 'contact' },
    pages: ['en/about', 'de/a-propos', 'ru/about', ...SETTINGS('en/'), ...SETTINGS('de/'), ...SETTINGS('ru/')],
    rootRedirect: '/en',
  },
  prefix_and_default: {
    routes: { '/': 'en', '/en': 'en', '/ru': 'ru', '/de': 'de', '/en/contact': 'contact', '/ru/contact': 'contact', '/de/kontakt': 'contact' },
    pages: ['en/about', 'de/a-propos', 'ru/about', ...SETTINGS('en/'), ...SETTINGS('de/'), ...SETTINGS('ru/')],
    unprefixedDefault: '/contact',
  },
}

/** Every page × locale payload the premerged build publishes, with one key it must carry. */
const PAYLOAD_KEYS: Record<string, string> = {
  index: 'key0',
  about: 'key0',
  contact: 'key0',
  'settings-profile': 'profileTitle',
  'settings-team': 'teamTitle',
}
const PAYLOADS = Object.entries(PAYLOAD_KEYS).flatMap(([page, key]) =>
  ['en', 'de', 'ru'].map((locale) => ({ file: join('_locales', page, locale, 'data.json'), key })),
)

const contentOf = (html: string) => /<p id="content">\s*([^<]*?)\s*<\/p>/.exec(html)?.[1]
const htmlFile = (publicDir: string, path: string) => join(publicDir, path.replace(/^\/+/, ''), 'index.html')

async function fetchHtml(url: string): Promise<string> {
  for (let attempt = 0; attempt < 40; attempt++) {
    const html = await fetch(url).then(
      (res) => res.text(),
      () => null,
    )
    if (html !== null) return html
    await delay(500)
  }
  throw new Error(`server did not answer at ${url}`)
}

export function registerStrategySuite(strategy: StrategyName): void {
  const { routes, pages, absent = [], rootRedirect, unprefixedDefault } = CASES[strategy]
  const build = (script: 'generate' | 'build', dir: ReturnType<typeof isolatedBuild>, env: Record<string, string> = {}) =>
    runCommand('npx', ['nuxi', script], { cwd: dir.fixtureDir, env: { ...dir.env, STRATEGY: strategy, ...env } })

  const generated = isolatedBuild('strategy', `strategies-${strategy}-static`)
  const ssr = isolatedBuild('strategy', `strategies-${strategy}-ssr`)
  let server: ChildProcess | null = null
  afterAll(async () => {
    await stopChild(server)
    await rm(generated.buildDir, { recursive: true, force: true }).catch(() => {})
    await rm(ssr.buildDir, { recursive: true, force: true }).catch(() => {})
  })

  test('nuxi generate: no prerender errors, every localized page and payload on disk', { timeout: 300_000 }, async () => {
    // step 1: generate (prerender crawls the localized links; a broken one is a prerender error)
    await rm(generated.buildDir, { recursive: true, force: true })
    const output = await build('generate', generated)
    expect(output).not.toContain('Exiting due to prerender errors')
    // every crawled route that failed (the fixture sets failOnError: false, so generate still
    // succeeds): Nitro logs `├─ <route> (<n>ms)` with its error on the next `│ └──` line
    const log = stripVTControlCharacters(output)
    // the route list is in the captured output, or the check below would pass on nothing
    expect(log).toMatch(/├─ \/\S* \(\d+ms\)/)
    const failed = [...log.matchAll(/├─ (\S+) \(\d+ms\)\n\s*│ [├└]── ([^\n]+)/g)].map(([, route, error]) => `${route}: ${error}`)
    expect(failed).toEqual([])

    // step 2: each URL is a static page rendering its locale / page content
    for (const [path, content] of Object.entries(routes)) {
      expect(contentOf(readFileSync(htmlFile(generated.publicDir, path), 'utf-8'))).toBe(content)
    }

    // step 3: the localized custom paths and nested pages exist, pages a strategy must not have do not
    for (const page of pages) expect(existsSync(htmlFile(generated.publicDir, page))).toBe(true)
    for (const page of absent) expect(existsSync(htmlFile(generated.publicDir, page))).toBe(false)
    if (rootRedirect) expect(readFileSync(htmlFile(generated.publicDir, '/'), 'utf-8')).toMatch(new RegExp(`<meta[^>]+url=${rootRedirect}"`))

    // step 4: the premerged payload of every page × locale is published next to the pages
    for (const { file, key } of PAYLOADS) {
      expect(JSON.parse(readFileSync(join(generated.publicDir, file), 'utf-8'))).toHaveProperty(key)
    }
  })

  test('nuxi build: the SSR server renders every localized URL on a direct request', { timeout: 300_000 }, async () => {
    await rm(ssr.buildDir, { recursive: true, force: true })
    await build('build', ssr, { AUTO_DETECT_LANGUAGE: '1' })
    const port = await getFreePort()
    server = spawnServer('node', [ssr.serverEntry], { cwd: ssr.fixtureDir, env: { PORT: String(port) } })

    for (const [path, content] of Object.entries(routes)) {
      expect(contentOf(await fetchHtml(`http://${HOST}:${port}${path}`))).toBe(content)
    }
    if (unprefixedDefault) {
      // the unprefixed URL is the default locale's: Accept-Language must not render another one on it
      const german = await fetch(`http://${HOST}:${port}${unprefixedDefault}`, { headers: { 'Accept-Language': 'de' } }).then((res) => res.text())
      expect(german).toMatch(/<html[^>]+lang="en_EN"/)
    }
    if (strategy === 'no_prefix') return
    // a locale state set by a plugin, valid or not, must not load another chunk for the URL's locale
    for (const forced of ['de', 'xx']) {
      const html = await fetch(`http://${HOST}:${port}/ru/contact`, { headers: { 'x-test-force-locale': forced } }).then((res) => res.text())
      expect(html).toContain('_locales/contact/ru/data.json')
    }
  })
}
