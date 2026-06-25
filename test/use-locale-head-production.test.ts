/**
 * Issue #233: useLocaleHead imports @i18n-micro/utils subpaths that Nitro may not trace.
 * Verifies production SSR build + node .output/server/index.mjs serves pages without crashing.
 */

import { type ChildProcess, exec as execCb, spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import net from 'node:net'
import { join } from 'node:path'
import { setTimeout as delay } from 'node:timers/promises'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'
import { rimraf } from 'rimraf'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

const ROOT = join(fileURLToPath(import.meta.url), '..', '..')
const FIXTURE = join(ROOT, 'test/fixtures/use-locale-head')
const HOST = '127.0.0.1'

const exec = promisify(execCb)

async function getFreePort(base = 20123, max = 20): Promise<number> {
  async function tryPort(index: number): Promise<number> {
    if (index >= max) throw new Error(`No free port in range ${base}-${base + max}`)

    const port = base + index
    try {
      await new Promise<void>((resolve, reject) => {
        const srv = net.createServer()
        srv.once('error', reject)
        srv.once('listening', () => {
          srv.close((err) => (err ? reject(err) : resolve()))
        })
        srv.listen(port, HOST)
      })
      return port
    } catch {
      return tryPort(index + 1)
    }
  }

  return tryPort(0)
}

async function freePort(port: number) {
  try {
    const { stdout } = await exec(`lsof -ti tcp:${port}`)
    for (const pid of stdout.trim().split('\n').filter(Boolean)) {
      process.kill(Number(pid), 'SIGKILL')
    }
  } catch {
    /* port already free */
  }
}

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
  const env: NodeJS.ProcessEnv = {
    ...process.env,
    NODE_ENV: 'production',
  }
  delete env.VITEST
  delete env.VITE_TEST_BUILD
  delete env.TEST
  delete env.JEST

  return new Promise((resolve, reject) => {
    const child = spawn('npx', ['nuxi', 'build', FIXTURE], {
      cwd: ROOT,
      stdio: 'inherit',
      env,
    })
    child.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`nuxi build exited with code ${code}`))))
  })
}

function serveProduction(port: number): ChildProcess {
  const env: NodeJS.ProcessEnv = {
    ...process.env,
    PORT: String(port),
    HOST,
    NODE_ENV: 'production',
  }
  delete env.VITEST
  delete env.VITE_TEST_BUILD
  delete env.TEST
  delete env.JEST

  return spawn('node', [join(FIXTURE, '.output/server/index.mjs')], {
    cwd: FIXTURE,
    stdio: 'pipe',
    env,
  })
}

describe('useLocaleHead production SSR (#233)', () => {
  let port: number
  let server: ChildProcess | null = null

  const stop = async () => {
    if (server && !server.killed) server.kill()
    server = null
    if (port) await freePort(port)
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

  it('copies @i18n-micro/utils into server output when Nitro externalizes it', () => {
    const utilsDist = join(FIXTURE, '.output/server/node_modules/@i18n-micro/utils/dist/route.mjs')
    const serverBundle = join(FIXTURE, '.output/server/chunks/build/server.mjs')
    const utilsAvailable = existsSync(utilsDist) || existsSync(serverBundle)
    expect(utilsAvailable).toBe(true)
  })

  it('GET /en renders useLocaleHead SEO tags without server crash', async () => {
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
