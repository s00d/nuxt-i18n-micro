import type { AutocannonResult, BundleSize, FixtureRunResult, PerformanceResult } from './types'

function averageNumber(values: Array<number | undefined>): number | undefined {
  const nums = values.filter((v): v is number => typeof v === 'number' && Number.isFinite(v))
  if (nums.length === 0) return undefined
  return nums.reduce((a, b) => a + b, 0) / nums.length
}

function averageBundle(sizes: Array<BundleSize | undefined>): BundleSize | undefined {
  const present = sizes.filter((s): s is BundleSize => Boolean(s))
  if (present.length === 0) return undefined
  const keys = Object.keys(present[0]!) as Array<keyof BundleSize>
  const out = {} as BundleSize
  for (const key of keys) {
    out[key] = averageNumber(present.map((s) => s[key])) ?? 0
  }
  return out
}

function averageAutocannon(items: Array<AutocannonResult | undefined>): AutocannonResult | undefined {
  const present = items.filter((a): a is AutocannonResult => Boolean(a))
  if (present.length === 0) return undefined
  return {
    requests: {
      average: averageNumber(present.map((a) => a.requests.average)) ?? 0,
      mean: averageNumber(present.map((a) => a.requests.mean)) ?? 0,
      total: averageNumber(present.map((a) => a.requests.total)) ?? 0,
    },
    latency: {
      average: averageNumber(present.map((a) => a.latency.average)) ?? 0,
      mean: averageNumber(present.map((a) => a.latency.mean)) ?? 0,
      min: averageNumber(present.map((a) => a.latency.min)) ?? 0,
      max: averageNumber(present.map((a) => a.latency.max)) ?? 0,
      p50: averageNumber(present.map((a) => a.latency.p50)) ?? 0,
      p97_5: averageNumber(present.map((a) => a.latency.p97_5)) ?? 0,
      p99: averageNumber(present.map((a) => a.latency.p99)) ?? 0,
    },
    throughput: {
      average: averageNumber(present.map((a) => a.throughput.average)) ?? 0,
    },
    errors: averageNumber(present.map((a) => a.errors)) ?? 0,
  }
}

/** Mean of numeric fields. Always the same path for 1..N runs (mean of 1 === the value). Keeps last artillery for charts. */
export function averagePerformanceResults(results: PerformanceResult[]): PerformanceResult {
  if (results.length === 0) throw new Error('cannot average empty results')
  const last = results[results.length - 1]!
  return {
    buildTime: averageNumber(results.map((r) => r.buildTime)) ?? 0,
    maxMemoryUsed: averageNumber(results.map((r) => r.maxMemoryUsed)) ?? 0,
    minMemoryUsed: averageNumber(results.map((r) => r.minMemoryUsed)) ?? 0,
    avgMemoryUsed: averageNumber(results.map((r) => r.avgMemoryUsed)) ?? 0,
    maxCpuUsage: averageNumber(results.map((r) => r.maxCpuUsage)) ?? 0,
    minCpuUsage: averageNumber(results.map((r) => r.minCpuUsage)) ?? 0,
    avgCpuUsage: averageNumber(results.map((r) => r.avgCpuUsage)) ?? 0,
    bundleSize: averageBundle(results.map((r) => r.bundleSize)),
    stressTestTime: averageNumber(results.map((r) => r.stressTestTime)),
    responseTimeAvg: averageNumber(results.map((r) => r.responseTimeAvg)),
    responseTimeMin: averageNumber(results.map((r) => r.responseTimeMin)),
    responseTimeMax: averageNumber(results.map((r) => r.responseTimeMax)),
    responseTimeP50: averageNumber(results.map((r) => r.responseTimeP50)),
    responseTimeP95: averageNumber(results.map((r) => r.responseTimeP95)),
    responseTimeP99: averageNumber(results.map((r) => r.responseTimeP99)),
    requestsPerSecond: averageNumber(results.map((r) => r.requestsPerSecond)),
    errorRate: averageNumber(results.map((r) => r.errorRate)),
    autocannon: averageAutocannon(results.map((r) => r.autocannon)),
    artillery: last.artillery,
  }
}

/** Average parallel fixture-run matrices: runs[i][fixture] → one mean row per fixture. */
export function averageFixtureRuns(runs: FixtureRunResult[][]): FixtureRunResult[] {
  if (runs.length === 0) return []
  const ids = runs[0]!.map((r) => r.id)
  return ids.map((id) => {
    const samples = runs.map((run) => {
      const hit = run.find((r) => r.id === id)
      if (!hit) throw new Error(`missing fixture ${id} in a run`)
      return hit
    })
    const first = samples[0]!
    const stressSamples = samples.map((s) => s.stress).filter((s): s is PerformanceResult => Boolean(s))
    return {
      id,
      label: first.label,
      build: averagePerformanceResults(samples.map((s) => s.build)),
      stress: stressSamples.length === samples.length ? averagePerformanceResults(stressSamples) : undefined,
    }
  })
}
