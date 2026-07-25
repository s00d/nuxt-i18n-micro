/**
 * test/use-i18n-head-generate.test.ts
 *
 * 1. Runs `nuxi generate` for the use-i18n-head fixture
 * 2. Verifies prerendered HTML contains expected SEO tags
 * 3. Serves static output and checks navigation, reload, and head tags in a real browser
 */

import type { ChildProcess } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { setTimeout as delay } from 'node:timers/promises'
import { chromium, expect as playwrightExpect } from '@playwright/test'
import { rimraf } from 'rimraf'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { assertI18nHeadScenario, expectHtmlScenario, i18nHeadScenarios, i18nHeadStaticPages, staticHtmlPath } from './helpers/i18n-head-seo'
import { isolatedBuild } from './helpers/isolated-build'
import { getFreePort } from './helpers/port'
import { runCommand, spawnServer, stopChild } from './helpers/subprocess'

const build = isolatedBuild('use-i18n-head', 'use-i18n-head-generate')
const FIXTURES = build.fixtureDir
const OUTPUT_DIR = build.outputDir
const OUTPUT_PUBLIC = build.publicDir
const HOST = '127.0.0.1'

function runGenerate(): Promise<void> {
  return runCommand('npx', ['nuxi', 'generate'], {
    cwd: FIXTURES,
    env: build.env,
  })
}

function serveStatic(port: number): ChildProcess {
  return spawnServer('npx', ['serve', OUTPUT_PUBLIC, '-p', String(port)], { cwd: FIXTURES })
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
    // stopChild kills the whole process group, so the port is released with it.
    await stopChild(server)
    server = null
  }

  beforeAll(async () => {
    await rimraf(build.buildDir).catch(() => {})
    await runGenerate()
    port = await getFreePort()
    server = serveStatic(port)
    await waitForServer(port, '/')
  }, 300_000)

  afterAll(async () => {
    await stopServer()
    await rimraf(build.buildDir).catch(() => {})
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
      // stopChild kills the whole process group, so the port is released with it.
      await stopChild(ssrServer)
      ssrServer = null
    }

    beforeAll(async () => {
      await stopServer()
      await rimraf(build.buildDir).catch(() => {})

      await runCommand('npx', ['nuxi', 'build'], {
        cwd: FIXTURES,
        env: build.env,
      })

      ssrPort = await getFreePort()
      ssrServer = spawnServer('node', [build.serverEntry], {
        cwd: FIXTURES,
        env: { PORT: String(ssrPort) },
      })
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
