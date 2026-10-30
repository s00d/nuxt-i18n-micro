/**
 * Shared suite for the i18n strategy tests: `nuxi generate` of test/fixtures/strategy for one
 * strategy. The journeys (test/journeys/strategies-*.spec.ts) walk the same fixture in a browser
 * on a server build and request every `CASES[strategy].routes` URL directly; generate is what they cannot do.
 *
 * One file per strategy (test/strategies-<strategy>.test.ts) so Vitest — which parallelizes
 * per file — runs the four at once. Each builds into its own `NUXT_TEST_BUILD_DIR`
 * (`strategies-<strategy>-static`), so concurrent files never touch each other's output.
 */
import { existsSync, readFileSync } from 'node:fs'
import { rm } from 'node:fs/promises'
import { join } from 'node:path'
import { stripVTControlCharacters } from 'node:util'
import { afterAll, expect, test } from 'vitest'
import { isolatedBuild } from './isolated-build'
import { runCommand } from './subprocess'

export type StrategyName = 'no_prefix' | 'prefix_except_default' | 'prefix' | 'prefix_and_default'

interface StrategyCase {
  /** URL → the `#content` text the page renders (index: the locale, contact: `contact`); the journeys request each one too. */
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

export const CASES: Record<StrategyName, StrategyCase> = {
  no_prefix: {
    routes: { '/': 'en', '/contact': 'contact', '/kontakt': 'contact' },
    pages: ['about', 'a-propos', ...SETTINGS('')],
    absent: ['de'],
  },
  prefix_except_default: {
    routes: { '/': 'en', '/ru': 'ru', '/de': 'de', '/ru/contact': 'contact', '/de/kontakt': 'contact' },
    pages: ['about', 'contact', 'de/a-propos', 'ru/about', 'unlinked', 'de/unlinked', 'ru/unlinked', ...SETTINGS(''), ...SETTINGS('de/'), ...SETTINGS('ru/')],
    unprefixedDefault: '/contact',
  },
  prefix: {
    routes: { '/en': 'en', '/ru': 'ru', '/de': 'de', '/en/contact': 'contact', '/ru/contact': 'contact', '/de/kontakt': 'contact' },
    pages: ['en/about', 'de/a-propos', 'ru/about', 'en/unlinked', 'de/unlinked', 'ru/unlinked', ...SETTINGS('en/'), ...SETTINGS('de/'), ...SETTINGS('ru/')],
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

export const contentOf = (html: string) => /<p id="content">\s*([^<]*?)\s*<\/p>/.exec(html)?.[1]
const htmlFile = (publicDir: string, path: string) => join(publicDir, path.replace(/^\/+/, ''), 'index.html')

export function registerStrategySuite(strategy: StrategyName): void {
  const { routes, pages, absent = [], rootRedirect } = CASES[strategy]
  const generated = isolatedBuild('strategy', `strategies-${strategy}-static`)
  afterAll(async () => {
    await rm(generated.buildDir, { recursive: true, force: true }).catch(() => {})
  })

  test('nuxi generate: no prerender errors, every localized page and payload on disk', { timeout: 300_000 }, async () => {
    // step 1: generate (prerender crawls the localized links; a broken one is a prerender error)
    await rm(generated.buildDir, { recursive: true, force: true })
    const output = await runCommand('npx', ['nuxi', 'generate'], { cwd: generated.fixtureDir, env: { ...generated.env, STRATEGY: strategy } })
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
}
