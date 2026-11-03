import { join } from 'node:path'
import { repoRoot } from '../utils/workspace'
import type { FixtureAlias, FixtureId, FixtureOnly } from './types'

/**
 * Single registry for every performance project.
 * CLI / generate / report / stress all read this — add a fixture here, not scattered maps.
 */
export interface PerfFixtureDef {
  id: FixtureId
  /** Value for `--only` */
  alias: FixtureAlias
  /** Chart / markdown label */
  label: string
  /** App root relative to repo */
  dir: string
  /** On-disk dictionaries relative to repo (measured pre-build) */
  sourceDictDir: string
}

export const PERF_FIXTURES: readonly PerfFixtureDef[] = [
  {
    id: 'plain-nuxt',
    alias: 'plain',
    label: 'plain-nuxt',
    dir: 'scripts/perf-fixtures/plain-nuxt',
    sourceDictDir: 'scripts/perf-fixtures/plain-nuxt/data',
  },
  {
    id: 'i18n',
    alias: 'i18n',
    label: 'i18n-v10',
    dir: 'scripts/perf-fixtures/i18n',
    sourceDictDir: 'scripts/perf-fixtures/i18n/i18n/locales',
  },
  {
    id: 'i18n-micro',
    alias: 'micro',
    label: 'i18n-micro',
    dir: 'scripts/perf-fixtures/i18n-micro',
    sourceDictDir: 'scripts/perf-fixtures/i18n-micro/locales',
  },
] as const

const BY_ID = Object.fromEntries(PERF_FIXTURES.map((f) => [f.id, f])) as Record<FixtureId, PerfFixtureDef>
const BY_ALIAS = Object.fromEntries(PERF_FIXTURES.map((f) => [f.alias, f])) as Record<FixtureAlias, PerfFixtureDef>

export function fixtureById(id: FixtureId): PerfFixtureDef {
  return BY_ID[id]
}

export function fixtureAbsDir(fixture: PerfFixtureDef): string {
  return join(repoRoot, fixture.dir)
}

export function fixtureSourceAbsDir(fixture: PerfFixtureDef): string {
  return join(repoRoot, fixture.sourceDictDir)
}

export function resolveFixtureSelection(only: FixtureOnly): PerfFixtureDef[] {
  if (only === 'all') return [...PERF_FIXTURES]
  return [BY_ALIAS[only]]
}

export function parseOnly(raw: string): FixtureOnly {
  const value = raw.trim().toLowerCase()
  if (value === 'all') return 'all'
  if (value in BY_ALIAS) return value as FixtureAlias
  const aliases = PERF_FIXTURES.map((f) => f.alias).join(' | ')
  throw new Error(`--only must be ${aliases} | all, got "${raw}"`)
}
