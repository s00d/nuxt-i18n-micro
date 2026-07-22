import { exec as execCb } from 'node:child_process'
import { existsSync } from 'node:fs'
import { promisify } from 'node:util'
import { rimraf } from 'rimraf'
import { afterAll, describe, expect, it } from 'vitest'
import { isolatedBuild } from './helpers/isolated-build'

const exec = promisify(execCb)

const build = isolatedBuild('nuxt-7cnbrdte', 'generate-issue-218')

afterAll(async () => {
  await rimraf(build.buildDir).catch(() => {})
})

describe('issue #218 - routeRules prerender should not double-localize routes', () => {
  it('builds without /fr/fr prerender errors', async () => {
    await rimraf(build.buildDir)

    let exitOk = false
    let combinedOutput = ''

    try {
      const { stdout, stderr } = await exec('npx nuxi build', {
        cwd: build.fixtureDir,
        env: { ...process.env, ...build.env },
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

    expect(exitOk, `nuxi build failed:\n${combinedOutput.slice(-2000)}`).toBe(true)
    expect(combinedOutput).not.toContain('/fr/fr')
    expect(existsSync(build.serverEntry)).toBe(true)
  }, 120_000)
})
