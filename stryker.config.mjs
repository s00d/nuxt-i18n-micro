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
  mutate: [`packages/${pkg}/src/**/*.ts`, `!packages/${pkg}/src/**/*.d.ts`, `!packages/${pkg}/src/**/index.ts`, `!packages/${pkg}/src/**/types.ts`],
  reporters: ['clear-text', 'progress', 'json'],
  jsonReporter: { fileName: `test-results/mutation/${pkg}.json` },
  tempDirName: 'test-results/.stryker-tmp',
  // the sandbox needs only this package (siblings resolve through node_modules, unmutated)
  ignorePatterns: ['/*', '!/packages', '/packages/*', `!/packages/${pkg}`, `/packages/${pkg}/dist`, '!/tsconfig*.json', '!/package.json'],
  incremental: true,
  incrementalFile: `test-results/mutation/${pkg}.incremental.json`,
  concurrency: 4,
  timeoutMS: 30_000,
  thresholds: { high: 90, low: 75, break: null },
}
