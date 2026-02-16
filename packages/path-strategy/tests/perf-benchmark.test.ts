/**
 * Performance benchmark tests for path utilities and strategies.
 *
 * - Results are saved to tests/__perf__/baseline.json after each run.
 * - On subsequent runs the current results are compared against the saved baseline.
 * - If any metric drops by more than REGRESSION_THRESHOLD (default 15 %),
 *   the test emits a console.warn AND the individual test fails.
 * - To reset the baseline (e.g. after intentional changes), delete the file
 *   or run with env: PERF_UPDATE_BASELINE=1
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  buildUrl,
  getCleanPath,
  getParentPath,
  getPathSegments,
  joinUrl,
  lastPathSegment,
  nameKeyFirstSlash,
  nameKeyLastSlash,
  normalizePath,
  normalizePathForCompare,
  parentKeyFromSlashKey,
  transformNameKeyToPath,
} from '../src/path'
import { createPathStrategy } from '../src/strategies/factory'
import type { PathStrategyContext, ResolvedRouteLike } from '../src/types'

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const ITERATIONS = 50_000
const WARMUP = 10_000
const ROUNDS = 9
const REGRESSION_THRESHOLD = 0.15 // 15 % base — adjusted dynamically for ultra-fast functions
const BASELINE_DIR = resolve(__dirname, '__perf__')
const BASELINE_PATH = resolve(BASELINE_DIR, 'baseline.json')
const UPDATE_BASELINE = process.env.PERF_UPDATE_BASELINE === '1'

// ---------------------------------------------------------------------------
// Baseline I/O
// ---------------------------------------------------------------------------
interface BaselineEntry {
  opsPerMs: number
  totalMs: number
}
type Baseline = Record<string, BaselineEntry>

function loadBaseline(): Baseline | null {
  if (!existsSync(BASELINE_PATH)) return null
  try {
    return JSON.parse(readFileSync(BASELINE_PATH, 'utf-8')) as Baseline
  } catch {
    return null
  }
}

function saveBaseline(data: Baseline): void {
  if (!existsSync(BASELINE_DIR)) mkdirSync(BASELINE_DIR, { recursive: true })
  writeFileSync(BASELINE_PATH, `${JSON.stringify(data, null, 2)}\n`)
}

// ---------------------------------------------------------------------------
// Bench helper
// ---------------------------------------------------------------------------
interface BenchResult {
  name: string
  opsPerMs: number
  totalMs: number
}

function bench(name: string, fn: () => void): BenchResult {
  for (let i = 0; i < WARMUP; i++) fn()

  const samples: number[] = []
  for (let r = 0; r < ROUNDS; r++) {
    const start = performance.now()
    for (let i = 0; i < ITERATIONS; i++) fn()
    samples.push(performance.now() - start)
  }

  samples.sort((a, b) => a - b)
  // Use trimmed mean of the best half — stable against system load spikes
  const half = Math.max(1, Math.floor(samples.length / 2))
  let sum = 0
  for (let i = 0; i < half; i++) sum += samples[i]!
  const bestHalfMean = sum / half
  return { name, opsPerMs: ITERATIONS / bestHalfMean, totalMs: bestHalfMean }
}

// ---------------------------------------------------------------------------
// Regression checker
// ---------------------------------------------------------------------------
const allResults: Baseline = {}
const regressions: string[] = []

function getThreshold(opsPerMs: number): number {
  // Ultra-fast functions (>10k ops/ms) have high relative variance from system noise
  if (opsPerMs > 10_000) return 0.3
  if (opsPerMs > 5_000) return 0.25
  return REGRESSION_THRESHOLD
}

function checkRegression(result: BenchResult, baseline: Baseline | null): void {
  allResults[result.name] = { opsPerMs: result.opsPerMs, totalMs: result.totalMs }

  if (!baseline || !baseline[result.name]) return
  const prev = baseline[result.name]!
  const ratio = result.opsPerMs / prev.opsPerMs
  const dropPct = (1 - ratio) * 100
  const threshold = getThreshold(prev.opsPerMs)

  if (ratio < 1 - threshold) {
    const msg = `⚠ REGRESSION: "${result.name}" — ${result.opsPerMs.toFixed(1)} ops/ms vs baseline ${prev.opsPerMs.toFixed(1)} ops/ms (−${dropPct.toFixed(1)}%)`
    regressions.push(msg)
    console.warn(msg)
  }
}

// ---------------------------------------------------------------------------
// Report printer (single console.log to avoid jest line-by-line annotations)
// ---------------------------------------------------------------------------
function pad(s: string, w: number): string {
  return s.length >= w ? s.slice(0, w) : s + ' '.repeat(w - s.length)
}

function padL(s: string, w: number): string {
  return s.length >= w ? s.slice(0, w) : ' '.repeat(w - s.length) + s
}

function row(inner: string, W: number): string {
  return `\u2551 ${pad(inner, W - 4)} \u2551`
}

function printReport(title: string, results: BenchResult[], baseline: Baseline | null): void {
  const hasBaseline = baseline !== null
  const lines: string[] = []

  const maxName = results.reduce((m, r) => Math.max(m, r.name.length), 8)
  const NW = maxName + 2
  const CW = 10
  const W = NW + CW * 3 + 3 + 4

  lines.push('')
  lines.push(`\u2554${'\u2550'.repeat(W - 2)}\u2557`)
  lines.push(row(title, W))
  lines.push(`\u2560${'\u2550'.repeat(W - 2)}\u2563`)

  if (hasBaseline) {
    lines.push(row(`${pad('Function', NW)}${padL('ops/ms', CW)}${padL('prev', CW)}${padL('delta', CW)}   `, W))
  } else {
    lines.push(row(`${pad('Function', NW)}${padL('ops/ms', CW)}${padL('ms', CW)}${' '.repeat(CW + 3)}`, W))
  }
  lines.push(`\u2551${'\u2500'.repeat(W - 2)}\u2551`)

  for (const r of results) {
    const prev = baseline?.[r.name]
    if (hasBaseline && prev) {
      const pct = (r.opsPerMs / prev.opsPerMs - 1) * 100
      const sign = pct >= 0 ? '+' : ''
      const threshold = getThreshold(prev.opsPerMs)
      const flag = pct < -threshold * 100 ? '!!' : pct > 10 ? '^^' : '  '
      const delta = `${sign}${pct.toFixed(1)}%`
      lines.push(row(`${pad(r.name, NW)}${padL(r.opsPerMs.toFixed(1), CW)}${padL(prev.opsPerMs.toFixed(1), CW)}${padL(delta, CW)} ${flag}`, W))
    } else {
      lines.push(row(`${pad(r.name, NW)}${padL(r.opsPerMs.toFixed(1), CW)}${padL(r.totalMs.toFixed(2), CW)}${' '.repeat(CW + 3)}`, W))
    }
  }

  lines.push(`\u255A${'\u2550'.repeat(W - 2)}\u255D`)
  if (hasBaseline) {
    lines.push(`  !! = regression (>15-30% drop, adaptive)  ^^ = improvement (>10% gain)`)
  }
  console.log(lines.join('\n'))
}

// ---------------------------------------------------------------------------
// Load baseline once
// ---------------------------------------------------------------------------
const baseline: Baseline | null = UPDATE_BASELINE ? null : loadBaseline()

// ---------------------------------------------------------------------------
// Path utilities benchmarks
// ---------------------------------------------------------------------------
describe('Performance: path utilities', () => {
  const results: BenchResult[] = []

  afterAll(() => printReport('Path Utilities Performance', results, baseline))

  const cases: [string, () => void][] = [
    [
      'normalizePath',
      () => {
        normalizePath('//foo///bar/')
        normalizePath('/simple')
        normalizePath('')
        normalizePath('/')
      },
    ],
    [
      'normalizePathForCompare',
      () => {
        normalizePathForCompare('/foo/bar/')
        normalizePathForCompare('/')
        normalizePathForCompare('')
      },
    ],
    [
      'joinUrl',
      () => {
        joinUrl('/en', '/about')
        joinUrl('/', 'de', 'contact')
        joinUrl('https://example.com', '/path')
      },
    ],
    [
      'getCleanPath',
      () => {
        getCleanPath('/news?id=1#top')
        getCleanPath('/simple')
        getCleanPath(null)
      },
    ],
    [
      'buildUrl',
      () => {
        buildUrl('/path', { q: 'search', page: '2' }, '#section')
        buildUrl('/simple')
        buildUrl('/test', { arr: ['a', 'b'] })
      },
    ],
    [
      'getPathSegments',
      () => {
        getPathSegments('/a/b/c/d')
        getPathSegments('foo-bar')
        getPathSegments('/')
      },
    ],
    [
      'getParentPath',
      () => {
        getParentPath('/a/b/c')
        getParentPath('/a')
        getParentPath('/')
      },
    ],
    [
      'transformNameKeyToPath',
      () => {
        transformNameKeyToPath('activity-skiing-locale')
        transformNameKeyToPath('simple')
        transformNameKeyToPath('')
      },
    ],
    [
      'nameKeyFirstSlash',
      () => {
        nameKeyFirstSlash('activity-locale-hiking')
        nameKeyFirstSlash('single')
      },
    ],
    [
      'nameKeyLastSlash',
      () => {
        nameKeyLastSlash('activity-locale-hiking')
        nameKeyLastSlash('single')
      },
    ],
    [
      'lastPathSegment',
      () => {
        lastPathSegment('/change-activity/hiking')
        lastPathSegment('/')
      },
    ],
    [
      'parentKeyFromSlashKey',
      () => {
        parentKeyFromSlashKey('activity-locale/hiking')
        parentKeyFromSlashKey('a/b/c')
      },
    ],
  ]

  for (const [name, fn] of cases) {
    test(name, () => {
      const r = bench(name, fn)
      results.push(r)
      checkRegression(r, baseline)

      const prev = baseline?.[name]
      if (prev) {
        const ratio = r.opsPerMs / prev.opsPerMs
        const threshold = getThreshold(prev.opsPerMs)
        if (ratio <= 1 - threshold) {
          throw new Error(`"${name}" regressed by ${((1 - ratio) * 100).toFixed(1)}% vs baseline (threshold ${(threshold * 100).toFixed(0)}%)`)
        }
      } else {
        expect(r.opsPerMs).toBeGreaterThan(1)
      }
    })
  }
})

// ---------------------------------------------------------------------------
// Strategy benchmarks
// ---------------------------------------------------------------------------
function makeCtx(strategy: string): PathStrategyContext {
  const locales = [
    { code: 'en', iso: 'en-US' },
    { code: 'de', iso: 'de-DE' },
    { code: 'fr', iso: 'fr-FR' },
  ]
  const routes = [
    { name: 'index', path: '/' },
    { name: 'about', path: '/about' },
    { name: 'contact', path: '/contact' },
    { name: 'blog-id', path: '/blog/:id' },
    { name: 'products-category', path: '/products/:category' },
  ]
  const routeMap = new Map(routes.map((r) => [r.name, r]))

  return {
    strategy: strategy as PathStrategyContext['strategy'],
    defaultLocale: 'en',
    locales,
    localeCodes: locales.map((l) => l.code),
    localizedRouteNamePrefix: 'localized-',
    router: {
      resolve: (to: any) => {
        const name = typeof to === 'string' ? to : to?.name
        const route = routeMap.get(name as string)
        return {
          name: route?.name ?? name ?? null,
          path: route?.path ?? (typeof to === 'string' ? to : (to?.path ?? '/')),
          fullPath: route?.path ?? '/',
          params: typeof to === 'object' ? (to?.params ?? {}) : {},
          query: typeof to === 'object' ? (to?.query ?? {}) : {},
          hash: '',
        }
      },
      hasRoute: (name: string) => {
        return routeMap.has(name) || routeMap.has(name.replace(/^localized-/, '').replace(/-(?:en|de|fr)$/, ''))
      },
    },
  }
}

const strategies = ['no_prefix', 'prefix', 'prefix_except_default', 'prefix_and_default'] as const

describe('Performance: strategies', () => {
  const results: BenchResult[] = []

  afterAll(() => printReport('Strategy Performance', results, baseline))

  for (const strategyName of strategies) {
    describe(strategyName, () => {
      const ctx = makeCtx(strategyName)
      const strategy = createPathStrategy(ctx)

      const currentRoute: ResolvedRouteLike = {
        name: 'about',
        path: strategyName === 'no_prefix' ? '/about' : '/en/about',
        fullPath: strategyName === 'no_prefix' ? '/about' : '/en/about',
        params: {},
        query: {},
        hash: '',
      }

      const cases: [string, () => void][] = [
        [
          `${strategyName}: localeRoute(name)`,
          () => {
            strategy.localeRoute('de', { name: 'about' }, currentRoute)
          },
        ],
        [
          `${strategyName}: localeRoute(path)`,
          () => {
            strategy.localeRoute('de', '/contact', currentRoute)
          },
        ],
        [
          `${strategyName}: switchLocaleRoute`,
          () => {
            strategy.switchLocaleRoute('en', 'de', currentRoute, {})
          },
        ],
        [
          `${strategyName}: getRedirect`,
          () => {
            strategy.getRedirect(strategyName === 'no_prefix' ? '/about' : '/en/about', 'en')
          },
        ],
        [
          `${strategyName}: resolveLocaleFromPath`,
          () => {
            strategy.resolveLocaleFromPath(strategyName === 'no_prefix' ? '/about' : '/en/about')
          },
        ],
      ]

      for (const [name, fn] of cases) {
        test(name.split(': ')[1]!, () => {
          const r = bench(name, fn)
          results.push(r)
          checkRegression(r, baseline)

          const prev = baseline?.[name]
          if (prev) {
            const ratio = r.opsPerMs / prev.opsPerMs
            const threshold = getThreshold(prev.opsPerMs)
            if (ratio <= 1 - threshold) {
              throw new Error(`"${name}" regressed by ${((1 - ratio) * 100).toFixed(1)}% vs baseline (threshold ${(threshold * 100).toFixed(0)}%)`)
            }
          } else {
            expect(r.opsPerMs).toBeGreaterThan(0.5)
          }
        })
      }
    })
  }
})

// ---------------------------------------------------------------------------
// Save baseline + final summary (runs after ALL suites)
// ---------------------------------------------------------------------------
afterAll(() => {
  saveBaseline(allResults)

  const summary: string[] = ['']
  if (baseline) {
    summary.push(`  Baseline: ${Object.keys(baseline).length} entries | Threshold: -${REGRESSION_THRESHOLD * 100}%`)
  } else {
    summary.push('  No previous baseline — saved current results as new baseline.')
  }

  if (regressions.length > 0) {
    summary.push(`  ${regressions.length} REGRESSION(S):`)
    for (const msg of regressions) summary.push(`    ${msg}`)
  } else {
    summary.push('  No regressions.')
  }

  summary.push(`  Saved to: ${BASELINE_PATH}`)
  summary.push('')
  console.log(summary.join('\n'))
})
