/**
 * Browser-based performance benchmark for path-strategy.
 * Runs the same suite as the Node.js perf-benchmark.test.ts but in a real browser engine.
 * Results are displayed on the page and saved to localStorage for baseline comparison.
 */
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
const REGRESSION_THRESHOLD = 0.15
const BASELINE_KEY = 'path-strategy-perf-baseline'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface BaselineEntry {
  opsPerMs: number
  totalMs: number
}
type Baseline = Record<string, BaselineEntry>

export interface BenchResult {
  name: string
  opsPerMs: number
  totalMs: number
  prevOpsPerMs: number | null
  deltaPct: number | null
  regression: boolean
}

// ---------------------------------------------------------------------------
// Baseline (localStorage)
// ---------------------------------------------------------------------------
function loadBaseline(): Baseline | null {
  try {
    const raw = localStorage.getItem(BASELINE_KEY)
    return raw ? (JSON.parse(raw) as Baseline) : null
  } catch {
    return null
  }
}

function saveBaseline(data: Baseline): void {
  const safe: Baseline = {}
  for (const [k, v] of Object.entries(data)) {
    safe[k] = { opsPerMs: Number.isFinite(v.opsPerMs) ? v.opsPerMs : 999999, totalMs: v.totalMs }
  }
  localStorage.setItem(BASELINE_KEY, JSON.stringify(safe))
}

// ---------------------------------------------------------------------------
// Bench helper
// ---------------------------------------------------------------------------
function bench(_name: string, fn: () => void): { opsPerMs: number; totalMs: number } {
  for (let i = 0; i < WARMUP; i++) fn()

  const samples: number[] = []
  for (let r = 0; r < ROUNDS; r++) {
    const start = performance.now()
    for (let i = 0; i < ITERATIONS; i++) fn()
    samples.push(performance.now() - start)
  }

  samples.sort((a, b) => a - b)
  const half = Math.max(1, Math.floor(samples.length / 2))
  let sum = 0
  for (let i = 0; i < half; i++) sum += samples[i]!
  const bestHalfMean = sum / half
  return { opsPerMs: ITERATIONS / bestHalfMean, totalMs: bestHalfMean }
}

function getThreshold(opsPerMs: number): number {
  if (opsPerMs > 10_000) return 0.3
  if (opsPerMs > 5_000) return 0.25
  return REGRESSION_THRESHOLD
}

// ---------------------------------------------------------------------------
// Strategy context factory
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
      hasRoute: (name: string) => routeMap.has(name) || routeMap.has(name.replace(/^localized-/, '').replace(/-(?:en|de|fr)$/, '')),
    },
  }
}

// ---------------------------------------------------------------------------
// Test suites
// ---------------------------------------------------------------------------
interface BenchSuite {
  title: string
  cases: [string, () => void][]
}

function buildPathUtilsSuite(): BenchSuite {
  return {
    title: 'Path Utilities',
    cases: [
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
    ],
  }
}

function buildStrategySuite(): BenchSuite {
  const strategies = ['no_prefix', 'prefix', 'prefix_except_default', 'prefix_and_default'] as const
  const cases: [string, () => void][] = []

  for (const strategyName of strategies) {
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

    cases.push([
      `${strategyName}: localeRoute(name)`,
      () => {
        strategy.localeRoute('de', { name: 'about' }, currentRoute)
      },
    ])
    cases.push([
      `${strategyName}: localeRoute(path)`,
      () => {
        strategy.localeRoute('de', '/contact', currentRoute)
      },
    ])
    cases.push([
      `${strategyName}: switchLocaleRoute`,
      () => {
        strategy.switchLocaleRoute('en', 'de', currentRoute, {})
      },
    ])
    cases.push([
      `${strategyName}: getRedirect`,
      () => {
        strategy.getRedirect(strategyName === 'no_prefix' ? '/about' : '/en/about', 'en')
      },
    ])
    cases.push([
      `${strategyName}: resolveLocaleFromPath`,
      () => {
        strategy.resolveLocaleFromPath(strategyName === 'no_prefix' ? '/about' : '/en/about')
      },
    ])
  }

  return { title: 'Strategies', cases }
}

// ---------------------------------------------------------------------------
// Runner
// ---------------------------------------------------------------------------
export interface RunProgress {
  total: number
  current: number
  name: string
}

export type OnProgress = (p: RunProgress) => void

export function runBenchmarks(onProgress?: OnProgress): { results: BenchResult[]; baseline: Baseline | null; newBaseline: Baseline } {
  const baseline = loadBaseline()
  const newBaseline: Baseline = {}
  const results: BenchResult[] = []
  const suites = [buildPathUtilsSuite(), buildStrategySuite()]

  let totalCases = 0
  for (const s of suites) totalCases += s.cases.length
  let idx = 0

  for (const suite of suites) {
    for (const [name, fn] of suite.cases) {
      onProgress?.({ total: totalCases, current: idx, name })
      const r = bench(name, fn)
      newBaseline[name] = { opsPerMs: r.opsPerMs, totalMs: r.totalMs }

      const prev = baseline?.[name]
      let deltaPct: number | null = null
      let regression = false
      if (prev) {
        const ratio = r.opsPerMs / prev.opsPerMs
        deltaPct = (ratio - 1) * 100
        const threshold = getThreshold(prev.opsPerMs)
        if (ratio < 1 - threshold) regression = true
      }

      results.push({
        name,
        opsPerMs: r.opsPerMs,
        totalMs: r.totalMs,
        prevOpsPerMs: prev?.opsPerMs ?? null,
        deltaPct,
        regression,
      })
      idx++
    }
  }

  saveBaseline(newBaseline)
  return { results, baseline, newBaseline }
}

// ---------------------------------------------------------------------------
// Expose for Playwright / programmatic access
// ---------------------------------------------------------------------------
declare global {
  interface Window {
    __BENCH_RESULTS__?: BenchResult[]
    __BENCH_DONE__?: boolean
    runBenchmarks: typeof runBenchmarks
  }
}
window.runBenchmarks = runBenchmarks
