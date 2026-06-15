/**
 * Performance benchmark tests for @i18n-micro/core.
 *
 * - Results saved to tests/__perf__/baseline.json after each run.
 * - Subsequent runs compare against baseline; regressions fail the test.
 * - Reset baseline: delete the file or run with PERF_UPDATE_BASELINE=1
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { Translations } from '@i18n-micro/types'
import { BaseI18n, type BaseI18nOptions } from '../src/base'
import { FormatService } from '../src/format-service'
import {
  defaultPlural,
  getByPath,
  interpolate,
  isNoPrefixStrategy,
  isPrefixAndDefaultStrategy,
  isPrefixExceptDefaultStrategy,
  isPrefixStrategy,
  withPrefixStrategy,
} from '../src/helpers'
import { useTranslationHelper } from '../src/translation'

const ITERATIONS_FAST = 50_000
const ITERATIONS_MEDIUM = 20_000
const ITERATIONS_INTL = 5_000
const WARMUP = 10_000
const ROUNDS = 9
const REGRESSION_THRESHOLD = 0.15
const BASELINE_DIR = resolve(__dirname, '__perf__')
const BASELINE_PATH = resolve(BASELINE_DIR, 'baseline.json')
const UPDATE_BASELINE = process.env.PERF_UPDATE_BASELINE === '1'

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

interface BenchResult {
  name: string
  opsPerMs: number
  totalMs: number
}

function bench(name: string, fn: () => void, iterations = ITERATIONS_FAST): BenchResult {
  const warmup = Math.min(WARMUP, iterations)
  for (let i = 0; i < warmup; i++) fn()

  const samples: number[] = []
  for (let r = 0; r < ROUNDS; r++) {
    const start = performance.now()
    for (let i = 0; i < iterations; i++) fn()
    samples.push(performance.now() - start)
  }

  samples.sort((a, b) => a - b)
  const half = Math.max(1, Math.floor(samples.length / 2))
  let sum = 0
  for (let i = 0; i < half; i++) sum += samples[i]!
  const bestHalfMean = sum / half
  return { name, opsPerMs: iterations / bestHalfMean, totalMs: bestHalfMean }
}

const allResults: Baseline = {}
const regressions: string[] = []

function getThreshold(opsPerMs: number): number {
  if (opsPerMs > 10_000) return 0.3
  if (opsPerMs > 5_000) return 0.25
  return REGRESSION_THRESHOLD
}

function checkRegression(result: BenchResult, baseline: Baseline | null): void {
  allResults[result.name] = { opsPerMs: result.opsPerMs, totalMs: result.totalMs }
  if (!baseline || !baseline[result.name]) return
  const prev = baseline[result.name]!
  const ratio = result.opsPerMs / prev.opsPerMs
  const threshold = getThreshold(prev.opsPerMs)
  if (ratio < 1 - threshold) {
    const msg = `⚠ REGRESSION: "${result.name}" — ${result.opsPerMs.toFixed(1)} ops/ms vs baseline ${prev.opsPerMs.toFixed(1)} ops/ms (−${((1 - ratio) * 100).toFixed(1)}%)`
    regressions.push(msg)
    console.warn(msg)
  }
}

function assertBench(result: BenchResult, baseline: Baseline | null, minOps = 1): void {
  checkRegression(result, baseline)
  const prev = baseline?.[result.name]
  if (prev) {
    const ratio = result.opsPerMs / prev.opsPerMs
    const threshold = getThreshold(prev.opsPerMs)
    if (ratio <= 1 - threshold) {
      throw new Error(`"${result.name}" regressed by ${((1 - ratio) * 100).toFixed(1)}% vs baseline`)
    }
  } else {
    expect(result.opsPerMs).toBeGreaterThan(minOps)
  }
}

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
      lines.push(
        row(
          `${pad(r.name, NW)}${padL(r.opsPerMs.toFixed(1), CW)}${padL(prev.opsPerMs.toFixed(1), CW)}${padL(`${sign}${pct.toFixed(1)}%`, CW)} ${flag}`,
          W,
        ),
      )
    } else {
      lines.push(row(`${pad(r.name, NW)}${padL(r.opsPerMs.toFixed(1), CW)}${padL(r.totalMs.toFixed(2), CW)}${' '.repeat(CW + 3)}`, W))
    }
  }

  lines.push(`\u255A${'\u2550'.repeat(W - 2)}\u255D`)
  if (hasBaseline) lines.push('  !! = regression (>15-30% drop)  ^^ = improvement (>10% gain)')
  console.log(lines.join('\n'))
}

function buildFlatTranslations(count: number): Translations {
  const out: Translations = {}
  for (let i = 0; i < count; i++) {
    out[`key_${i}`] = `value ${i}`
    out[`param_${i}`] = `Hello {name} #{i}`
  }
  return out
}

function buildNestedTranslations(count: number): Translations {
  const out: Translations = {
    common: {
      title: 'Title',
      nested: {
        deep: 'Deep value',
      },
    },
  }
  for (let i = 0; i < count; i++) {
    ;(out.common as Translations)[`item_${i}`] = `Item ${i}`
  }
  return out
}

class BenchI18n extends BaseI18n {
  constructor(
    private _locale: string,
    private _fallbackLocale: string,
    private _route: string,
    options?: BaseI18nOptions,
  ) {
    super(options)
  }

  getLocale(): string {
    return this._locale
  }

  getFallbackLocale(): string {
    return this._fallbackLocale
  }

  getRoute(): string {
    return this._route
  }
}

const flat500 = buildFlatTranslations(500)
const nested100 = buildNestedTranslations(100)
const mergeHelper = useTranslationHelper()
mergeHelper.loadTranslations('en', flat500, 'merge-bench')

const loadHelper = useTranslationHelper()

const helper = useTranslationHelper()
helper.loadTranslations('en', flat500, 'index')
helper.loadTranslations('en', nested100, 'about')
helper.loadTranslations('de', flat500, 'index')
for (let r = 0; r < 10; r++) {
  helper.loadTranslations('en', { [`route_${r}`]: `Route ${r}` }, `page-${r}`)
}

const i18n = new BenchI18n('en', 'de', 'index', { missingWarn: false, storage: { translations: new Map() } })
i18n.helper.loadTranslations('en', flat500, 'index')
i18n.helper.loadTranslations('en', nested100, 'about')
i18n.helper.loadTranslations('de', flat500, 'index')

const formatter = new FormatService()
const sampleDate = new Date('2024-06-15T12:00:00Z')
const samplePastDate = new Date(Date.now() - 86_400_000)

const baseline: Baseline | null = UPDATE_BASELINE ? null : loadBaseline()

describe('Performance: helpers', () => {
  const results: BenchResult[] = []
  afterAll(() => printReport('Core Helpers Performance', results, baseline))

  const cases: [string, () => void, number?, number?][] = [
    ['interpolate', () => interpolate('Hello {name}, count {count}', { name: 'Ada', count: 3 })],
    ['getByPath flat', () => getByPath(flat500 as Record<string, unknown>, 'key_42')],
    ['getByPath nested', () => getByPath(nested100 as Record<string, unknown>, 'common.nested.deep')],
    [
      'withPrefixStrategy',
      () => {
        withPrefixStrategy('prefix')
        withPrefixStrategy('prefix_and_default')
        withPrefixStrategy('no_prefix')
      },
    ],
    ['isNoPrefixStrategy', () => isNoPrefixStrategy('no_prefix')],
    ['isPrefixStrategy', () => isPrefixStrategy('prefix')],
    ['isPrefixExceptDefaultStrategy', () => isPrefixExceptDefaultStrategy('prefix_except_default')],
    ['isPrefixAndDefaultStrategy', () => isPrefixAndDefaultStrategy('prefix_and_default')],
    [
      'defaultPlural',
      () => {
        defaultPlural('items', 2, {}, 'en', (k) => 'one|two|many')
      },
    ],
  ]

  for (const [name, fn, iterations, minOps] of cases) {
    test(name, () => {
      const r = bench(name, fn, iterations)
      results.push(r)
      assertBench(r, baseline, minOps)
    })
  }
})

describe('Performance: translation helper', () => {
  const results: BenchResult[] = []
  afterAll(() => printReport('Translation Helper Performance', results, baseline))

  const cases: [string, () => void, number?, number?][] = [
    ['getTranslation flat hit', () => helper.getTranslation('en', 'index', 'key_42')],
    ['getTranslation nested hit', () => helper.getTranslation('en', 'about', 'common.nested.deep')],
    ['getTranslation miss', () => helper.getTranslation('en', 'index', 'missing.key')],
    ['hasPageTranslation hit', () => helper.hasPageTranslation('en', 'index')],
    ['hasPageTranslation miss', () => helper.hasPageTranslation('fr', 'index')],
    ['hasTranslation scan', () => helper.hasTranslation('en', 'key_42'), ITERATIONS_MEDIUM],
    ['mergeTranslation', () => mergeHelper.mergeTranslation('en', 'merge-bench', { dynamic: 'x' }), ITERATIONS_MEDIUM],
    ['loadTranslations', () => loadHelper.loadTranslations('en', { tmp: 'v' }, 'tmp-route'), ITERATIONS_MEDIUM, 0.5],
    ['loadPageTranslations', () => helper.loadPageTranslations('en', 'tmp-page', { page: 'v' }), ITERATIONS_MEDIUM, 0.5],
    ['hasCache', () => helper.hasCache('en', 'index'), ITERATIONS_MEDIUM],
    ['getCache', () => helper.getCache('en', 'index'), ITERATIONS_MEDIUM],
  ]

  for (const [name, fn, iterations, minOps] of cases) {
    test(name, () => {
      const r = bench(name, fn, iterations)
      results.push(r)
      assertBench(r, baseline, minOps)
    })
  }
})

describe('Performance: BaseI18n', () => {
  const results: BenchResult[] = []
  afterAll(() => printReport('BaseI18n Performance', results, baseline))

  const cases: [string, () => void, number?, number?][] = [
    ['t flat hit', () => i18n.t('key_42')],
    ['t nested hit', () => i18n.t('common.nested.deep', undefined, undefined, 'about')],
    ['t with params', () => i18n.t('param_1', { name: 'Ada' })],
    ['t miss', () => i18n.t('missing.key')],
    ['t fallback locale', () => i18n.t('key_42')],
    ['ts', () => i18n.ts('key_42')],
    ['tc', () => i18n.tc('items', 2), ITERATIONS_MEDIUM],
    ['has hit', () => i18n.has('key_42')],
    ['has nested', () => i18n.has('common.nested.deep', 'about')],
    [
      'loadTranslationsCore merge',
      () => {
        const route = `bench-${Math.random()}`
        i18n.loadTranslationsCore('en', { x: '1' }, true, route)
      },
      ITERATIONS_MEDIUM,
      0.5,
    ],
    [
      'loadRouteTranslationsCore merge',
      () => {
        const route = `bench-route-${Math.random()}`
        i18n.loadRouteTranslationsCore('en', route, { y: '2' }, true)
      },
      ITERATIONS_MEDIUM,
      0.5,
    ],
  ]

  for (const [name, fn, iterations, minOps] of cases) {
    test(name, () => {
      const r = bench(name, fn, iterations)
      results.push(r)
      assertBench(r, baseline, minOps)
    })
  }
})

describe('Performance: FormatService', () => {
  const results: BenchResult[] = []
  afterAll(() => printReport('FormatService Performance', results, baseline))

  const cases: [string, () => void, number?, number?][] = [
    ['formatNumber', () => formatter.formatNumber(123456.789, 'en-US'), ITERATIONS_INTL, 0.1],
    ['formatDate', () => formatter.formatDate(sampleDate, 'en-US'), ITERATIONS_INTL, 0.1],
    ['formatRelativeTime', () => formatter.formatRelativeTime(samplePastDate, 'en-US'), ITERATIONS_INTL, 0.05],
  ]

  for (const [name, fn, iterations, minOps] of cases) {
    test(name, () => {
      const r = bench(name, fn, iterations)
      results.push(r)
      assertBench(r, baseline, minOps)
    })
  }
})

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
