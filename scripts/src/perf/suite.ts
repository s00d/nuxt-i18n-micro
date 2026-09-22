import { consoleReporter, definePerfSuite, type PerfReporter, type PerfSuite, type PerfTarget } from 'untestutils/perf'
import { join } from 'node:path'
import { isTranslationFile } from '../../../test/helpers/is-translation-file'
import { repoRoot } from '../utils/workspace'
import { resolveFixtureSelection, type PerfFixtureDef } from './fixtures'
import { ensurePerfLocales, writePerfLocales, writeRuntimeProfile } from './generate'
import { artilleryScriptFromProfile, loadPathsFromProfile } from './load'
import { createDocsReporter } from './report'
import type { PerfRuntimeProfile, ResolvedPerfArgs } from './types'

const LOAD_PORT = 10_000

function fixtureTarget(fixture: PerfFixtureDef, port: number, profile: PerfRuntimeProfile): PerfTarget {
  const root = join(repoRoot, fixture.dir)
  const paths = loadPathsFromProfile(profile)
  return {
    id: fixture.id,
    label: fixture.label,
    root,
    build: {
      command: 'nuxi',
      args: ['build'],
      env: { NODE_OPTIONS: '--max-old-space-size=16000' },
      // Invalidate when the workspace module changes (not only the fixture tree).
      hashInputs: [root, join(repoRoot, 'src')],
    },
    start: {
      command: 'node',
      args: ['.output/server/index.mjs'],
      port,
      env: { NITRO_PRESET: 'node-server' },
    },
    load: {
      paths,
      // Inline script: uncapped phases. Knobs+undefined maxVU is broken on untestutils 0.6.8 (`??` → 40).
      artillery: { script: artilleryScriptFromProfile(profile) },
    },
    bundle: {
      dirs: ['.output/public', '.output/server'],
      classify: (absPath) => (isTranslationFile(absPath) ? 'asset' : 'code'),
    },
  }
}

/** Perf suite for the i18n fixture matrix (plain / @nuxtjs/i18n / micro). */
export function createI18nPerfSuite(args: ResolvedPerfArgs): PerfSuite {
  const fixtures = resolveFixtureSelection(args.only)
  const reporters: PerfReporter[] = [consoleReporter()]
  if (args.writeDocs) reporters.push(createDocsReporter(args))

  return definePerfSuite({
    runs: args.runs,
    skipLoad: args.skipLoad,
    // Every consecutive run must rebuild — warm cache would zero buildTime and skew the mean.
    forceBuild: true,
    // Match pre-migration cool-downs (scripts/src/perf/run.ts before untestutils).
    postBuildDelayMs: 2000,
    coolDownBetweenRunsMs: 3000,
    coolDownBetweenTargetsMs: 5000,
    // 0.6.8 only reads coolDownMs (same pause for runs + targets). Split fields need ≥0.6.9.
    coolDownMs: 5000,
    artifactsDir: join(repoRoot, 'test/.untestutils/perf'),
    targets: fixtures.map((f) => fixtureTarget(f, LOAD_PORT, args.profile)),
    reporters,
    async beforeAll() {
      writeRuntimeProfile(args.profile)
      writePerfLocales(args.profile, fixtures)
      ensurePerfLocales(args.profile, fixtures)
      console.log(
        `profile: ${args.profile.locales.length} locales, branch ${args.profile.branch}, pages ${args.profile.pages.map((p) => p.name).join('+')} · artillery paths: ${loadPathsFromProfile(args.profile).join(', ')}`,
      )
    },
  })
}
