import { join } from 'node:path'
import { repoRoot } from '../utils/workspace'
import type { FixtureAlias, FixtureId, FixtureOnly, LocaleDef } from './types'

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
  /**
   * Shape of generated `perf-locales.mjs` next to nuxt.config.
   * Omit when the fixture has no i18n locale list in config (plain-nuxt).
   */
  localesFile?: 'micro' | 'i18n'
}

export const PERF_FIXTURES: readonly PerfFixtureDef[] = [
  {
    id: 'plain-nuxt',
    alias: 'plain',
    label: 'plain-nuxt',
    dir: 'test/fixtures/plain-nuxt',
    sourceDictDir: 'test/fixtures/plain-nuxt/data',
  },
  {
    id: 'i18n',
    alias: 'i18n',
    label: 'i18n-v10',
    dir: 'test/fixtures/i18n',
    sourceDictDir: 'test/fixtures/i18n/i18n/locales',
    localesFile: 'i18n',
  },
  {
    id: 'i18n-micro',
    alias: 'micro',
    label: 'i18n-micro',
    dir: 'test/fixtures/i18n-micro',
    sourceDictDir: 'test/fixtures/i18n-micro/locales',
    localesFile: 'micro',
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

/** Locale objects written into fixture `perf-locales.mjs`. */
export function localesForNuxtConfig(kind: 'micro' | 'i18n', locales: LocaleDef[]): object[] {
  if (kind === 'micro') {
    return locales.map((l) => ({ code: l.code, iso: l.iso.replace('-', '_') }))
  }
  return locales.map((l) => ({ code: l.code, language: l.language, file: `${l.code}.json` }))
}
