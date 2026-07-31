import { setTimeout as delay } from 'node:timers/promises'
import { averagePerformanceResults } from './average'
import { measureBuildPerformance } from './build'
import { fixtureAbsDir, resolveFixtureSelection, type PerfFixtureDef } from './fixtures'
import { regenerateLocales, writePerfLocales, writeRuntimeProfile } from './generate'
import { ARTILLERY_SECONDS, AUTOCANNON_SECONDS, BUILD_HINT_SECONDS, PerfProgress } from './progress'
import { createMarkdownWriter, measureSourceDictionaries, printConsoleReport, writeDocsReport, writeSourceDictionaries } from './report'
import { artilleryConfigPath, stressTestServer } from './stress'
import type { FixtureRunResult, PerformanceResult, ResolvedPerfArgs } from './types'

/**
 * Run one fixture `runs` times back-to-back, then return the mean.
 * Fixtures are not interleaved — avoids cache/RSS bleed between projects.
 */
async function runFixtureConsecutive(
  fixture: PerfFixtureDef,
  fixtureIndex: number,
  fixtureCount: number,
  runs: number,
  skipStress: boolean,
  progress: PerfProgress,
): Promise<FixtureRunResult> {
  const directory = fixtureAbsDir(fixture)
  const artilleryPath = artilleryConfigPath()
  const builds: PerformanceResult[] = []
  const stresses: PerformanceResult[] = []

  console.log(`\n══════════ ${fixture.label} · ${runs} consecutive run(s) ══════════`)

  for (let run = 1; run <= runs; run++) {
    const where = `${fixture.label} · run ${run}/${runs} · fixture ${fixtureIndex + 1}/${fixtureCount}`

    progress.start(`build · ${where}`, BUILD_HINT_SECONDS)
    // oxlint-disable-next-line no-await-in-loop -- consecutive runs by design
    const build = await measureBuildPerformance(directory)
    progress.note(`build done in ${build.buildTime.toFixed(1)}s · peak RSS ${build.maxMemoryUsed.toFixed(0)} MB`)
    builds.push(build)

    if (!skipStress) {
      // oxlint-disable-next-line no-await-in-loop -- cool-down
      await delay(2000)
      progress.note(`stress next: autocannon ~${AUTOCANNON_SECONDS}s then artillery ~${ARTILLERY_SECONDS}s`)
      // oxlint-disable-next-line no-await-in-loop -- consecutive stress
      const stress = await stressTestServer(directory, fixture.label, artilleryPath, progress)
      stresses.push(stress)
    }

    // oxlint-disable-next-line no-await-in-loop -- cool-down between repeats
    if (run < runs) await delay(3000)
  }

  return {
    id: fixture.id,
    label: fixture.label,
    build: averagePerformanceResults(builds),
    stress: stresses.length === runs ? averagePerformanceResults(stresses) : undefined,
  }
}

/** generate → per-fixture consecutive runs → mean → report */
export async function runPerformance(args: ResolvedPerfArgs): Promise<FixtureRunResult[]> {
  const fixtures = resolveFixtureSelection(args.only)
  const progress = PerfProgress.printPlan({
    runs: args.runs,
    fixtures: fixtures.length,
    labels: fixtures.map((f) => f.label),
    skipStress: args.skipStress,
  })

  progress.start('generate dictionaries + locale configs', 20)
  writeRuntimeProfile(args.profile)
  writePerfLocales(args.profile, fixtures)
  regenerateLocales(fixtures)
  progress.note(
    `profile: ${args.profile.locales.length} locales, branch ${args.profile.branch}, pages ${args.profile.pages.map((p) => p.name).join('+')}`,
  )

  const md = createMarkdownWriter(args.writeDocs)
  md.init(args.profile, args.runs)
  writeSourceDictionaries(md.write, measureSourceDictionaries(fixtures), args.profile)

  const averaged: FixtureRunResult[] = []
  for (let fi = 0; fi < fixtures.length; fi++) {
    // oxlint-disable-next-line no-await-in-loop -- one fixture block at a time
    averaged.push(await runFixtureConsecutive(fixtures[fi]!, fi, fixtures.length, args.runs, args.skipStress, progress))
    // oxlint-disable-next-line no-await-in-loop -- cool-down between fixtures
    if (fi < fixtures.length - 1) await delay(5000)
  }

  progress.start('write report + charts', 5)
  if (args.writeDocs) {
    await writeDocsReport(md.write, averaged, args.runs, args.profile)
    console.log('Wrote docs report: docs/guide/performance-results.md')
  }
  printConsoleReport(averaged, args)

  return averaged
}
