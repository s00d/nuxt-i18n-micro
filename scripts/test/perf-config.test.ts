import { describe, expect, it } from 'vitest'
import { averageTargetResults, buildArtilleryScript, type PerfTargetResult } from 'untestutils/perf'
import {
  DEFAULT_COOL,
  DEFAULT_KEYS,
  DEFAULT_LOAD,
  DEFAULT_LOCALES,
  DEFAULT_RUNS,
  buildProfile,
  keysToBranch,
  leafKeysFor,
  parseOnly,
  resolvePerfArgs,
} from '../src/perf/config'
import { PERF_FIXTURES, resolveFixtureSelection } from '../src/perf/fixtures'
import {
  I18N_LOAD_PHASES,
  LOAD_PROFILES,
  artilleryKnobsFromProfile,
  loadPathsFromProfile,
  parseLoadProfile,
} from '../src/perf/load'
import {
  MODULE_PACKAGE_SRC_DIRS,
  buildHashInputs,
  isJitiModuleStub,
} from '../src/perf/artifact'

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

  it('resolves fixtures, load, cool, skipLoad', () => {
    expect(PERF_FIXTURES).toHaveLength(3)
    expect(resolveFixtureSelection('all').map((f) => f.id)).toEqual(['plain-nuxt', 'i18n', 'i18n-micro'])
    expect(parseOnly('micro')).toBe('micro')
    expect(() => parseOnly('nope')).toThrow(/--only/)
    expect(DEFAULT_RUNS).toBe(3)
    expect(DEFAULT_LOAD).toBe('short')
    expect(DEFAULT_COOL).toBe('fast')

    const all = resolvePerfArgs({
      locales: '4',
      keys: '10000',
      only: 'all',
      runs: String(DEFAULT_RUNS),
      skipLoad: false,
    })
    expect(all.fixtures).toEqual(['plain-nuxt', 'i18n', 'i18n-micro'])
    expect(all.runs).toBe(3)
    expect(all.load).toBe('short')
    expect(all.cool).toBe('fast')
    expect(all.writeDocs).toBe(false)

    const docs = resolvePerfArgs({
      locales: '4',
      keys: '10000',
      only: 'all',
      runs: '3',
      skipLoad: false,
      load: 'full',
      cool: 'strict',
    })
    expect(docs.load).toBe('full')
    expect(docs.cool).toBe('strict')
    expect(docs.coolDowns.postBuildDelayMs).toBe(2000)
    expect(docs.writeDocs).toBe(true)

    const shortAll = resolvePerfArgs({
      locales: '4',
      keys: '10000',
      only: 'all',
      runs: '3',
      skipLoad: false,
      load: 'short',
    })
    expect(shortAll.writeDocs).toBe(false)

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
  it('parses load profiles and builds knobs for each', () => {
    expect(parseLoadProfile('full')).toBe('full')
    expect(parseLoadProfile('SHORT')).toBe('short')
    expect(() => parseLoadProfile('nope')).toThrow(/--load/)

    const profile = buildProfile(DEFAULT_LOCALES, DEFAULT_KEYS)
    const paths = loadPathsFromProfile(profile)
    expect(paths).toEqual(['/', '/de', '/ru', '/fr', '/page', '/de/page', '/ru/page', '/fr/page'])

    const full = artilleryKnobsFromProfile(profile, 'full')
    expect(full).toMatchObject({ ...I18N_LOAD_PHASES, paths })
    expect('maxVusers' in full).toBe(true)
    expect(full.maxVusers).toBeUndefined()
    const fullScript = buildArtilleryScript(full)
    expect(JSON.stringify(fullScript)).not.toContain('maxVusers')

    const short = artilleryKnobsFromProfile(profile, 'short')
    expect(short).toMatchObject({
      warmUpSec: LOAD_PROFILES.short.warmUpSec,
      durationSec: LOAD_PROFILES.short.durationSec,
      arrivalRate: LOAD_PROFILES.short.arrivalRate,
      maxVusers: 40,
      paths,
    })
    const shortScript = buildArtilleryScript(short)
    expect(JSON.stringify(shortScript)).toContain('maxVusers')
  })
})

describe('perf artifact helpers', () => {
  it('detects jiti stubs', () => {
    expect(
      isJitiModuleStub(`
import { createJiti } from "jiti";
const jiti = createJiti(import.meta.url, {})
const _module = await jiti.import("/x/src/module.ts");
export default _module
`),
    ).toBe(true)
    expect(isJitiModuleStub('export { default } from "./runtime/module.mjs"')).toBe(false)
  })

  it('includes module + package src in hashInputs', () => {
    const inputs = buildHashInputs('/tmp/fixture')
    expect(inputs[0]).toBe('/tmp/fixture')
    expect(inputs.some((p) => p.endsWith('/src'))).toBe(true)
    for (const dir of MODULE_PACKAGE_SRC_DIRS) {
      expect(inputs.some((p) => p.replace(/\\/g, '/').endsWith(dir))).toBe(true)
    }
  })
})

describe('perf average', () => {
  const sample = (buildTimeSec: number, rps: number): PerfTargetResult => ({
    id: 'i18n-micro',
    label: 'i18n-micro',
    build: {
      buildTimeSec,
      maxCpuPct: 0,
      avgCpuPct: 0,
      minCpuPct: 0,
      maxMemoryMb: 0,
      avgMemoryMb: 0,
      minMemoryMb: 0,
    },
    load: {
      durationSec: 10,
      requestsPerSecond: rps,
      responseTimeAvg: 1,
      responseTimeP95: 2,
      responseTimeP99: 3,
      errorRate: 0,
      maxCpuPct: 0,
      avgCpuPct: 0,
      minCpuPct: 0,
      maxMemoryMb: 0,
      avgMemoryMb: 0,
      minMemoryMb: 0,
    },
  })

  it('averages consecutive target results', () => {
    const mean = averageTargetResults([sample(6, 200), sample(8, 220), sample(7, 210)])
    expect(mean.build.buildTimeSec).toBeCloseTo(7, 5)
    expect(mean.load?.requestsPerSecond).toBeCloseTo(210, 5)
  })
})
