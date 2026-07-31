import { describe, expect, it } from 'vitest'
import { averageFixtureRuns, averagePerformanceResults } from '../src/perf/average'
import {
  DEFAULT_KEYS,
  DEFAULT_LOCALES,
  buildProfile,
  keysToBranch,
  leafKeysFor,
  parseOnly,
  resolvePerfArgs,
} from '../src/perf/config'
import { PERF_FIXTURES, resolveFixtureSelection } from '../src/perf/fixtures'
import type { FixtureRunResult, PerformanceResult } from '../src/perf/types'

describe('perf config', () => {
  it('maps keys to a clamped branch at depth 5', () => {
    expect(keysToBranch(3125)).toBe(5)
    expect(keysToBranch(5000)).toBe(6)
    expect(keysToBranch(10_000)).toBe(7)
    expect(keysToBranch(100_000)).toBe(10)
    expect(keysToBranch(1)).toBe(3)
    expect(leafKeysFor(7)).toBe(16_807)
  })

  it('builds a default-sized profile', () => {
    const profile = buildProfile(DEFAULT_LOCALES, DEFAULT_KEYS)
    expect(profile.locales).toHaveLength(4)
    expect(profile.locales.map((l) => l.code)).toEqual(['en', 'de', 'ru', 'fr'])
    expect(profile.pages.map((p) => p.name)).toEqual(['index', 'page'])
    expect(profile.branch).toBe(7)
    expect(profile.secondaryBranch).toBe(6)
  })

  it('resolves fixtures from a single registry', () => {
    expect(PERF_FIXTURES).toHaveLength(3)
    expect(resolveFixtureSelection('all').map((f) => f.id)).toEqual(['plain-nuxt', 'i18n', 'i18n-micro'])
    expect(resolveFixtureSelection('micro')[0]!.dir).toBe('test/fixtures/i18n-micro')
    expect(parseOnly('micro')).toBe('micro')
    expect(() => parseOnly('nope')).toThrow(/--only/)

    const all = resolvePerfArgs({
      locales: '4',
      keys: '10000',
      only: 'all',
      runs: '2',
      skipStress: false,
    })
    expect(all.fixtures).toEqual(['plain-nuxt', 'i18n', 'i18n-micro'])
    expect(all.writeDocs).toBe(true)
    expect(all.keys).toBe(10_000)

    const micro = resolvePerfArgs({
      locales: '3',
      keys: '3125',
      only: 'micro',
      runs: '1',
      skipStress: true,
    })
    expect(micro.fixtures).toEqual(['i18n-micro'])
    expect(micro.writeDocs).toBe(false)
  })
})

describe('perf progress', () => {
  it('formats ETA and estimates wall time', async () => {
    const { formatEta, estimateWallSeconds, ARTILLERY_SECONDS } = await import('../src/perf/progress')
    expect(formatEta(45)).toBe('~45s')
    expect(ARTILLERY_SECONDS).toBe(66)
    expect(estimateWallSeconds({ runs: 3, fixtures: 3, skipStress: false })).toBeGreaterThan(600)
  })
})

describe('perf average', () => {
  const sample = (buildTime: number, rps: number): PerformanceResult => ({
    buildTime,
    maxMemoryUsed: buildTime * 10,
    minMemoryUsed: buildTime,
    avgMemoryUsed: buildTime * 5,
    maxCpuUsage: 80,
    minCpuUsage: 10,
    avgCpuUsage: 45,
    requestsPerSecond: rps,
    autocannon: {
      requests: { average: rps / 2, mean: rps / 2, total: 500 },
      latency: { average: 20, mean: 20, min: 1, max: 40, p50: 18, p97_5: 30, p99: 35 },
      throughput: { average: 1000 },
      errors: 0,
    },
  })

  it('mean of one run equals that run', () => {
    const one = sample(10, 100)
    const mean = averagePerformanceResults([one])
    expect(mean.buildTime).toBe(10)
    expect(mean.requestsPerSecond).toBe(100)
    expect(mean.autocannon?.requests.average).toBe(50)
  })

  it('averages numeric metrics across runs', () => {
    const mean = averagePerformanceResults([sample(10, 100), sample(20, 200)])
    expect(mean.buildTime).toBe(15)
    expect(mean.requestsPerSecond).toBe(150)
    expect(mean.autocannon?.requests.average).toBe(75)
  })

  it('averages fixture matrices the same for N=1 and N=2', () => {
    const row = (buildTime: number): FixtureRunResult => ({
      id: 'i18n-micro',
      label: 'i18n-micro',
      build: sample(buildTime, 100),
    })
    expect(averageFixtureRuns([[row(10)]])[0]!.build.buildTime).toBe(10)
    expect(averageFixtureRuns([[row(10)], [row(20)]])[0]!.build.buildTime).toBe(15)
  })
})
