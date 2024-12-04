import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    environment: 'nuxt',
    // globals: true,
    watch: false,
    clearMocks: true,
    mockReset: true,
    restoreMocks: true,
    setupFiles: ['./tests/unit-setup.ts'],
    include: ['./**/*.spec.ts'],
    exclude: [
      './node_modules',
      './dist',
      './automation',
      './.wrangler',
      './.nuxt',
      './coverage',
      './playwright-report',
      './tests/e2e',
      './**/*.e2e.spec.ts',
      './server',
    ],
    environmentOptions: {
      nuxt: {
        domEnvironment: 'happy-dom',
      },
    },
    chaiConfig: {
      truncateThreshold: 0,
    },
  },
})
