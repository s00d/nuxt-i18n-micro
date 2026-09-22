import { runPerfSuite } from 'untestutils/perf'
import { createI18nPerfSuite } from './suite'
import type { ResolvedPerfArgs } from './types'

/** generate → consecutive target runs → mean → reporters */
export async function runPerformance(args: ResolvedPerfArgs) {
  // Pass force/cooldowns as options too: published @untestutils/perf@0.6.8 ignores suite.forceBuild
  // and only honors coolDownMs (not coolDownBetween*).
  return runPerfSuite(createI18nPerfSuite(args), {
    runs: args.runs,
    skipLoad: args.skipLoad,
    forceBuild: true,
    coolDownBetweenRunsMs: 3000,
    coolDownBetweenTargetsMs: 5000,
    coolDownMs: 5000,
    postBuildDelayMs: 2000,
  })
}
