import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    name: 'types',
    typecheck: {
      enabled: true,
      include: ['tests/**/*.test.ts'],
      // Without this Vitest uses `tsconfig.json`, which excludes `tests` — the program it
      // builds then contains none of them and every assertion passes vacuously.
      tsconfig: './tsconfig.test.json',
    },
    include: [],
  },
})
