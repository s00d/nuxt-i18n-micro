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

describe('nuxi generate with no_prefix strategy', () => {
  it('completes without prerender errors', async () => {
    let exitOk = false
    let combinedOutput = ''

    try {
      const { stdout, stderr } = await exec('npx nuxi generate', {
        cwd: FIXTURES,
        env: {
          ...process.env,
          STRATEGY: 'no_prefix',
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

  it('generates root index without locale-prefixed root pages', async () => {
    const rootIndexPath = join(OUTPUT_PUBLIC, 'index.html')
    const deIndexPath = join(OUTPUT_PUBLIC, 'de', 'index.html')

    expect(existsSync(rootIndexPath)).toBe(true)
    expect(existsSync(deIndexPath)).toBe(false)

    const html = readFileSync(rootIndexPath, 'utf-8')
    expect(html).toContain('en')
  })

  it('generates existing and nested child page routes without locale prefix', async () => {
    const routeMatrix = [['about'], ['a-propos'], ['contact'], ['kontakt'], ['settings', 'profile'], ['settings', 'team']] as const

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
