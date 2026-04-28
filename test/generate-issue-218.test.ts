import { exec as execCb } from 'node:child_process'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'
import { rimraf } from 'rimraf'
import { afterAll, describe, expect, it } from 'vitest'

const exec = promisify(execCb)

const FIXTURES = join(fileURLToPath(import.meta.url), '..', 'fixtures/nuxt-7cnbrdte')
const OUTPUT_DIR = join(FIXTURES, '.output')
const OUTPUT_PUBLIC = join(OUTPUT_DIR, 'public')

afterAll(async () => {
  await rimraf(OUTPUT_DIR).catch(() => {})
  await rimraf(join(FIXTURES, '.nuxt')).catch(() => {})
  await rimraf(join(FIXTURES, 'node_modules/.cache')).catch(() => {})
})

describe('issue #218 - routeRules prerender should not double-localize routes', () => {
  it('builds without /fr/fr prerender errors', async () => {
    let exitOk = false
    let combinedOutput = ''

    try {
      const { stdout, stderr } = await exec('npx nuxi build', {
        cwd: FIXTURES,
        env: process.env,
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

    if (!exitOk) throw new Error(`nuxi build failed:\n${combinedOutput.slice(-2000)}`)
    expect(exitOk).toBe(true)
    expect(combinedOutput).not.toContain('/fr/fr')
    expect(combinedOutput).not.toContain('Exiting due to prerender errors')
  }, 120_000)

  it('does not create double-prefixed output routes', () => {
    expect(existsSync(join(OUTPUT_PUBLIC, 'fr', 'index.html'))).toBe(true)
    expect(existsSync(join(OUTPUT_PUBLIC, 'fr', 'about', 'index.html'))).toBe(true)
    expect(existsSync(join(OUTPUT_PUBLIC, 'fr', 'fr', 'index.html'))).toBe(false)
    expect(existsSync(join(OUTPUT_PUBLIC, 'fr', 'fr', 'about', 'index.html'))).toBe(false)
  })
})
