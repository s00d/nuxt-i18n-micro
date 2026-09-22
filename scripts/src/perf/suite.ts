import { consoleReporter, definePerfSuite, type PerfReporter, type PerfSuite, type PerfTarget } from 'untestutils/perf'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { isTranslationFile } from '../../../test/helpers/is-translation-file'
import { repoRoot } from '../utils/workspace'
import {
  assertServerEntry,
  buildHashInputs,
  ensureConsumerModuleDist,
  NITRO_SERVER_ENTRY,
} from './artifact'
import { resolveFixtureSelection, type PerfFixtureDef } from './fixtures'
import { ensurePerfLocales, writePerfLocales, writeRuntimeProfile } from './generate'
import { artilleryKnobsFromProfile, describeLoadProfile, loadPathsFromProfile } from './load'
import { createDocsReporter } from './report'
import type { LoadProfileId, PerfRuntimeProfile, ResolvedPerfArgs } from './types'

const LOAD_PORT = 10_000
const NUXI_BUILD_ASSERT = fileURLToPath(new URL('./nuxi-build-assert.mjs', import.meta.url))

function fixtureTarget(
  fixture: PerfFixtureDef,
  port: number,
  profile: PerfRuntimeProfile,
  load: LoadProfileId,
): PerfTarget {
  const root = join(repoRoot, fixture.dir)
  const paths = loadPathsFromProfile(profile)
  return {
    id: fixture.id,
    label: fixture.label,
    root,
    build: {
      command: process.execPath,
      args: [NUXI_BUILD_ASSERT],
      env: { NODE_OPTIONS: '--max-old-space-size=16000' },
      hashInputs: buildHashInputs(root),
    },
    start: {
      command: 'node',
      args: [NITRO_SERVER_ENTRY],
      port,
      env: { NITRO_PRESET: 'node-server' },
    },
    load: {
      paths,
      // Knobs API (@untestutils/perf ≥0.6.9): uncapped via explicit maxVusers: undefined.
      artillery: artilleryKnobsFromProfile(profile, load),
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
  const { coolDowns } = args

  return definePerfSuite({
    runs: args.runs,
    skipLoad: args.skipLoad,
    forceBuild: true,
    postBuildDelayMs: coolDowns.postBuildDelayMs,
    coolDownBetweenRunsMs: coolDowns.coolDownBetweenRunsMs,
    coolDownBetweenTargetsMs: coolDowns.coolDownBetweenTargetsMs,
    coolDownMs: coolDowns.coolDownMs,
    artifactsDir: join(repoRoot, 'test/.untestutils/perf'),
    targets: fixtures.map((f) => fixtureTarget(f, LOAD_PORT, args.profile, args.load)),
    reporters,
    async beforeAll() {
      ensureConsumerModuleDist()
      writeRuntimeProfile(args.profile)
      writePerfLocales(args.profile, fixtures)
      ensurePerfLocales(args.profile, fixtures)
      console.log(
        `profile: ${args.profile.locales.length} locales, branch ${args.profile.branch}, pages ${args.profile.pages.map((p) => p.name).join('+')} · load=${args.load} (${describeLoadProfile(args.load)}) · cool=${args.cool} · artillery paths: ${loadPathsFromProfile(args.profile).join(', ')}`,
      )
    },
    async afterTarget(target) {
      assertServerEntry(target.root)
    },
  })
}
