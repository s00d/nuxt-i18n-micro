import type { LocaleDef, PageDef, PerfRuntimeProfile, ResolvedPerfArgs } from './types'
import { parseOnly, resolveFixtureSelection } from './fixtures'

/** Full locale pool — CLI takes the first N. */
export const LOCALE_POOL: LocaleDef[] = [
  { code: 'en', iso: 'en-US', language: 'en-US', displayName: 'English' },
  { code: 'de', iso: 'de-DE', language: 'de-DE', displayName: 'German' },
  { code: 'ru', iso: 'ru-RU', language: 'ru-RU', displayName: 'Russian' },
  { code: 'fr', iso: 'fr-FR', language: 'fr-FR', displayName: 'French' },
  { code: 'es', iso: 'es-ES', language: 'es-ES', displayName: 'Spanish' },
  { code: 'it', iso: 'it-IT', language: 'it-IT', displayName: 'Italian' },
  { code: 'pt', iso: 'pt-PT', language: 'pt-PT', displayName: 'Portuguese' },
  { code: 'nl', iso: 'nl-NL', language: 'nl-NL', displayName: 'Dutch' },
  { code: 'pl', iso: 'pl-PL', language: 'pl-PL', displayName: 'Polish' },
  { code: 'ja', iso: 'ja-JP', language: 'ja-JP', displayName: 'Japanese' },
  { code: 'zh', iso: 'zh-CN', language: 'zh-CN', displayName: 'Chinese' },
  { code: 'ko', iso: 'ko-KR', language: 'ko-KR', displayName: 'Korean' },
]

/** Default page set: index + page. */
export const DEFAULT_PAGES: PageDef[] = [
  { name: 'index', kind: 'index' },
  { name: 'page', kind: 'secondary' },
]

export const DEFAULT_LOCALES = 4
export const DEFAULT_KEYS = 10_000
export const TREE_DEPTH = 5

export { parseOnly }

/**
 * Map target leaf-key count → tree branch at fixed depth.
 * Prefer branch^depth ≥ keys (ceil), clamp branch to 3..10.
 */
export function keysToBranch(keys: number, depth = TREE_DEPTH): number {
  if (!Number.isFinite(keys) || keys < 1) throw new Error(`keys must be a positive number, got ${keys}`)
  const raw = Math.ceil(keys ** (1 / depth))
  return Math.min(10, Math.max(3, raw))
}

export function leafKeysFor(branch: number, depth = TREE_DEPTH): number {
  return branch ** depth
}

export function buildProfile(locales: number, keys: number): PerfRuntimeProfile {
  if (!Number.isInteger(locales) || locales < 1 || locales > LOCALE_POOL.length) {
    throw new Error(`--locales must be an integer between 1 and ${LOCALE_POOL.length}, got ${locales}`)
  }
  const branch = keysToBranch(keys)
  return {
    locales: LOCALE_POOL.slice(0, locales),
    depth: TREE_DEPTH,
    branch,
    secondaryDepth: TREE_DEPTH,
    secondaryBranch: Math.max(3, branch - 1),
    pages: DEFAULT_PAGES.map((p) => ({ name: p.name, kind: p.kind })),
  }
}

export function resolvePerfArgs(input: {
  locales: string
  keys: string
  only: string
  runs: string
  skipStress: boolean
}): ResolvedPerfArgs {
  const locales = Number(input.locales)
  const keys = Number(input.keys)
  const runs = Number(input.runs)
  if (!Number.isInteger(locales) || locales < 1) {
    throw new Error(`--locales must be a positive integer, got "${input.locales}"`)
  }
  if (!Number.isFinite(keys) || keys < 1) {
    throw new Error(`--keys must be a positive number, got "${input.keys}"`)
  }
  if (!Number.isInteger(runs) || runs < 1) {
    throw new Error(`--runs must be a positive integer, got "${input.runs}"`)
  }

  const only = parseOnly(input.only)
  const selected = resolveFixtureSelection(only)

  return {
    locales,
    keys,
    only,
    runs,
    skipStress: Boolean(input.skipStress),
    profile: buildProfile(locales, keys),
    fixtures: selected.map((f) => f.id),
    writeDocs: only === 'all',
  }
}

export function fixtureProfileMarkdown(profile: PerfRuntimeProfile): string {
  const codes = profile.locales.map((l) => l.code)
  const pages = profile.pages.map((p) => p.name)
  const indexLeaves = leafKeysFor(profile.branch, profile.depth)
  const secondaryLeaves = leafKeysFor(profile.secondaryBranch, profile.secondaryDepth)

  return `### Fixture profile

| Knob | Value |
|------|-------|
| Locales | **${codes.length}** (\`${codes.join('`, `')}\`) |
| Pages | **${pages.length}** (\`${pages.join('`, `')}\`) |
| Index tree | depth **${profile.depth}**, branch **${profile.branch}** → **${indexLeaves.toLocaleString('en-US')}** leaf keys / locale |
| Secondary pages | depth **${profile.secondaryDepth}**, branch **${profile.secondaryBranch}** → **${secondaryLeaves.toLocaleString('en-US')}** leaf keys / page / locale |
| Goal | Default CLI profile (\`--locales 4 --keys 10000\`); raise knobs for regression-radar loads |

Dictionaries come from \`test/fixtures/perf-shared/runtime.json\` (written by the CLI) so all three fixtures stay aligned.
`
}
