import { exec as execCb } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { promisify } from 'node:util'
import { rimraf } from 'rimraf'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { isolatedBuild } from './isolated-build'

const exec = promisify(execCb)

const NESTED_PAYLOAD = [
  ['settings-profile', 'en', 'profileTitle'],
  ['settings-profile', 'de', 'profileTitle'],
  ['settings-profile', 'ru', 'profileTitle'],
  ['settings-team', 'en', 'teamTitle'],
  ['settings-team', 'de', 'teamTitle'],
  ['settings-team', 'ru', 'teamTitle'],
] as const

const FULL_PAYLOAD = [
  ['index', 'en', 'key0'],
  ['index', 'de', 'key0'],
  ['index', 'ru', 'key0'],
  ['about', 'en', 'key0'],
  ['about', 'de', 'key0'],
  ['about', 'ru', 'key0'],
  ['contact', 'en', 'key0'],
  ['contact', 'de', 'key0'],
  ['contact', 'ru', 'key0'],
  ...NESTED_PAYLOAD,
] as const

async function runGenerate(fixtureDir: string, env: NodeJS.ProcessEnv, strategy: string) {
  let exitOk = false
  let combinedOutput = ''

  try {
    const { stdout, stderr } = await exec('npx nuxi generate', {
      cwd: fixtureDir,
      env: { ...process.env, ...env, STRATEGY: strategy },
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

  return { exitOk, combinedOutput }
}

function assertPayloads(publicDir: string) {
  for (const [pageName, locale, key] of FULL_PAYLOAD) {
    const payloadPath = join(publicDir, '_locales', pageName, locale, 'data.json')
    expect(existsSync(payloadPath), `missing payload: ${payloadPath}`).toBe(true)
    const payload = JSON.parse(readFileSync(payloadPath, 'utf-8')) as Record<string, string>
    expect(payload[key], `missing key "${key}" in ${payloadPath}`).toBeDefined()
  }
}

type GenerateCase = {
  strategy: string
  buildName: string
  assertRoutes: (publicDir: string) => void
  extra?: (publicDir: string) => void
}

const GENERATE_CASES: GenerateCase[] = [
  {
    strategy: 'prefix',
    buildName: 'generate-prefix',
    assertRoutes(publicDir) {
      const routeMatrix = [
        ['en', 'about'],
        ['de', 'a-propos'],
        ['ru', 'about'],
        ['en', 'contact'],
        ['de', 'kontakt'],
        ['ru', 'contact'],
        ['en', 'settings', 'profile'],
        ['de', 'settings', 'profile'],
        ['ru', 'settings', 'profile'],
        ['en', 'settings', 'team'],
        ['de', 'settings', 'team'],
        ['ru', 'settings', 'team'],
      ] as const
      for (const parts of routeMatrix) {
        expect(existsSync(join(publicDir, ...parts, 'index.html'))).toBe(true)
      }
    },
    extra(publicDir) {
      const indexPath = join(publicDir, 'index.html')
      expect(existsSync(indexPath)).toBe(true)
      const html = readFileSync(indexPath, 'utf-8')
      expect(html).toContain('meta')
      expect(html).toContain('/en')
      expect(readFileSync(join(publicDir, 'en', 'index.html'), 'utf-8').length).toBeGreaterThan(200)
    },
  },
  {
    strategy: 'no_prefix',
    buildName: 'generate-no-prefix',
    assertRoutes(publicDir) {
      const routeMatrix = [['about'], ['a-propos'], ['contact'], ['kontakt'], ['settings', 'profile'], ['settings', 'team']] as const
      for (const parts of routeMatrix) {
        expect(existsSync(join(publicDir, ...parts, 'index.html'))).toBe(true)
      }
      expect(existsSync(join(publicDir, 'index.html'))).toBe(true)
      expect(existsSync(join(publicDir, 'de', 'index.html'))).toBe(false)
    },
  },
  {
    strategy: 'prefix_except_default',
    buildName: 'generate-prefix-except-default',
    assertRoutes(publicDir) {
      const routeMatrix = [
        ['about'],
        ['contact'],
        ['de', 'a-propos'],
        ['de', 'kontakt'],
        ['ru', 'about'],
        ['ru', 'contact'],
        ['settings', 'profile'],
        ['settings', 'team'],
        ['de', 'settings', 'profile'],
        ['de', 'settings', 'team'],
        ['ru', 'settings', 'profile'],
        ['ru', 'settings', 'team'],
      ] as const
      for (const parts of routeMatrix) {
        expect(existsSync(join(publicDir, ...parts, 'index.html'))).toBe(true)
      }
      expect(existsSync(join(publicDir, 'index.html'))).toBe(true)
      expect(existsSync(join(publicDir, 'de', 'index.html'))).toBe(true)
    },
  },
  {
    strategy: 'prefix_and_default',
    buildName: 'generate-prefix-and-default',
    assertRoutes(publicDir) {
      const routeMatrix = [
        ['about'],
        ['contact'],
        ['settings', 'profile'],
        ['settings', 'team'],
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
        expect(existsSync(join(publicDir, ...parts, 'index.html'))).toBe(true)
      }
      expect(existsSync(join(publicDir, 'index.html'))).toBe(true)
      expect(existsSync(join(publicDir, 'en', 'index.html'))).toBe(true)
      expect(existsSync(join(publicDir, 'de', 'index.html'))).toBe(true)
    },
  },
]

export function registerStrategyGenerateTests() {
  describe.each(GENERATE_CASES)('nuxi generate [$strategy]', ({ strategy, buildName, assertRoutes, extra }) => {
    const build = isolatedBuild('strategy', buildName)
    const OUTPUT_PUBLIC = build.publicDir

    let combinedOutput = ''

    beforeAll(async () => {
      await rimraf(build.buildDir)
      const result = await runGenerate(build.fixtureDir, build.env, strategy)
      combinedOutput = result.combinedOutput
      expect(result.exitOk, `nuxi generate failed:\n${combinedOutput.slice(-2000)}`).toBe(true)
    }, 120_000)

    afterAll(async () => {
      await rimraf(build.buildDir).catch(() => {})
    })

    it('completes without prerender errors', () => {
      expect(combinedOutput).not.toContain('Exiting due to prerender errors')
      if (strategy === 'prefix') {
        expect(combinedOutput).not.toMatch(/├─ \/ .*\[404\]/)
      }
    })

    it('generates expected static routes and payloads', () => {
      assertRoutes(OUTPUT_PUBLIC)
      assertPayloads(OUTPUT_PUBLIC)
      extra?.(OUTPUT_PUBLIC)
    })
  })
}
