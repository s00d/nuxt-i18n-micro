import { defineConfig } from 'vitest/config'

/**
 * Root Vitest config. One runner for everything — fast unit tests, build-heavy
 * integration suites, browser e2e specs and every workspace package — via
 * projects. `vitest run` runs them all; target one with
 * `--project unit|integration|e2e` (or a package name).
 *
 * Performance benchmarks are a citty CLI (`pnpm test:performance` →
 * `pnpm -C scripts cli performance`), not a Vitest project.
 */
export default defineConfig({
  test: {
    projects: ['./vitest.unit.config.ts', './vitest.integration.config.ts', './vitest.e2e.config.ts', 'packages/*/vitest.config.ts'],
  },
})
