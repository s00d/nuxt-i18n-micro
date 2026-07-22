import { defineConfig } from 'vitest/config'

/**
 * Root Vitest config. One runner for everything — unit/build tests, browser
 * e2e specs and every workspace package — via projects. `vitest run` runs them
 * all; target one with `--project unit|e2e` (or a package name).
 *
 * The performance suite (test/performance.test.ts, ~27 min) is intentionally
 * NOT a default project — it stays in vitest.performance.config.ts and is run
 * on demand via `pnpm test:performance`.
 */
export default defineConfig({
  test: {
    projects: ['./vitest.unit.config.ts', './vitest.e2e.config.ts', 'packages/*/vitest.config.ts'],
  },
})
