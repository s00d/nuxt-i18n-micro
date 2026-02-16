/**
 * Headless browser benchmark runner.
 * Starts a Vite dev server, runs benchmarks in Chromium, Firefox, and WebKit,
 * prints results to the terminal, and exits.
 *
 * Usage:
 *   npx tsx bench/run-headless.ts                        # all browsers
 *   npx tsx bench/run-headless.ts --browser=chromium      # single browser
 *   npx tsx bench/run-headless.ts --browser=firefox
 *   npx tsx bench/run-headless.ts --browser=webkit
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { type Browser, type BrowserType, chromium, firefox, webkit } from 'playwright'
import { createServer, type ViteDevServer } from 'vite'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

interface BenchResult {
  name: string
  opsPerMs: number
  totalMs: number
  prevOpsPerMs: number | null
  deltaPct: number | null
  regression: boolean
}

interface BaselineEntry {
  opsPerMs: number
  totalMs: number
}
type Baseline = Record<string, BaselineEntry>

const ALL_BROWSERS = ['chromium', 'firefox', 'webkit'] as const
type BrowserName = (typeof ALL_BROWSERS)[number]

const BROWSER_TYPES: Record<BrowserName, BrowserType> = { chromium, firefox, webkit }
const BASELINE_DIR = resolve(__dirname, '../tests/__perf__')

function baselinePath(browser: string): string {
  return resolve(BASELINE_DIR, `baseline-browser-${browser}.json`)
}

function loadBaseline(browser: string): Baseline | null {
  const p = baselinePath(browser)
  if (!existsSync(p)) return null
  try {
    return JSON.parse(readFileSync(p, 'utf-8')) as Baseline
  } catch {
    return null
  }
}

function saveBaseline(browser: string, results: BenchResult[]): void {
  if (!existsSync(BASELINE_DIR)) mkdirSync(BASELINE_DIR, { recursive: true })
  const data: Baseline = {}
  for (const r of results) {
    const ops = Number.isFinite(r.opsPerMs) ? r.opsPerMs : 999999
    data[r.name] = { opsPerMs: ops, totalMs: r.totalMs }
  }
  writeFileSync(baselinePath(browser), `${JSON.stringify(data, null, 2)}\n`)
}

// ---------------------------------------------------------------------------
// CLI arg parsing
// ---------------------------------------------------------------------------
const browserArg = process.argv.find((a) => a.startsWith('--browser='))
const requestedBrowser = browserArg?.split('=')[1] as BrowserName | undefined

if (requestedBrowser && !ALL_BROWSERS.includes(requestedBrowser)) {
  console.error(`Unknown browser: ${requestedBrowser}. Use: ${ALL_BROWSERS.join(', ')}`)
  process.exit(1)
}

const browsersToRun: BrowserName[] = requestedBrowser ? [requestedBrowser] : [...ALL_BROWSERS]

// ---------------------------------------------------------------------------
// Run benchmarks in a single browser
// ---------------------------------------------------------------------------
async function runForBrowser(name: BrowserName, url: string): Promise<{ results: BenchResult[]; regressionCount: number }> {
  const sep = '='.repeat(60)
  console.log(`\n${sep}`)
  console.log(`  ${name.toUpperCase()}`)
  console.log(`${sep}`)

  let browser: Browser | null = null
  try {
    browser = await BROWSER_TYPES[name].launch({ headless: true })
    const page = await browser.newPage()
    await page.goto(url, { waitUntil: 'networkidle' })

    const results: BenchResult[] = await page.evaluate(() => {
      return new Promise<any[]>((resolve) => {
        const { results: r } = (window as any).runBenchmarks()
        resolve(r)
      })
    })

    printReport(results, name)
    saveBaseline(name, results)
    console.log(`  Baseline saved: ${baselinePath(name)}`)

    const regressions = results.filter((r) => r.regression)
    if (regressions.length > 0) {
      console.log(`  ${regressions.length} REGRESSION(S) detected!`)
    } else {
      console.log(`  No regressions.`)
    }

    return { results, regressionCount: regressions.length }
  } finally {
    await browser?.close()
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  console.log(`\nStarting Vite dev server...`)
  const server: ViteDevServer = await createServer({
    configFile: resolve(__dirname, 'vite.config.ts'),
    server: { port: 0, open: false },
    logLevel: 'silent',
  })
  await server.listen()
  const address = server.httpServer?.address()
  const port = typeof address === 'object' && address ? address.port : 5173
  const url = `http://localhost:${port}/`
  console.log(`Vite ready at ${url}`)
  console.log(`Browsers: ${browsersToRun.join(', ')}`)

  let totalRegressions = 0
  const summaryRows: { browser: string; count: number; regressions: number }[] = []

  try {
    for (const name of browsersToRun) {
      const { results, regressionCount } = await runForBrowser(name, url)
      totalRegressions += regressionCount
      summaryRows.push({ browser: name, count: results.length, regressions: regressionCount })
    }

    if (browsersToRun.length > 1) {
      console.log(`\n${'='.repeat(60)}`)
      console.log('  SUMMARY')
      console.log('='.repeat(60))
      for (const row of summaryRows) {
        const status = row.regressions > 0 ? `${row.regressions} REGRESSIONS` : 'OK'
        console.log(`  ${pad(row.browser, 12)} ${row.count} tests — ${status}`)
      }
      console.log('')
    }

    if (totalRegressions > 0) {
      process.exitCode = 1
    }
  } finally {
    await server.close()
  }
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------
function pad(s: string, w: number): string {
  return s.length >= w ? s.slice(0, w) : s + ' '.repeat(w - s.length)
}
function padL(s: string, w: number): string {
  return s.length >= w ? s.slice(0, w) : ' '.repeat(w - s.length) + s
}

function printReport(results: BenchResult[], browser: string): void {
  const baseline = loadBaseline(browser)
  const pathUtils = results.filter((r) => !r.name.includes(':'))
  const strategies = results.filter((r) => r.name.includes(':'))

  printSection('Path Utilities', pathUtils, baseline)
  printSection('Strategies', strategies, baseline)
}

function printSection(title: string, rows: BenchResult[], baseline: Baseline | null): void {
  const hasBaseline = baseline !== null
  const maxName = rows.reduce((m, r) => Math.max(m, r.name.length), 8)
  const NW = maxName + 2
  const CW = 10
  const W = NW + CW * 3 + 7

  const lines: string[] = []
  lines.push(`\n\u2554${'\u2550'.repeat(W - 2)}\u2557`)
  lines.push(`\u2551 ${pad(title, W - 4)} \u2551`)
  lines.push(`\u2560${'\u2550'.repeat(W - 2)}\u2563`)

  if (hasBaseline) {
    lines.push(`\u2551 ${pad('Function', NW)}${padL('ops/ms', CW)}${padL('prev', CW)}${padL('delta', CW)}    \u2551`)
  } else {
    lines.push(`\u2551 ${pad('Function', NW)}${padL('ops/ms', CW)}${padL('ms', CW)}${' '.repeat(CW + 4)}\u2551`)
  }
  lines.push(`\u2551${'\u2500'.repeat(W - 2)}\u2551`)

  for (const r of rows) {
    const prev = baseline?.[r.name]
    if (hasBaseline && prev && Number.isFinite(prev.opsPerMs) && prev.opsPerMs > 0) {
      const pct = (r.opsPerMs / prev.opsPerMs - 1) * 100
      const sign = pct >= 0 ? '+' : ''
      const flag = r.regression ? '!!' : pct > 10 ? '^^' : '  '
      const delta = `${sign}${pct.toFixed(1)}%`
      lines.push(`\u2551 ${pad(r.name, NW)}${padL(r.opsPerMs.toFixed(1), CW)}${padL(prev.opsPerMs.toFixed(1), CW)}${padL(delta, CW)} ${flag} \u2551`)
    } else {
      lines.push(`\u2551 ${pad(r.name, NW)}${padL(r.opsPerMs.toFixed(1), CW)}${padL(r.totalMs.toFixed(2), CW)}${' '.repeat(CW + 4)}\u2551`)
    }
  }

  lines.push(`\u255A${'\u2550'.repeat(W - 2)}\u255D`)
  console.log(lines.join('\n'))
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
