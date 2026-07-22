import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    name: 'path-strategy-perf',
    environment: 'node',
    include: ['tests/perf-benchmark.test.ts'],
  },
})
