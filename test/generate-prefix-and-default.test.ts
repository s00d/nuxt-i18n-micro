import { exec as execCb } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'
import { rimraf } from 'rimraf'
import { afterAll, describe, expect, it } from 'vitest'

const exec = promisify(execCb)

const FIXTURES = join(fileURLToPath(import.meta.url), '..', 'fixtures/strategy')
const OUTPUT_DIR = join(FIXTURES, '.output')
const OUTPUT_PUBLIC = join(OUTPUT_DIR, 'public')

const payloadMatrix = [
  ['settings-profile', 'en', 'profileTitle'],
  ['settings-profile', 'de', 'profileTitle'],
  ['settings-profile', 'ru', 'profileTitle'],
  ['settings-team', 'en', 'teamTitle'],
  ['settings-team', 'de', 'teamTitle'],
  ['settings-team', 'ru', 'teamTitle'],
] as const

afterAll(async () => {
  await rimraf(OUTPUT_DIR).catch(() => {})
  await rimraf(join(FIXTURES, '.nuxt')).catch(() => {})
  await rimraf(join(FIXTURES, 'node_modules/.cache')).catch(() => {})
})

describe('nuxi generate with prefix_and_default strategy', () => {
  it('completes without prerender errors', async () => {
    let exitOk = false
    let combinedOutput = ''

    try {
      const { stdout, stderr } = await exec('npx nuxi generate', {
        cwd: FIXTURES,
        env: {
          ...process.env,
          STRATEGY: 'prefix_and_default',
        },
        timeout: 120_000,
        maxBuffer: 10 * 1024 * 1024,
      })
      combinedOutput = (stdout || '') + (stderr || '')
      exitOk = true
    } catch (err: unknown) {
      const e = err as { stdout?: string; stderr?: string }
      combinedOutput = (e.stdout || '') + (e.stderr || '')
      exitOk = false
    }

    expect(exitOk, `nuxi generate failed:\n${combinedOutput.slice(-2000)}`).toBe(true)
    expect(combinedOutput).not.toContain('Exiting due to prerender errors')
  }, 120_000)

  it('generates root redirect and prefixed root pages for all locales', async () => {
    const rootIndexPath = join(OUTPUT_PUBLIC, 'index.html')
    const enIndexPath = join(OUTPUT_PUBLIC, 'en', 'index.html')
    const deIndexPath = join(OUTPUT_PUBLIC, 'de', 'index.html')

    expect(existsSync(rootIndexPath)).toBe(true)
    expect(existsSync(enIndexPath)).toBe(true)
    expect(existsSync(deIndexPath)).toBe(true)

    const rootHtml = readFileSync(rootIndexPath, 'utf-8')
    const enHtml = readFileSync(enIndexPath, 'utf-8')
    const deHtml = readFileSync(deIndexPath, 'utf-8')

    expect(rootHtml).toContain('/en')
    expect(enHtml).toContain('en')
    expect(deHtml).toContain('de')
  })

  it('generates existing and nested child page routes for all prefixed locales', async () => {
    const routeMatrix = [
      ['en', 'about'],
      ['de', 'a-propos'],
      ['ru', 'about'],
      ['en', 'contact'],
      ['de', 'kontakt'],
      ['ru', 'contact'],
      ['en', 'settings', 'profile'],
      ['en', 'settings', 'team'],
      ['de', 'settings', 'profile'],
      ['de', 'settings', 'team'],
      ['ru', 'settings', 'profile'],
      ['ru', 'settings', 'team'],
    ] as const

    for (const parts of routeMatrix) {
      const routeIndexPath = join(OUTPUT_PUBLIC, ...parts, 'index.html')
      expect(existsSync(routeIndexPath)).toBe(true)
    }
  })

  it('prerenders old and nested page locale payload routes', async () => {
    const fullPayloadMatrix = [
      ['index', 'en', 'key0'],
      ['index', 'de', 'key0'],
      ['index', 'ru', 'key0'],
      ['about', 'en', 'key0'],
      ['about', 'de', 'key0'],
      ['about', 'ru', 'key0'],
      ['contact', 'en', 'key0'],
      ['contact', 'de', 'key0'],
      ['contact', 'ru', 'key0'],
      ...payloadMatrix,
    ] as const

    for (const [pageName, locale, key] of fullPayloadMatrix) {
      const payloadPath = join(OUTPUT_PUBLIC, '_locales', pageName, locale, 'data.json')
      expect(existsSync(payloadPath)).toBe(true)

      const payload = JSON.parse(readFileSync(payloadPath, 'utf-8')) as Record<string, string>
      expect(payload[key]).toBeDefined()
    }
  })
})
