// Mutation testing: does the suite notice when the code is wrong? Stryker changes the source
// (`<` → `<=`, a branch removed, a string emptied) and reruns the tests that cover the change;
// a mutant that survives is a behaviour no test pins.
//
//   MUTATE_PACKAGE=core pnpm run test:mutation
//   MUTATE_PACKAGE=root pnpm run test:mutation   # the Nuxt module's `src/` against test/ unit tests
//
// Packages and the root module's in-process code only. The integration and e2e suites run
// prebuilt Nuxt fixtures, which a mutant never reaches.
import { mkdirSync, writeFileSync } from 'node:fs'

const pkg = process.env.MUTATE_PACKAGE || 'core'

// root: `src/` minus what only runs inside a Nuxt build or app — module.ts (defineNuxtModule
// setup + app templates) and src/runtime/** (plugins, composables, components, middleware, nitro
// routes/plugins) — except the runtime utils the unit tests import directly.
const ROOT_MUTATE = [
  'src/*.ts',
  'src/build/**/*.ts',
  '!src/module.ts',
  '!src/**/*.d.ts',
  'src/runtime/utils/nuxt-i18n.ts',
  'src/runtime/utils/storage.ts',
  'src/runtime/utils/trailing-slash.ts',
  'src/runtime/server/utils/translation-watcher.ts',
]

// The unit config type-checks test/ (tsc over the Nuxt project): instrumented mutants do not
// type-check, and it would rerun per mutant. The runner takes no overrides, so a wrapper config
// turns typecheck off. Stryker runs vitest in the sandbox, so `root` is the sandbox cwd. The
// wrapper's path is absolute because `test-results` is kept out of the sandbox (`/*` below).
function rootVitestConfig() {
  const file = 'test-results/mutation/vitest.root.config.mjs'
  mkdirSync('test-results/mutation', { recursive: true })
  writeFileSync(
    file,
    `import { mergeConfig } from 'vitest/config'\nimport base from '../../vitest.unit.config.ts'\n` +
      `export default mergeConfig(base, { test: { root: process.cwd(), typecheck: { enabled: false } } })\n`,
  )
  return `${process.cwd()}/${file}`
}

const target =
  pkg === 'root'
    ? {
        vitest: { configFile: rootVitestConfig() },
        mutate: ROOT_MUTATE,
        ignorePatterns: [
          '/*',
          '!/src',
          '!/test',
          '/test/fixtures',
          '!/tsconfig*.json',
          '!/package.json',
          '!/.nuxt',
          '/.nuxt/*',
          '!/.nuxt/tsconfig*.json',
        ],
      }
    : {
        vitest: { configFile: `packages/${pkg}/vitest.config.ts`, dir: `packages/${pkg}` },
        mutate: [`packages/${pkg}/src/**/*.{ts,tsx}`, `!packages/${pkg}/src/**/*.d.ts`, `!packages/${pkg}/src/**/types.ts`],
        // the sandbox needs this package plus the siblings' sources (framework packages alias them to
        // src in their vitest config); siblings are copied unmutated, their dist resolves via node_modules
        ignorePatterns: [
          '/*',
          '!/packages',
          '/packages/*/*',
          '!/packages/*/src',
          '!/packages/*/package.json',
          `!/packages/${pkg}/**`,
          `/packages/${pkg}/dist`,
          '**/node_modules',
          `/packages/${pkg}/playground`,
          '!/tsconfig*.json',
          '!/package.json',
          '!/.nuxt',
          '/.nuxt/*',
          '!/.nuxt/tsconfig*.json',
        ],
      }

/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
export default {
  testRunner: 'vitest',
  plugins: ['@stryker-mutator/vitest-runner'],
  ...target,
  reporters: ['clear-text', 'progress', 'json'],
  jsonReporter: { fileName: `test-results/mutation/${pkg}.json` },
  // per package, so runs for different packages can go at the same time
  tempDirName: `test-results/.stryker-tmp/${pkg}`,
  incremental: true,
  incrementalFile: `test-results/mutation/${pkg}.incremental.json`,
  // MUTATE_ALL_KILLERS=1: run every covering test (not just until one kills), so the report says
  // which tests catch each mutant — a test whose mutants others all catch too adds nothing
  ...(process.env.MUTATE_ALL_KILLERS === '1' ? { disableBail: true, incremental: false } : {}),
  concurrency: 4,
  timeoutMS: 30_000,
  thresholds: { high: 90, low: 75, break: null },
}
