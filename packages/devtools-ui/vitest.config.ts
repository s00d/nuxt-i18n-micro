import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    name: 'devtools-ui',
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    exclude: ['tests/publish/**'],
  },
})
