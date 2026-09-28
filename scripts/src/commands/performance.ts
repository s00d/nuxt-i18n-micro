import { defineCommand } from 'citty'
import { DEFAULT_COOL, DEFAULT_KEYS, DEFAULT_LOAD, DEFAULT_LOCALES, DEFAULT_RUNS, resolvePerfArgs } from '../perf/config'
import { describeLoadProfile } from '../perf/load'
import { runPerformance } from '../perf/run'

export const performanceCommand = defineCommand({
  meta: {
    name: 'performance',
    description: [
      'Build + load benchmarks for plain-nuxt / @nuxtjs/i18n / i18n-micro (untestutils/perf).',
      '',
      'Measures Nitro `.output/server/index.mjs` with a real `nuxt-i18n-micro` dist (not jiti stub).',
      '',
      'Examples:',
      '  pnpm -C scripts cli performance --only micro --skip-load',
      '  pnpm -C scripts cli performance --locales 12 --keys 100000',
      '  pnpm -C scripts cli performance --load short --cool fast',
      '  pnpm -C scripts cli performance --load full --only all   # docs regen',
      '  pnpm -C scripts cli performance --runs 1   # quick single pass',
      '  pnpm test:performance',
    ].join('\n'),
  },
  args: {
    locales: {
      type: 'string',
      default: String(DEFAULT_LOCALES),
      description: `Locales from shared pool (1–12, default ${DEFAULT_LOCALES})`,
    },
    keys: {
      type: 'string',
      default: String(DEFAULT_KEYS),
      description: `Target leaf keys on index tree (default ${DEFAULT_KEYS})`,
    },
    only: {
      type: 'string',
      default: 'all',
      description: 'plain | i18n | micro | all',
    },
    runs: {
      type: 'string',
      default: String(DEFAULT_RUNS),
      description: `Consecutive build+load repetitions; report means (default ${DEFAULT_RUNS})`,
    },
    load: {
      type: 'string',
      default: DEFAULT_LOAD,
      description: `Artillery window: short | mid | full (default ${DEFAULT_LOAD}; use full for published docs)`,
    },
    cool: {
      type: 'string',
      default: DEFAULT_COOL,
      description: `Cool-downs: fast | strict (default ${DEFAULT_COOL})`,
    },
    skipLoad: {
      type: 'boolean',
      default: false,
      description: 'Build-only (skip Artillery load)',
    },
  },
  async setup({ args }) {
    let resolved
    try {
      resolved = resolvePerfArgs({
        locales: args.locales,
        keys: args.keys,
        only: args.only,
        runs: args.runs,
        skipLoad: args.skipLoad,
        load: args.load,
        cool: args.cool,
      })
    } catch (error) {
      console.error(error instanceof Error ? error.message : error)
      process.exit(1)
    }

    console.log(
      `Performance: locales=${resolved.profile.locales.length} keys≈${resolved.keys} branch=${resolved.profile.branch} only=${resolved.only} runs=${resolved.runs} load=${resolved.load} (${describeLoadProfile(resolved.load)}) cool=${resolved.cool} skipLoad=${resolved.skipLoad}`,
    )

    // Host workarounds so Artillery docs regen can finish:
    // 1) Artillery in-process runner calls process.exit() — swallow that.
    // 2) untestutils stop() waits on an unref'd interval → empty loop / exit 13.
    // 3) process.kill(-pid) process-group kill can take down the suite — kill leader only.
    const nativeExit = process.exit.bind(process)
    process.exit = ((code?: number) => {
      const stack = new Error().stack ?? ''
      if (stack.includes('artillery') || stack.includes('suggestedExitCode')) {
        if (typeof code === 'number' && code !== 0) process.exitCode = code
        return undefined as never
      }
      return nativeExit(code)
    }) as typeof process.exit

    const probe = setTimeout(() => {}, 0)
    const timerProto = Object.getPrototypeOf(probe) as {
      unref: (this: NodeJS.Timeout) => NodeJS.Timeout
    }
    clearTimeout(probe)
    const nativeUnref = timerProto.unref
    timerProto.unref = function patchedUnref(this: NodeJS.Timeout) {
      return this
    }

    const nativeKill = process.kill.bind(process)
    process.kill = ((pid: number, signal?: NodeJS.Signals | number) => {
      if (typeof pid === 'number' && pid < 0) {
        return nativeKill(-pid, signal)
      }
      return nativeKill(pid, signal)
    }) as typeof process.kill

    try {
      await runPerformance(resolved)
    } finally {
      timerProto.unref = nativeUnref
      process.kill = nativeKill
      process.exit = nativeExit
    }
  },
})
