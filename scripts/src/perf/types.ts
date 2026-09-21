import type { PerfTargetResult } from 'untestutils/perf'

export type FixtureAlias = 'plain' | 'i18n' | 'micro'
export type FixtureOnly = FixtureAlias | 'all'
export type FixtureId = 'plain-nuxt' | 'i18n' | 'i18n-micro'

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

export interface ResolvedPerfArgs {
  locales: number
  keys: number
  only: FixtureOnly
  runs: number
  skipLoad: boolean
  profile: PerfRuntimeProfile
  fixtures: FixtureId[]
  writeDocs: boolean
}

export type { PerfTargetResult }
