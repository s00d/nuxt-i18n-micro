/**
 * Issue #233: useLocaleHead imports @i18n-micro/utils subpaths that Nitro may not trace.
 * Verifies production SSR build + node .output/server/index.mjs serves pages without crashing.
 */

import type { ChildProcess } from 'node:child_process'
import { join } from 'node:path'
import { setTimeout as delay } from 'node:timers/promises'
import { fileURLToPath } from 'node:url'
import { rimraf } from 'rimraf'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { getFreePort } from './helpers/port'
import { runCommand, spawnServer, stopChild } from './helpers/subprocess'

const ROOT = join(fileURLToPath(import.meta.url), '..', '..')
const FIXTURE = join(ROOT, 'test/fixtures/use-locale-head')
const HOST = '127.0.0.1'

async function waitForOk(url: string, tries = 40, ms = 500) {
  async function attempt(index: number): Promise<void> {
    if (index >= tries) throw new Error(`Server did not respond at ${url}`)

    try {
      const response = await fetch(url)
      if (response.ok) return
    } catch {
      /* server not ready */
    }
    await delay(ms)
    return attempt(index + 1)
  }

  await attempt(0)
}

function runNuxiBuild(): Promise<void> {
  return runCommand('npx', ['nuxi', 'build', FIXTURE], { cwd: ROOT })
}

function serveProduction(port: number): ChildProcess {
  return spawnServer('node', [join(FIXTURE, '.output/server/index.mjs')], {
    cwd: FIXTURE,
    env: { PORT: String(port), HOST },
  })
}

describe('useLocaleHead production SSR (#233)', () => {
  let port: number
  let server: ChildProcess | null = null

  const stop = async () => {
    // stopChild kills the whole process group, so the port is released with it.
    await stopChild(server)
    server = null
  }

  beforeAll(async () => {
    port = await getFreePort()
    await stop()
    await rimraf(join(FIXTURE, '.nuxt'))
    await rimraf(join(FIXTURE, '.output'))
    await runNuxiBuild()

    server = serveProduction(port)
    await waitForOk(`http://${HOST}:${port}/en`)
  }, 300_000)

  afterAll(stop)

  it('production SSR serves pages without module resolution errors', async () => {
    const res = await fetch(`http://${HOST}:${port}/en`)
    expect(res.status).toBe(200)

    const html = await res.text()
    expect(html).toContain('useLocaleHead manual usage')
    expect(html).toContain('property="og:locale"')
    expect(html).toContain('content="en_US"')
    expect(html).toContain('rel="canonical"')
    expect(html).not.toContain('Cannot find module')
  })
})
