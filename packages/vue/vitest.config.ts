import { fileURLToPath } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'

const nuxtStub = fileURLToPath(new URL('tests/characterization/nuxt-stub.ts', import.meta.url))

// plugin-vue and the stub: parity tests run the Nuxt module's real .vue components next to ours.
export default defineConfig({
  plugins: [vue()],
  resolve: {
    dedupe: ['vue', 'vue-router'],
    alias: [
      { find: '#imports', replacement: nuxtStub },
      { find: '#app', replacement: nuxtStub },
      { find: /^@i18n-micro\/utils\/(.*)$/, replacement: fileURLToPath(new URL('../utils/src/', import.meta.url)) + '$1' },
      { find: /^@i18n-micro\/path-strategy$/, replacement: fileURLToPath(new URL('../path-strategy/src/index.ts', import.meta.url)) },
      { find: '@i18n-micro/core/render', replacement: fileURLToPath(new URL('../core/src/render.ts', import.meta.url)) },
      { find: '@i18n-micro/core/helpers', replacement: fileURLToPath(new URL('../core/src/helpers.ts', import.meta.url)) },
      { find: '@i18n-micro/core', replacement: fileURLToPath(new URL('../core/src/index.ts', import.meta.url)) },
      { find: '@i18n-micro/types', replacement: fileURLToPath(new URL('../types/src/index.ts', import.meta.url)) },
    ],
  },
  test: {
    name: 'vue',
    globals: true,
    environment: 'jsdom',
    include: ['tests/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['**/node_modules/**', 'tests/publish/**', '**/perf-benchmark*', '**/__perf__/**'],
  },
})
