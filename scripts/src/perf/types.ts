import type { PerfTargetResult } from 'untestutils/perf'

export type FixtureAlias = 'plain' | 'i18n' | 'micro'
export type FixtureOnly = FixtureAlias | 'all'
export type FixtureId = 'plain-nuxt' | 'i18n' | 'i18n-micro'

/** Artillery load window: short (CI default) | mid | full (docs). */
export type LoadProfileId = 'short' | 'mid' | 'full'

/** Cool-down preset after A/B: fast wins when ranking stable. */
export type CoolPresetId = 'fast' | 'strict'

export interface LocaleDef {
  code: string
  iso: string
  language: string
  displayName: string
}

export interface PageDef {
  name: string
  kind: 'index' | 'secondary'
}

export interface PerfRuntimeProfile {
  locales: LocaleDef[]
  depth: number
  branch: number
  secondaryDepth: number
  secondaryBranch: number
  pages: PageDef[]
}

export interface CoolDownConfig {
  postBuildDelayMs: number
  coolDownBetweenRunsMs: number
  coolDownBetweenTargetsMs: number
  coolDownMs: number
}

export interface ResolvedPerfArgs {
  locales: number
  keys: number
  only: FixtureOnly
  runs: number
  skipLoad: boolean
  load: LoadProfileId
  cool: CoolPresetId
  coolDowns: CoolDownConfig
  profile: PerfRuntimeProfile
  fixtures: FixtureId[]
  writeDocs: boolean
}

export type { PerfTargetResult }
