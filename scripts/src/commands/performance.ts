import { defineCommand } from 'citty'
import { DEFAULT_KEYS, DEFAULT_LOCALES, resolvePerfArgs } from '../perf/config'
import { runPerformance } from '../perf/run'

export const performanceCommand = defineCommand({
  meta: {
    name: 'performance',
    description: [
      'Build and stress-test plain-nuxt / @nuxtjs/i18n / i18n-micro fixtures.',
      '',
      'Defaults are modest (4 locales, ~10k index leaves, index+page) so a single run is usable',
      'locally. Raise --locales / --keys for regression-radar loads.',
      '',
      'With --only all (default), writes docs/guide/performance-results.md and charts.',
      'With --only plain|i18n|micro, prints a detailed console report only.',
      '',
      'Each fixture runs --runs times consecutively (not interleaved) before the next fixture.',
      '',
      'Examples:',
      '  pnpm -C scripts cli performance',
      '  pnpm -C scripts cli performance --only micro --skip-stress',
      '  pnpm -C scripts cli performance --locales 12 --keys 100000 --runs 3',
      '  pnpm test:performance',
    ].join('\n'),
  },
  args: {
    locales: {
      type: 'string',
      default: String(DEFAULT_LOCALES),
      description: `Number of locales from the shared pool (1–12, default ${DEFAULT_LOCALES})`,
    },
    keys: {
      type: 'string',
      default: String(DEFAULT_KEYS),
      description: `Target leaf keys on the index tree (default ${DEFAULT_KEYS})`,
    },
    only: {
      type: 'string',
      default: 'all',
      description: 'Which fixture(s): plain | i18n | micro | all',
    },
    runs: {
      type: 'string',
      default: '1',
      description: 'Full build+stress repetitions; report means',
    },
    skipStress: {
      type: 'boolean',
      default: false,
      description: 'Only measure builds (skip Artillery/Autocannon)',
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
        skipStress: args.skipStress,
      })
    } catch (error) {
      console.error(error instanceof Error ? error.message : error)
      process.exit(1)
    }

    console.log(
      `Performance: locales=${resolved.profile.locales.length} keys≈${resolved.keys} branch=${resolved.profile.branch} only=${resolved.only} runs=${resolved.runs} skipStress=${resolved.skipStress}`,
    )

    await runPerformance(resolved)
  },
})
