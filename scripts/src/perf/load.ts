import type { ArtilleryLoadKnobs } from 'untestutils/perf'
import type { LoadProfileId, PerfRuntimeProfile } from './types'

/**
 * URL paths for Artillery from the shared runtime profile.
 * Assumes `prefix_except_default`: default locale has no prefix.
 */
export function loadPathsFromProfile(profile: PerfRuntimeProfile): string[] {
  const paths: string[] = []
  const defaultCode = profile.locales[0]?.code
  const others = profile.locales.slice(1)

  for (const page of profile.pages) {
    const suffix = page.kind === 'index' ? '' : `/${page.name}`
    paths.push(suffix === '' ? '/' : suffix)

    for (const loc of others) {
      if (loc.code === defaultCode) continue
      paths.push(`/${loc.code}${suffix}`)
    }
  }

  return [...new Set(paths)]
}

export type LoadPhaseSpec = {
  warmUpSec: number
  warmUpArrivalRate: number
  durationSec: number
  arrivalRate: number
  /** Explicit key: `undefined` = uncapped (`'maxVusers' in knobs`). */
  maxVusers: number | undefined
  label: string
}

/**
 * Load profiles for A/B and published docs.
 * - `full` — historical YAML window (docs / marketing)
 * - `mid` — half main window
 * - `short` — library sweep defaults (fast CI)
 */
export const LOAD_PROFILES: Record<LoadProfileId, LoadPhaseSpec> = {
  full: {
    warmUpSec: 6,
    warmUpArrivalRate: 6,
    durationSec: 60,
    arrivalRate: 60,
    maxVusers: undefined,
    label: 'warm 6s@6 + main 60s@60 uncapped (historical)',
  },
  mid: {
    warmUpSec: 6,
    warmUpArrivalRate: 6,
    durationSec: 30,
    arrivalRate: 60,
    maxVusers: undefined,
    label: 'warm 6s@6 + main 30s@60 uncapped',
  },
  short: {
    warmUpSec: 2,
    warmUpArrivalRate: 10,
    durationSec: 10,
    arrivalRate: 40,
    maxVusers: 40,
    label: 'warm 2s@10 + main 10s@40 / maxVU 40 (sweep)',
  },
}

/** @deprecated use LOAD_PROFILES.full — kept for older test imports */
export const I18N_LOAD_PHASES = {
  warmUpSec: LOAD_PROFILES.full.warmUpSec,
  warmUpArrivalRate: LOAD_PROFILES.full.warmUpArrivalRate,
  durationSec: LOAD_PROFILES.full.durationSec,
  arrivalRate: LOAD_PROFILES.full.arrivalRate,
} as const

export function parseLoadProfile(raw: string): LoadProfileId {
  const id = raw.trim().toLowerCase()
  if (id === 'full' || id === 'mid' || id === 'short') return id
  throw new Error(`--load must be full | mid | short, got "${raw}"`)
}

/**
 * Knobs for `@untestutils/perf` ≥0.6.9 (`'maxVusers' in knobs` → uncapped when undefined).
 */
export function artilleryKnobsFromProfile(
  profile: PerfRuntimeProfile,
  loadId: LoadProfileId = 'short',
): ArtilleryLoadKnobs {
  const phases = LOAD_PROFILES[loadId]
  return {
    name: 'i18n-load',
    paths: loadPathsFromProfile(profile),
    warmUpSec: phases.warmUpSec,
    warmUpArrivalRate: phases.warmUpArrivalRate,
    durationSec: phases.durationSec,
    arrivalRate: phases.arrivalRate,
    maxVusers: phases.maxVusers,
  }
}

export function describeLoadProfile(loadId: LoadProfileId): string {
  return LOAD_PROFILES[loadId].label
}
