import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    watch: false,
    setupFiles: ['./tests/unit-setup.ts'],
    include: ['./**/*.spec.ts'],
  },
})
