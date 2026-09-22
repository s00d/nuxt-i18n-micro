import { describe, expect, it } from 'vitest'
import { averageTargetResults, type PerfTargetResult } from 'untestutils/perf'
import { DEFAULT_KEYS, DEFAULT_LOCALES, DEFAULT_RUNS, buildProfile, keysToBranch, leafKeysFor, parseOnly, resolvePerfArgs } from '../src/perf/config'
import { PERF_FIXTURES, resolveFixtureSelection } from '../src/perf/fixtures'
import { I18N_LOAD_PHASES, artilleryKnobsFromProfile, artilleryScriptFromProfile, loadPathsFromProfile } from '../src/perf/load'

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

  it('resolves fixtures and skipLoad', () => {
    expect(PERF_FIXTURES).toHaveLength(3)
    expect(resolveFixtureSelection('all').map((f) => f.id)).toEqual(['plain-nuxt', 'i18n', 'i18n-micro'])
    expect(parseOnly('micro')).toBe('micro')
    expect(() => parseOnly('nope')).toThrow(/--only/)
    expect(DEFAULT_RUNS).toBe(3)

    const all = resolvePerfArgs({
      locales: '4',
      keys: '10000',
      only: 'all',
      runs: String(DEFAULT_RUNS),
      skipLoad: false,
    })
    expect(all.fixtures).toEqual(['plain-nuxt', 'i18n', 'i18n-micro'])
    expect(all.runs).toBe(3)
    expect(all.writeDocs).toBe(true)

    const micro = resolvePerfArgs({
      locales: '3',
      keys: '3125',
      only: 'micro',
      runs: '1',
      skipLoad: true,
    })
    expect(micro.fixtures).toEqual(['i18n-micro'])
    expect(micro.skipLoad).toBe(true)
    expect(micro.writeDocs).toBe(false)
  })
})

describe('perf load methodology', () => {
  it('builds uncapped 6@6 + 60@60 script (no maxVusers)', () => {
    const profile = buildProfile(DEFAULT_LOCALES, DEFAULT_KEYS)
    const paths = loadPathsFromProfile(profile)
    expect(paths).toEqual(['/', '/de', '/ru', '/fr', '/page', '/de/page', '/ru/page', '/fr/page'])

    const script = artilleryScriptFromProfile(profile)
    expect(script.config.phases).toEqual([
      { name: 'warm-up', duration: I18N_LOAD_PHASES.warmUpSec, arrivalRate: I18N_LOAD_PHASES.warmUpArrivalRate },
      { name: 'main', duration: I18N_LOAD_PHASES.durationSec, arrivalRate: I18N_LOAD_PHASES.arrivalRate },
    ])
    expect(JSON.stringify(script)).not.toContain('maxVusers')
    expect(script.scenarios[0].flow).toHaveLength(paths.length)

    const knobs = artilleryKnobsFromProfile(profile)
    expect(knobs).toMatchObject({ ...I18N_LOAD_PHASES, paths })
    expect('maxVusers' in knobs).toBe(true)
    expect(knobs.maxVusers).toBeUndefined()
  })
})

describe('perf average', () => {
  const sample = (buildTimeSec: number, rps: number): PerfTargetResult => ({
    id: 'i18n-micro',
    label: 'i18n-micro',
    build: {
      buildTimeSec,
      maxMemoryMb: buildTimeSec * 10,
      minMemoryMb: buildTimeSec,
      avgMemoryMb: buildTimeSec * 5,
      maxCpuPct: 80,
      minCpuPct: 10,
      avgCpuPct: 45,
    },
    load: {
      maxMemoryMb: 1,
      minMemoryMb: 1,
      avgMemoryMb: 1,
      maxCpuPct: 1,
      minCpuPct: 1,
      avgCpuPct: 1,
      requestsPerSecond: rps,
    },
  })

  it('averages PerfTargetResult runs', () => {
    const mean = averageTargetResults([sample(10, 100), sample(20, 200)])
    expect(mean.build.buildTimeSec).toBe(15)
    expect(mean.load?.requestsPerSecond).toBe(150)
  })
})
