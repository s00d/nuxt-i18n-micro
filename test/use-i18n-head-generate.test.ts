/**
 * test/use-i18n-head-generate.test.ts
 *
 * 1. Runs `nuxi generate` for the use-i18n-head fixture
 * 2. Verifies prerendered HTML contains expected SEO tags
 * 3. Serves static output and checks navigation, reload, and head tags in a real browser
 */

import { type ChildProcess, exec as execCb, spawn } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import net from 'node:net'
import { join } from 'node:path'
import { setTimeout as delay } from 'node:timers/promises'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'
import { chromium, expect as playwrightExpect } from '@playwright/test'
import { rimraf } from 'rimraf'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { assertI18nHeadScenario, expectHtmlScenario, i18nHeadScenarios, i18nHeadStaticPages, staticHtmlPath } from './helpers/i18n-head-seo'

const exec = promisify(execCb)

const FIXTURES = join(fileURLToPath(import.meta.url), '..', 'fixtures/use-i18n-head')
const OUTPUT_DIR = join(FIXTURES, '.output')
const OUTPUT_PUBLIC = join(OUTPUT_DIR, 'public')
const HOST = '127.0.0.1'

async function getFreePort(base = 24011, max = 20): Promise<number> {
  async function tryPort(index: number): Promise<number> {
    if (index >= max) throw new Error(`No free port in range ${base}-${base + max}`)
    const port = base + index
    try {
      await new Promise<void>((resolve, reject) => {
        const srv = net.createServer()
        srv.once('error', reject)
        srv.once('listening', () => srv.close((err) => (err ? reject(err) : resolve())))
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

function runGenerate(): Promise<void> {
  const env: NodeJS.ProcessEnv = {
    ...process.env,
    NODE_ENV: 'production',
  }
  delete env.VITEST
  delete env.TEST

  return new Promise((resolve, reject) => {
    const child = spawn('npx', ['nuxi', 'generate'], {
      cwd: FIXTURES,
      stdio: 'inherit',
      env,
    })
    child.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`nuxi generate exited with code ${code}`))))
  })
}

function serveStatic(port: number): ChildProcess {
  const env: NodeJS.ProcessEnv = {
    ...process.env,
    NODE_ENV: 'production',
  }
  delete env.VITEST
  delete env.TEST

  const child = spawn('npx', ['serve', OUTPUT_PUBLIC, '-p', String(port)], {
    cwd: FIXTURES,
    stdio: 'inherit',
    env,
  })
  child.unref()
  return child
}

async function waitForServer(port: number, path = '/') {
  async function attempt(index: number): Promise<void> {
    if (index >= 40) throw new Error(`Server not ready at http://${HOST}:${port}${path}`)
    try {
      const res = await fetch(`http://${HOST}:${port}${path}`)
      if (res.ok) return
    } catch {
      /* retry */
    }
    await delay(500)
    return attempt(index + 1)
  }
  await attempt(0)
}

describe('useI18nHead after nuxi generate', () => {
  let port = 0
  let server: ChildProcess | null = null

  const stopServer = async () => {
    if (server && !server.killed) server.kill()
    server = null
    if (port) await freePort(port)
  }

  beforeAll(async () => {
    await rimraf(OUTPUT_DIR).catch(() => {})
    await rimraf(join(FIXTURES, '.nuxt')).catch(() => {})
    await runGenerate()
    port = await getFreePort()
    server = serveStatic(port)
    await waitForServer(port, '/')
  }, 300_000)

  afterAll(async () => {
    await stopServer()
    await rimraf(OUTPUT_DIR).catch(() => {})
    await rimraf(join(FIXTURES, '.nuxt')).catch(() => {})
    await rimraf(join(FIXTURES, 'node_modules/.cache')).catch(() => {})
  })

  describe('prerendered HTML files', () => {
    it('generates index.html with navigation links', () => {
      const indexPath = staticHtmlPath(OUTPUT_PUBLIC, '/')
      expect(existsSync(indexPath)).toBe(true)
      const html = readFileSync(indexPath, 'utf-8')
      expect(html).toContain('Post (slugs)')
      expect(html).toContain('Canonical override')
      expect(html).toMatch(/<meta[^>]*property="og:title"[^>]*content="Index page"/)
    })

    it.each([...i18nHeadScenarios, ...i18nHeadStaticPages])('prerendered $name has expected SEO tags', (scenario) => {
      const htmlPath = staticHtmlPath(OUTPUT_PUBLIC, scenario.path)
      expect(existsSync(htmlPath), `missing ${htmlPath}`).toBe(true)
      const html = readFileSync(htmlPath, 'utf-8')
      expectHtmlScenario(html, scenario)
    })

    it('generates reactive page shell', () => {
      const htmlPath = staticHtmlPath(OUTPUT_PUBLIC, '/reactive')
      expect(existsSync(htmlPath), `missing ${htmlPath}`).toBe(true)
      const html = readFileSync(htmlPath, 'utf-8')
      expect(html).toContain('Reactive article')
    })
  })

  describe('static site in browser', () => {
    it('navigates via index links, verifies content and SEO, then survives reload', async () => {
      const browser = await chromium.launch()
      const context = await browser.newContext()
      const page = await context.newPage()

      try {
        await page.goto(`http://${HOST}:${port}/`, { waitUntil: 'domcontentloaded' })
        await playwrightExpect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', 'Index page')

        for (const scenario of [...i18nHeadScenarios, ...i18nHeadStaticPages]) {
          await page.goto(`http://${HOST}:${port}/`, { waitUntil: 'domcontentloaded' })
          await page.getByRole('link', { name: scenario.linkLabel }).click()
          await page.waitForURL(`**${scenario.path}`)
          await assertI18nHeadScenario(page, scenario)

          await page.reload({ waitUntil: 'domcontentloaded' })
          await assertI18nHeadScenario(page, scenario)
        }
      } finally {
        await context.close()
        await browser.close()
      }
    }, 120_000)

    it('direct visit + hard reload keeps article SEO on post page', async () => {
      const browser = await chromium.launch()
      const page = await browser.newPage()

      try {
        const scenario = i18nHeadScenarios[0]!
        await page.goto(`http://${HOST}:${port}${scenario.path}`, { waitUntil: 'domcontentloaded' })
        await assertI18nHeadScenario(page, scenario)

        await page.reload({ waitUntil: 'networkidle' })
        await assertI18nHeadScenario(page, scenario)
        await playwrightExpect(page.getByTestId('post-title')).toHaveText('Hello post')
      } finally {
        await browser.close()
      }
    })
  })

  describe('SSR production server', () => {
    let ssrPort = 0
    let ssrServer: ChildProcess | null = null

    const stopSsr = async () => {
      if (ssrServer && !ssrServer.killed) ssrServer.kill()
      ssrServer = null
      if (ssrPort) await freePort(ssrPort)
    }

    beforeAll(async () => {
      await stopServer()
      await rimraf(OUTPUT_DIR).catch(() => {})
      await rimraf(join(FIXTURES, '.nuxt')).catch(() => {})

      await new Promise<void>((resolve, reject) => {
        const child = spawn('npx', ['nuxi', 'build'], {
          cwd: FIXTURES,
          stdio: 'inherit',
          env: { ...process.env, NODE_ENV: 'production' },
        })
        child.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`nuxi build exited with code ${code}`))))
      })

      ssrPort = await getFreePort(24111)
      ssrServer = spawn('node', [join(OUTPUT_DIR, 'server/index.mjs')], {
        cwd: FIXTURES,
        stdio: 'inherit',
        env: { ...process.env, PORT: String(ssrPort), NODE_ENV: 'production' },
      })
      ssrServer.unref()
      await waitForServer(ssrPort, '/reactive')
    }, 300_000)

    afterAll(stopSsr)

    it('client-loaded reactive page updates head after fetch and reload', async () => {
      const browser = await chromium.launch()
      const page = await browser.newPage()

      try {
        await page.goto(`http://${HOST}:${ssrPort}/reactive`, { waitUntil: 'domcontentloaded' })
        await playwrightExpect(page.getByTestId('article-title')).toHaveText('Client-loaded article', { timeout: 10000 })
        await playwrightExpect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', 'Client-loaded article')
        await playwrightExpect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute(
          'href',
          'https://example.com/articles/reactive-en',
        )

        await page.reload({ waitUntil: 'domcontentloaded' })
        await playwrightExpect(page.getByTestId('article-title')).toHaveText('Client-loaded article', { timeout: 10000 })
        await playwrightExpect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', 'Client-loaded article')
      } finally {
        await browser.close()
      }
    }, 60_000)
  })
})
