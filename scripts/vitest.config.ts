import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    name: 'scripts',
    include: ['test/**/*.test.ts'],
    environment: 'node',
  },
})
