/**
 * `cacheStorage` on a real build: two server processes of one build on one Nitro `fs` mount,
 * through the real unstorage driver. No Redis needed.
 */

import type { ChildProcess } from 'node:child_process'
import { mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { setTimeout as delay } from 'node:timers/promises'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { getFreePort } from './helpers/port'
import { runCommand, spawnServer, stopChild } from './helpers/subprocess'
import { tmpFixture } from './helpers/tmp-fixture'

const FIXTURE = tmpFixture('basic', 'shared-cache')
const HOST = '127.0.0.1'
const ENTRY = join(FIXTURE, '.output', 'server', 'index.mjs')
const STORAGE = mkdtempSync(join(tmpdir(), 'i18n-shared-cache-'))
const servers: ChildProcess[] = []

async function start(): Promise<string> {
  const port = await getFreePort()
  const url = `http://${HOST}:${port}`
  const server = spawnServer(process.execPath, [ENTRY], {
    cwd: FIXTURE,
    env: { PORT: String(port), HOST, NITRO_PORT: String(port), NITRO_HOST: HOST },
  })
  servers.push(server)
  for (let tries = 0; tries < 60; tries++) {
    const up = await fetch(`${url}/_locales/__root/ru/data.json`).catch(() => null)
    if (up?.ok) return url
    await delay(500)
  }
  throw new Error(`Server did not respond at ${url}`)
}

const keys = () => readdirSync(STORAGE, { recursive: true, withFileTypes: true }).filter((entry) => entry.isFile())
const keyFile = (locale: string, page: string) => {
  const found = keys().find((entry) => entry.parentPath.endsWith(`/${locale}`) && entry.name === page)
  if (!found) throw new Error(`no stored ${locale}:${page}`)
  return join(found.parentPath, found.name)
}
// a page render uses the server loader; `/_locales` of an existing page is a static file
const render = async (url: string, locale: string) => (await fetch(`${url}/${locale === 'en' ? '' : locale}`)).text()

describe('cacheStorage on one fs mount', () => {
  let first: string

  beforeAll(async () => {
    await runCommand('npx', ['nuxi', 'build'], { cwd: FIXTURE, env: { PRERENDER_PAYLOADS: '0', CACHE_STORAGE_DIR: STORAGE }, timeoutMs: 300_000 })
    first = await start()
  }, 300_000)

  afterAll(async () => {
    await Promise.all(servers.map((server) => stopChild(server)))
    rmSync(STORAGE, { recursive: true, force: true })
  })

  it('an instance stores what it read, as JSON text', async () => {
    await render(first, 'en')
    expect(JSON.parse(readFileSync(keyFile('en', 'index'), 'utf8'))).toMatchObject({ key0: 'en' })
  })

  it('another instance reads the stored copy, not the source', async () => {
    await render(first, 'de')
    writeFileSync(keyFile('de', 'index'), '{"key0":"from the shared layer"}')
    const second = await start()
    expect(await render(second, 'de')).toContain('from the shared layer')
  })

  it('a corrupt value is a miss, and the source repairs it', async () => {
    await render(first, 'ru')
    const file = keyFile('ru', 'index')
    const stored = readFileSync(file, 'utf8')
    writeFileSync(file, '{"key0":')
    const third = await start()
    expect(await render(third, 'ru')).toContain(JSON.parse(stored).key0)
    expect(readFileSync(file, 'utf8')).toBe(stored)
  })

  it('made-up page names add no keys', async () => {
    await fetch(`${first}/_locales/no-such-page-0/en/data.json`)
    const before = keys().length
    await fetch(`${first}/_locales/no-such-page-1/en/data.json`)
    await fetch(`${first}/_locales/no-such-page-2/en/data.json`)
    expect(keys().length).toBe(before)
  })
})
