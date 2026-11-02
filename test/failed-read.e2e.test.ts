/**
 * A dictionary host that fails, then recovers, in front of a real build: the page must stay what it was, and nothing
 * may keep it. The file names of a host are `_locales/<page>/<locale>/data.json`.
 */

import type { ChildProcess } from 'node:child_process'
import { createServer, type Server } from 'node:http'
import { join } from 'node:path'
import { setTimeout as delay } from 'node:timers/promises'
import { chromium, expect as playwrightExpect } from '@playwright/test'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { getFreePort } from './helpers/port'
import { runCommand, spawnServer, stopChild } from './helpers/subprocess'
import { tmpFixture } from './helpers/tmp-fixture'

const FIXTURE = tmpFixture('failed-read')
const HOST = '127.0.0.1'
const MARK = 'x-i18n-failed-read'

/** Files the host fails on, by page; `reads` ends it after that many reads, and `slow` keeps them waiting. */
const failing = new Map<string, { reads?: number; slow?: boolean }>()
const PAGE = JSON.stringify({ hello: 'Real text' })
const ROOT = JSON.stringify({ root: 'Root text' })

describe('a dictionary that cannot be read', () => {
  let host: Server
  let server: ChildProcess
  let url: string

  beforeAll(async () => {
    const hostPort = await getFreePort()
    host = createServer(async (req, res) => {
      res.setHeader('Access-Control-Allow-Origin', '*')
      const name = new URL(req.url ?? '/', 'http://host').pathname.split('/')[2] ?? ''
      const failure = failing.get(name)
      if (failure?.reads && --failure.reads === 0) failing.delete(name)
      if (failure?.slow) await delay(300)
      if (failure) res.writeHead(500).end('down')
      else if (name === 'no-file') res.writeHead(404).end('no such file')
      else res.writeHead(200, { 'Content-Type': 'application/json' }).end(name === '__root' ? ROOT : PAGE)
    }).listen(hostPort, HOST)

    await runCommand('npx', ['nuxi', 'build'], { cwd: FIXTURE, env: { FAILED_READ_HOST: `http://${HOST}:${hostPort}` } })

    const port = await getFreePort()
    url = `http://${HOST}:${port}`
    server = spawnServer(process.execPath, [join(FIXTURE, '.output', 'server', 'index.mjs')], {
      cwd: FIXTURE,
      env: { PORT: String(port), HOST, NITRO_PORT: String(port), NITRO_HOST: HOST },
    })
    for (let tries = 0; tries < 60; tries++) {
      if (await fetch(`${url}/plain`).catch(() => null)) return
      await delay(500)
    }
    throw new Error(`Server did not respond at ${url}`)
  })

  afterAll(async () => {
    await stopChild(server)
    host?.close()
  })

  for (const route of ['swr', 'cached']) {
    it(`/${route}: 503 with the same HTML, and nothing of it is served once the host is back`, async () => {
      failing.set(route, {})
      const failed = await fetch(`${url}/${route}`)
      expect(failed.status).toBe(503)
      expect(failed.headers.get('cache-control')).toBe('no-store')
      expect(failed.headers.get('netlify-cdn-cache-control')).toBe('no-store')
      expect(failed.headers.get('retry-after')).toBe('60')
      expect(failed.headers.get(MARK)).toBeNull()
      expect(await failed.text()).toContain('<p id="text">hello</p>')

      failing.delete(route)
      const next = await fetch(`${url}/${route}`)
      expect(next.status).toBe(200)
      expect(next.headers.get('cache-control')).toContain('age=60')
      expect(await next.text()).toContain('<p id="text">Real text</p>')
    })
  }

  it('requests that wait on one render in the route cache get the same headers', async () => {
    failing.set('burst', { slow: true })
    const answers = await Promise.all([1, 2, 3].map(() => fetch(`${url}/burst`)))
    failing.delete('burst')
    expect(answers.map((answer) => answer.status)).toEqual([503, 503, 503])
    expect(answers.map((answer) => answer.headers.get('cache-control'))).toEqual(['no-store', 'no-store', 'no-store'])
  })

  it('a kept page stays while the host is down: a failed revalidation stores nothing', async () => {
    expect((await fetch(`${url}/swr-kept`)).status).toBe(200)
    await delay(1500)
    failing.set('swr-kept', {})
    const stale = await fetch(`${url}/swr-kept`)
    expect(stale.status).toBe(200)
    expect(await stale.text()).toContain('<p id="text">Real text</p>')
    await delay(300)
    expect(await (await fetch(`${url}/swr-kept`)).text()).toContain('<p id="text">Real text</p>')
    failing.delete('swr-kept')
  })

  it('a healthy page has no header of this, and a page with no file shows the root with a 200', async () => {
    const healthy = await fetch(`${url}/plain`)
    expect(healthy.status).toBe(200)
    for (const header of ['cache-control', 'retry-after', MARK]) expect(healthy.headers.get(header)).toBeNull()
    expect(await healthy.text()).toContain('<p id="text">Real text</p>')

    const noFile = await fetch(`${url}/no-file`)
    expect(noFile.status).toBe(200)
    expect(noFile.headers.get('cache-control')).toBeNull()
    expect(await noFile.text()).toContain('<p id="root">Root text</p>')
  })

  it('a 503 document hydrates, and the browser reads the dictionary from the host that came back', async () => {
    const browser = await chromium.launch()
    try {
      const tab = await browser.newPage()
      const errors: string[] = []
      tab.on('pageerror', (error) => errors.push(error.message))
      // the render's read and its one retry: the browser's own fetch finds the host back
      failing.set('hydrate', { reads: 2 })
      const document = await tab.goto(`${url}/hydrate`)
      expect(document?.status()).toBe(503)
      await playwrightExpect(tab.locator('#text')).toHaveText('Real text')
      // alive: a page that failed to hydrate would not count
      await tab.locator('#count').click()
      await playwrightExpect(tab.locator('#count')).toHaveText('1')
      // Vue logs the mismatch of raw keys and real text and patches it, as for any page that shows other text on the client
      expect(errors).toEqual([])
    } finally {
      await browser.close()
    }
  })
})
