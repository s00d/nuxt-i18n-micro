import { defineConfig } from 'vitest/config'

/**
 * Aggregates every package's vitest.config.ts into one run:
 *   pnpm test:workspaces
 * One vitest process with parallel projects instead of 14 sequential
 * jest/ts-jest cold boots.
 */
export default defineConfig({
  test: {
    projects: ['packages/*/vitest.config.ts'],
  },
})
