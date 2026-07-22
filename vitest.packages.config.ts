import { defineConfig } from 'vitest/config'

/**
 * Workspace package tests only (`packages/*`). Used by the CI `test:packages` step, which
 * runs in isolation — without loading the root config's e2e project (whose
 * globalSetup would otherwise build every shared fixture) or needing `.nuxt`.
 */
export default defineConfig({
  test: {
    projects: ['packages/*/vitest.config.ts'],
  },
})
