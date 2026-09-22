import type { PerfRuntimeProfile } from './types'

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

/** Published load window: warm 6s@6 + main 60s@60, no maxVusers (historical YAML). */
export const I18N_LOAD_PHASES = {
  warmUpSec: 6,
  warmUpArrivalRate: 6,
  durationSec: 60,
  arrivalRate: 60,
} as const

/**
 * Knobs for untestutils ≥0.6.9 (`'maxVusers' in knobs` → uncapped).
 * Prefer {@link artilleryScriptFromProfile} so published 0.6.8 cannot re-apply maxVU 40 via `??`.
 */
export function artilleryKnobsFromProfile(profile: PerfRuntimeProfile) {
  return {
    name: 'i18n-load',
    paths: loadPathsFromProfile(profile),
    ...I18N_LOAD_PHASES,
    maxVusers: undefined as number | undefined,
  }
}

/**
 * Inline Artillery script matching pre-migration `benchmark/artillery-config.yml`:
 * warm **6s @ 6/s** + main **60s @ 60/s**, **uncapped** virtual users.
 */
export function artilleryScriptFromProfile(profile: PerfRuntimeProfile) {
  const paths = loadPathsFromProfile(profile)
  const { warmUpSec, warmUpArrivalRate, durationSec, arrivalRate } = I18N_LOAD_PHASES
  return {
    config: {
      phases: [
        { name: 'warm-up', duration: warmUpSec, arrivalRate: warmUpArrivalRate },
        { name: 'main', duration: durationSec, arrivalRate },
      ],
      http: { timeout: 30 },
    },
    scenarios: [
      {
        name: 'i18n-load',
        flow: paths.map((url) => ({ get: { url } })),
        ...(paths.length > 1 ? { 'parallel-requests': Math.min(paths.length, 8) } : {}),
      },
    ],
  }
}
