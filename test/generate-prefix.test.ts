/**
 * test/generate-prefix.test.ts
 *
 * Verifies that `nuxi generate` with the `prefix` strategy completes without
 * errors. This is a regression test for the issue where the root `/` route
 * returned 404 during prerendering (because `sendRedirect` did not abort the
 * Nuxt rendering pipeline via `ssrContext._renderResponse`).
 *
 * The fix uses `navigateTo` during prerendering (which properly sets
 * `_renderResponse`) and `sendRedirect` at runtime.
 */

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

afterAll(async () => {
  // Clean up generated output
  await rimraf(OUTPUT_DIR).catch(() => {})
  await rimraf(join(FIXTURES, '.nuxt')).catch(() => {})
  await rimraf(join(FIXTURES, 'node_modules/.cache')).catch(() => {})
})

describe('nuxi generate with prefix strategy', () => {
  it('completes without prerender errors', async () => {
    // Run nuxi generate with prefix strategy.
    // If it fails with a non-zero exit code, exec() rejects with the error.
    // The key assertion: the command succeeds (exit code 0).
    let exitOk = false
    let combinedOutput = ''

    try {
      const { stdout, stderr } = await exec('npx nuxi generate', {
        cwd: FIXTURES,
        env: {
          ...process.env,
          STRATEGY: 'prefix',
        },
        timeout: 120_000,
        maxBuffer: 10 * 1024 * 1024, // 10 MB to capture full output
      })
      combinedOutput = (stdout || '') + (stderr || '')
      exitOk = true
    } catch (err: unknown) {
      // exec rejects when exit code is non-zero
      const e = err as { stdout?: string; stderr?: string; message?: string }
      combinedOutput = (e.stdout || '') + (e.stderr || '')
      exitOk = false
    }

    // The command must succeed (exit code 0)
    expect(exitOk, `nuxi generate failed:\n${combinedOutput.slice(-2000)}`).toBe(true)

    // Must NOT contain prerender error markers
    expect(combinedOutput).not.toContain('Exiting due to prerender errors')
    expect(combinedOutput).not.toMatch(/├─ \/ .*\[404\]/)
  }, 120_000)

  it('generates index.html at root with a redirect', async () => {
    const indexPath = join(OUTPUT_PUBLIC, 'index.html')
    expect(existsSync(indexPath)).toBe(true)

    const html = readFileSync(indexPath, 'utf-8')

    // The root index.html should contain a meta refresh redirect to /en
    expect(html).toContain('meta')
    expect(html).toContain('/en')
  })

  it('generates /en/index.html with actual page content', async () => {
    const enIndexPath = join(OUTPUT_PUBLIC, 'en', 'index.html')
    expect(existsSync(enIndexPath)).toBe(true)

    const html = readFileSync(enIndexPath, 'utf-8')

    // Should contain actual rendered content (not a redirect page)
    expect(html).toContain('en')
    // Should not be a bare redirect
    expect(html.length).toBeGreaterThan(200)
  })

  it('generates /de/index.html with actual page content', async () => {
    const deIndexPath = join(OUTPUT_PUBLIC, 'de', 'index.html')
    expect(existsSync(deIndexPath)).toBe(true)

    const html = readFileSync(deIndexPath, 'utf-8')

    expect(html).toContain('de')
    expect(html.length).toBeGreaterThan(200)
  })
})
