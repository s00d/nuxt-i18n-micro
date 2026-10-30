import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    name: 'cli',
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    exclude: ['**/node_modules/**', 'tests/fixtures/**'],
    testTimeout: 60_000,
    // Each case boots the built bin against its own project copy.
    maxConcurrency: 4,
  },
})
