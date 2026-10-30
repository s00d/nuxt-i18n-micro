/**
 * useI18nHead on a static site: `nuxi generate` of the use-i18n-head fixture, then the prerendered
 * HTML and the served site in a browser. The same scenarios on a server build (SSR head, SPA
 * navigation, the client-fetched /reactive page) are the journey test/journeys/page-head-use-i18n-head.spec.ts.
 */

import type { ChildProcess } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { setTimeout as delay } from 'node:timers/promises'
import { stripVTControlCharacters } from 'node:util'
import { rm } from 'node:fs/promises'
import { chromium, expect as playwrightExpect } from '@playwright/test'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import { assertI18nHeadScenario, expectHtmlScenario, i18nHeadScenarios, i18nHeadStaticPages, staticHtmlPath } from './helpers/i18n-head-seo'
import { isolatedBuild } from './helpers/isolated-build'
import { getFreePort } from './helpers/port'
import { runCommand, spawnServer, stopChild } from './helpers/subprocess'

const build = isolatedBuild('use-i18n-head', 'use-i18n-head-generate')
const FIXTURES = build.fixtureDir
const OUTPUT_DIR = build.outputDir
const OUTPUT_PUBLIC = build.publicDir
const HOST = '127.0.0.1'

function runGenerate(): Promise<string> {
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
  let generateLog = ''

  const stopServer = async () => {
    // stopChild kills the whole process group, so the port is released with it.
    await stopChild(server)
    server = null
  }

  beforeAll(async () => {
    await rm(build.buildDir, { recursive: true, force: true }).catch(() => {})
    generateLog = stripVTControlCharacters(await runGenerate())
    port = await getFreePort()
    server = serveStatic(port)
    await waitForServer(port, '/')
  }, 300_000)

  afterAll(async () => {
    await stopServer()
    await rm(build.buildDir, { recursive: true, force: true }).catch(() => {})
  })

  test('prerendered HTML carries every scenario head', () => {
    // step 1: index with the scenario links and its own og:title
    const index = readFileSync(staticHtmlPath(OUTPUT_PUBLIC, '/'), 'utf-8')
    expect(index).toContain('Post (slugs)')
    expect(index).toContain('Canonical override')
    expect(index).toMatch(/<meta[^>]*property="og:title"[^>]*content="Index page"/)

    // step 2: each scenario page is prerendered with its SEO tags; /reactive as a shell
    for (const scenario of [...i18nHeadScenarios, ...i18nHeadStaticPages]) {
      const htmlPath = staticHtmlPath(OUTPUT_PUBLIC, scenario.path)
      expect(existsSync(htmlPath)).toBe(true)
      expectHtmlScenario(readFileSync(htmlPath, 'utf-8'), scenario)
    }
    expect(readFileSync(staticHtmlPath(OUTPUT_PUBLIC, '/reactive'), 'utf-8')).toContain('Reactive article')
  })

  test('route rules are localized once: prerendered and SPA pages in every locale', () => {
    // step 1: the prerender rule reaches fr as /fr/prerendered, never /fr/fr (#218)
    // was: generate-issue-218 › builds without /fr/fr prerender errors (it only checked the log)
    expect(generateLog).toMatch(/├─ \/fr\/prerendered /)
    expect(generateLog).not.toContain('/fr/fr')
    expect(readFileSync(staticHtmlPath(OUTPUT_PUBLIC, '/prerendered'), 'utf-8')).toContain('Prerendered page')
    expect(readFileSync(staticHtmlPath(OUTPUT_PUBLIC, '/fr/prerendered'), 'utf-8')).toContain('Page prérendue')
    expect(existsSync(join(OUTPUT_PUBLIC, 'fr', 'fr'))).toBe(false)

    // step 2: the ssr:false rule is localized too: /spa and /fr/spa are SPA shells
    // was: async-components-production › the ssr:false pages are SPA shells in every locale
    for (const path of ['/spa', '/fr/spa']) {
      const html = readFileSync(staticHtmlPath(OUTPUT_PUBLIC, path), 'utf-8')
      expect(html).toContain('<div id="__nuxt"></div>')
      expect(html).toContain('data-ssr="false"')
    }
  })

  test('static site in a browser: index links, reload, direct visit', { timeout: 120_000 }, async () => {
    const browser = await chromium.launch()
    const page = await browser.newPage()
    try {
      // step 1: index head
      await page.goto(`http://${HOST}:${port}/`, { waitUntil: 'domcontentloaded' })
      await playwrightExpect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', 'Index page')

      // step 2: each scenario through its index link, then a reload of the static file
      for (const scenario of [...i18nHeadScenarios, ...i18nHeadStaticPages]) {
        await page.goto(`http://${HOST}:${port}/`, { waitUntil: 'domcontentloaded' })
        await page.getByRole('link', { name: scenario.linkLabel }).click()
        await page.waitForURL(`**${scenario.path}`)
        await assertI18nHeadScenario(page, scenario)
        await page.reload({ waitUntil: 'domcontentloaded' })
        await assertI18nHeadScenario(page, scenario)
      }

      // step 3: direct visit of the post + hard reload keeps the article head and content
      const post = i18nHeadScenarios[0]!
      await page.goto(`http://${HOST}:${port}${post.path}`, { waitUntil: 'domcontentloaded' })
      await assertI18nHeadScenario(page, post)
      await page.reload({ waitUntil: 'networkidle' })
      await assertI18nHeadScenario(page, post)
      await playwrightExpect(page.getByTestId('post-title')).toHaveText('Hello post')
    } finally {
      await browser.close()
    }
  })
})
