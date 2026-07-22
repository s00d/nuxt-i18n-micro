import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    name: 'core-perf',
    environment: 'node',
    include: ['tests/perf-benchmark.test.ts'],
  },
})
