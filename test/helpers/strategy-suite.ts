/**
 * Shared suite for the i18n strategy tests.
 *
 * Each strategy lives in its own test file (test/strategies-<strategy>.test.ts) so
 * Vitest — which parallelizes per file, not per describe — can run them
 * concurrently. Every phase gets its own `NUXT_TEST_BUILD_DIR`
 * (`strategies-<strategy>-<phase>`), so concurrent files never rimraf or read
 * each other's build output while sharing the same fixture sources.
 *
 * Ports come from getFreePort() (`listen(0)`); servers are stopped through their
 * ChildProcess handle via stopChild(), which kills the whole process group. Never
 * free a port by killing whoever owns it — that can hit a sibling worker.
 */
import type { ChildProcess } from 'node:child_process'
import { setTimeout as delay } from 'node:timers/promises'
import { rm } from 'node:fs/promises'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { isolatedBuild } from './isolated-build'
import { getFreePort } from './port'
import { runCommand, spawnServer, stopChild } from './subprocess'

const HOST = '127.0.0.1'

export type StrategyName = 'no_prefix' | 'prefix_except_default' | 'prefix' | 'prefix_and_default'

type Route = readonly [path: string, expectedText: string]

export const STRATEGY_ROUTES: Record<StrategyName, readonly Route[]> = {
  no_prefix: [
    ['/', 'en'],
    ['/contact', 'contact'],
    ['/kontakt', 'contact'],
  ],
  prefix_except_default: [
    ['/', 'en'],
    ['/ru', 'ru'],
    ['/de', 'de'],
    ['/ru/contact', 'contact'],
    ['/de/kontakt', 'contact'],
  ],
  prefix: [
    ['/en', 'en'],
    ['/ru', 'ru'],
    ['/de', 'de'],
    ['/en/contact', 'contact'],
    ['/ru/contact', 'contact'],
    ['/de/kontakt', 'contact'],
  ],
  prefix_and_default: [
    ['/', 'en'],
    ['/en', 'en'],
    ['/ru', 'ru'],
    ['/de', 'de'],
    ['/en/contact', 'contact'],
    ['/ru/contact', 'contact'],
    ['/de/kontakt', 'contact'],
  ],
}

/** Wait for text to appear on page */
async function waitForText(url: string, text: string, tries = 40, ms = 500) {
  async function attempt(index: number): Promise<void> {
    if (index >= tries) throw new Error(`"${text}" not found at ${url}`)

    try {
      if ((await (await fetch(url)).text()).includes(text)) return
    } catch {
      /* server not started */
    }
    await delay(ms)
    return attempt(index + 1)
  }

  await attempt(0)
}

async function htmlIncludes(port: number, path: string, text: string) {
  const res = await fetch(`http://${HOST}:${port}${path}`)
  expect(await res.text()).toContain(text)
}

/**
 * Register the `static generate` + `ssr build` suites for one strategy.
 * Both phases build the same fixture into separate directories.
 */
export function registerStrategySuite(strategy: StrategyName): void {
  const routes = STRATEGY_ROUTES[strategy]
  const first = routes[0]
  if (!first) throw new Error(`No routes configured for strategy ${strategy}`)

  /** npm run generate / npm run build for one phase's build dir */
  const runNuxt = (script: 'generate' | 'build', build: ReturnType<typeof isolatedBuild>) => {
    const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm'
    return runCommand(npmCmd, ['run', script], {
      cwd: build.fixtureDir,
      env: { ...build.env, STRATEGY: strategy },
    })
  }

  const registerPhase = (
    title: string,
    build: ReturnType<typeof isolatedBuild>,
    script: 'generate' | 'build',
    serverCommand: (port: number) => readonly string[],
  ) => {
    describe(title, () => {
      let port = 0
      let server: ChildProcess | null = null

      const stop = async () => {
        // stopChild kills the whole process group, releasing the port with it.
        await stopChild(server)
        server = null
      }

      beforeAll(async () => {
        await rm(build.buildDir, { recursive: true, force: true })
        await runNuxt(script, build)

        port = await getFreePort()
        const [command, ...args] = serverCommand(port)
        if (!command) throw new Error('Command is required')
        server = spawnServer(command, args, {
          cwd: build.fixtureDir,
          env: { PORT: String(port) },
        })

        await waitForText(`http://${HOST}:${port}${first[0]}`, first[1])
      }, 300_000)

      afterAll(stop)

      routes.forEach(([path, text]) => {
        it(`GET ${path} → contains "${text}"`, async () => {
          await htmlIncludes(port, path, text)
        })
      })
    })
  }

  const staticBuild = isolatedBuild('strategy', `strategies-${strategy}-static`)
  const ssrBuild = isolatedBuild('strategy', `strategies-${strategy}-ssr`)

  registerPhase('static generate', staticBuild, 'generate', (port) => ['npx', 'serve', staticBuild.publicDir, '-p', String(port)])
  registerPhase('ssr build', ssrBuild, 'build', () => ['node', ssrBuild.serverEntry])
}
