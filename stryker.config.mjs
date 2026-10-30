// Mutation testing: does the suite notice when the code is wrong? Stryker changes the source
// (`<` → `<=`, a branch removed, a string emptied) and reruns the tests that cover the change;
// a mutant that survives is a behaviour no test pins.
//
//   MUTATE_PACKAGE=core pnpm run test:mutation
//
// Packages only: their tests run the source in-process. The e2e suites run prebuilt Nuxt
// fixtures, which a mutant never reaches.
const pkg = process.env.MUTATE_PACKAGE || 'core'

/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
export default {
  testRunner: 'vitest',
  plugins: ['@stryker-mutator/vitest-runner'],
  vitest: { configFile: `packages/${pkg}/vitest.config.ts`, dir: `packages/${pkg}` },
  mutate: [`packages/${pkg}/src/**/*.{ts,tsx}`, `!packages/${pkg}/src/**/*.d.ts`, `!packages/${pkg}/src/**/types.ts`],
  reporters: ['clear-text', 'progress', 'json'],
  jsonReporter: { fileName: `test-results/mutation/${pkg}.json` },
  tempDirName: 'test-results/.stryker-tmp',
  // the sandbox needs this package plus the siblings' sources (framework packages alias them to
  // src in their vitest config); siblings are copied unmutated, their dist resolves via node_modules
  ignorePatterns: ['/*', '!/packages', '/packages/*/*', '!/packages/*/src', '!/packages/*/package.json', `!/packages/${pkg}/**`, `/packages/${pkg}/dist`, '**/node_modules', `/packages/${pkg}/playground`, '!/tsconfig*.json', '!/package.json', '!/.nuxt', '/.nuxt/*', '!/.nuxt/tsconfig*.json'],
  incremental: true,
  incrementalFile: `test-results/mutation/${pkg}.incremental.json`,
  // MUTATE_ALL_KILLERS=1: run every covering test (not just until one kills), so the report says
  // which tests catch each mutant — a test whose mutants others all catch too adds nothing
  ...(process.env.MUTATE_ALL_KILLERS === '1' ? { disableBail: true, incremental: false } : {}),
  concurrency: 4,
  timeoutMS: 30_000,
  thresholds: { high: 90, low: 75, break: null },
}
