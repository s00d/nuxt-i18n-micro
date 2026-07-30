import { defineConfig } from 'vitest/config'
import { INTEGRATION_TESTS, OPT_IN_TESTS } from './test/setup/heavy-tests'

/**
 * Unit tests in `test/` — no Nuxt build, no browser, no servers. The tests themselves run
 * in well under a second; type checking the project they assert against is what the rest of
 * the time goes to. `vitest run --typecheck.enabled=false` skips it for a tight loop.
 *
 * Build-spawning suites live in `vitest.integration.config.ts` (see
 * test/setup/heavy-tests.ts for the shared list).
 */
export default defineConfig({
  test: {
    name: 'unit',
    include: ['test/**/*.test.ts'],
    exclude: [...INTEGRATION_TESTS, ...OPT_IN_TESTS, 'test/fixtures/**'],
    // `expectTypeOf` compiles to nothing, so a type test only asserts anything when a
    // program that contains it is built. Without this the default `**/*.test-d.ts` matched
    // no file here and every type assertion in `test/` passed vacuously under `vitest`.
    // The root project, not a narrowed one: it extends `.nuxt/tsconfig.json`, and a custom
    // `include` drops the generated augmentations with it — `NuxtConfig.i18n` and
    // `NuxtConfig.nitro` then stop existing and every fixture config fails to compile.
    typecheck: {
      enabled: true,
      include: ['test/**/*.test.ts'],
      tsconfig: './tsconfig.json',
    },
    testTimeout: 30_000,
    pool: 'forks',
  },
})
