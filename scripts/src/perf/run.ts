import { runPerfSuite } from 'untestutils/perf'
import { createI18nPerfSuite } from './suite'
import type { ResolvedPerfArgs } from './types'

/** generate → consecutive target runs → mean → reporters */
export async function runPerformance(args: ResolvedPerfArgs) {
  return runPerfSuite(createI18nPerfSuite(args), {
    runs: args.runs,
    skipLoad: args.skipLoad,
  })
}
