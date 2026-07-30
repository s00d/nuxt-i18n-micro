/**
 * Node SSR reads payloads from `public/<locales>` relative to the server entry
 * (`_importMeta_.url`), not `process.cwd()`. Starting with cwd `/` catches misses.
 */

import type { ChildProcess } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { setTimeout as delay } from 'node:timers/promises'
import { fileURLToPath } from 'node:url'
import { rm } from 'node:fs/promises'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { getFreePort } from './helpers/port'
import { runCommand, spawnServer, stopChild } from './helpers/subprocess'

const ROOT = join(fileURLToPath(import.meta.url), '..', '..')
const FIXTURE = join(ROOT, 'test/fixtures/basic')
const CONFIG = join(FIXTURE, 'nuxt.config.ts')
const HOST = '127.0.0.1'
const ENTRY = join(FIXTURE, '.output', 'server', 'index.mjs')

async function waitForOk(url: string, tries = 60, ms = 500) {
  async function attempt(index: number): Promise<void> {
    if (index >= tries) throw new Error(`Server did not respond at ${url}`)
    try {
      const response = await fetch(url)
      if (response.ok) return
    } catch {
      /* not ready */
    }
    await delay(ms)
    return attempt(index + 1)
  }
  await attempt(0)
}

describe('i18n public payload ignores process.cwd()', () => {
  let port: number
  let server: ChildProcess | null = null
  let originalConfig = ''

  const stop = async () => {
    await stopChild(server)
    server = null
  }

  beforeAll(async () => {
    port = await getFreePort()
    await stop()
    await rm(join(FIXTURE, '.nuxt'), { recursive: true, force: true })
    await rm(join(FIXTURE, '.output'), { recursive: true, force: true })

    originalConfig = readFileSync(CONFIG, 'utf8')
    writeFileSync(CONFIG, originalConfig.replace(/i18n: \{/, `i18n: {\n    translationPayloads: { prerenderRoutes: false },`))

    try {
      await runCommand('npx', ['nuxi', 'build'], { cwd: FIXTURE, timeoutMs: 300_000 })
    } catch (err) {
      writeFileSync(CONFIG, originalConfig)
      throw err
    }
    writeFileSync(CONFIG, originalConfig)

    server = spawnServer(process.execPath, [ENTRY], {
      cwd: '/',
      env: { PORT: String(port), HOST, NITRO_PORT: String(port), NITRO_HOST: HOST },
    })
    await waitForOk(`http://${HOST}:${port}/_locales/index/en/data.json`)
  }, 300_000)

  afterAll(async () => {
    await stop()
    if (originalConfig) writeFileSync(CONFIG, originalConfig)
  })

  it('serves non-empty /_locales payload when server cwd is /', async () => {
    const res = await fetch(`http://${HOST}:${port}/_locales/index/en/data.json`)
    expect(res.status).toBe(200)
    const data = (await res.json()) as Record<string, unknown>
    expect(Object.keys(data).length).toBeGreaterThan(0)
    expect(data).toMatchObject({ basic: 'basic text' })
  })
})
