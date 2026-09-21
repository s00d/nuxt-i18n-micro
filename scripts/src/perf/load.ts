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

/** Programmatic Artillery knobs (no YAML). Duration/arrival from sweep — see untestutils perf-duration-sweep. */
export function artilleryKnobsFromProfile(profile: PerfRuntimeProfile) {
  return {
    name: 'i18n-load',
    paths: loadPathsFromProfile(profile),
    warmUpSec: 2,
    warmUpArrivalRate: 10,
    durationSec: 10,
    arrivalRate: 40,
    maxVusers: 40,
  }
}
