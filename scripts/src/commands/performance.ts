import { defineCommand } from 'citty'
import { DEFAULT_KEYS, DEFAULT_LOCALES, resolvePerfArgs } from '../perf/config'
import { runPerformance } from '../perf/run'

export const performanceCommand = defineCommand({
  meta: {
    name: 'performance',
    description: [
      'Build + load benchmarks for plain-nuxt / @nuxtjs/i18n / i18n-micro (untestutils/perf).',
      '',
      'Examples:',
      '  pnpm -C scripts cli performance --only micro --skip-load',
      '  pnpm -C scripts cli performance --locales 12 --keys 100000 --runs 3',
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
      default: '1',
      description: 'Consecutive build+load repetitions; report means',
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
      })
    } catch (error) {
      console.error(error instanceof Error ? error.message : error)
      process.exit(1)
    }

    console.log(
      `Performance: locales=${resolved.profile.locales.length} keys≈${resolved.keys} branch=${resolved.profile.branch} only=${resolved.only} runs=${resolved.runs} skipLoad=${resolved.skipLoad}`,
    )

    await runPerformance(resolved)
  },
})
