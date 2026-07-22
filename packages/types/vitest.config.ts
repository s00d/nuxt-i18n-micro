import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    name: 'types',
    typecheck: {
      enabled: true,
      include: ['tests/**/*.test.ts'],
    },
    include: [],
  },
})
