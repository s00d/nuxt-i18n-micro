/**
 * One config, one `nuxi generate` per domain: NUXT_I18N_DOMAIN is the host of the run and the
 * public dir comes from the fixture's own env (`nitro.output.publicDir`, as the docs show).
 */
import { existsSync, readFileSync } from 'node:fs'
import { rm } from 'node:fs/promises'
import { join } from 'node:path'
import { afterAll, describe, expect, test } from 'vitest'
import { alternateOf, canonicalOf, contentOn } from './helpers/domains'
import { isolatedBuild } from './helpers/isolated-build'
import { runCommand } from './helpers/subprocess'

const generated = isolatedBuild('strategy', 'domains-generate')
// outside the build dir and the output dir: each run empties both
const trees = `${generated.buildDir}-trees`
const generate = (domain: string | null, name: string) =>
  runCommand('npx', ['nuxi', 'generate'], {
    cwd: generated.fixtureDir,
    env: {
      ...generated.env,
      STRATEGY: 'prefix_except_default',
      DOMAINS: '/',
      PUBLIC_DIR: join(trees, name),
      ...(domain ? { NUXT_I18N_DOMAIN: domain } : {}),
    },
  })
const page = (name: string, path: string) => readFileSync(join(trees, name, path, 'index.html'), 'utf-8')
const has = (name: string, path: string) => existsSync(join(trees, name, path))

describe('generate per domain', () => {
  afterAll(async () => {
    for (const dir of [generated.buildDir, trees]) await rm(dir, { recursive: true, force: true }).catch(() => {})
  })

  test('each tree holds its domain: pages, payloads, hreflang', { timeout: 300_000 }, async () => {
    await rm(generated.buildDir, { recursive: true, force: true })
    await generate('example.de', 'de')
    await generate('example.com', 'com')

    // step 1: the host default is unprefixed, custom paths included; ru is in both trees
    expect(contentOn(page('de', ''))).toBe('de')
    expect(contentOn(page('de', 'kontakt'))).toBe('contact')
    expect(contentOn(page('de', 'ru'))).toBe('ru')
    expect(contentOn(page('com', ''))).toBe('en')
    expect(contentOn(page('com', 'contact'))).toBe('contact')
    expect(contentOn(page('com', 'ru/contact'))).toBe('contact')

    // step 2: nothing of the other domain is prerendered or crawled
    for (const path of ['en', 'de', 'contact', 'de/kontakt', 'en/contact']) expect(has('de', join(path, 'index.html'))).toBe(false)
    for (const path of ['en', 'de', 'kontakt', 'de/kontakt', 'en/contact']) expect(has('com', join(path, 'index.html'))).toBe(false)

    // step 3: payloads of the served locales only
    expect(has('de', '_locales/index/de/data.json')).toBe(true)
    expect(has('de', '_locales/index/ru/data.json')).toBe(true)
    expect(has('de', '_locales/index/en/data.json')).toBe(false)
    expect(has('com', '_locales/index/de/data.json')).toBe(false)

    // step 4: the head points at the real domains
    const html = page('de', 'kontakt')
    expect(canonicalOf(html)).toBe('https://example.de/kontakt')
    expect(alternateOf(html, 'en_EN')).toBe('https://example.com/contact')
    expect(alternateOf(html, 'ru_RU')).toBe('https://example.de/ru/contact')
  })

  test('without the variable: a warning, the build config', { timeout: 300_000 }, async () => {
    const output = await generate(null, 'all')
    expect(output).toContain('NUXT_I18N_DOMAIN')
    expect(contentOn(page('all', ''))).toBe('en')
  })
})
