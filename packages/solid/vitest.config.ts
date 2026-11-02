import { fileURLToPath } from 'node:url'
import solid from 'vite-plugin-solid'
import { defineConfig } from 'vitest/config'

// Real Solid, compiled the way apps compile it (babel-preset-solid via vite-plugin-solid), so
// component tests see Solid's own reactivity and context rules.
export default defineConfig({
  plugins: [
    solid(),
    // vite-plugin-solid adds jest-dom as a setup file when it can resolve it; the tests do not use
    // its matchers, and the Stryker sandbox cannot load it
    {
      name: 'no-jest-dom-setup',
      config(config: { test?: { setupFiles?: string | string[] } }) {
        const files = config.test?.setupFiles
        if (config.test && files) config.test.setupFiles = [files].flat().filter((file) => !file.includes('jest-dom'))
      },
    },
  ],
  resolve: {
    conditions: ['development', 'browser'],
    alias: [
      { find: /^@i18n-micro\/core\/render$/, replacement: fileURLToPath(new URL('../core/src/render.ts', import.meta.url)) },
      { find: /^@i18n-micro\/core$/, replacement: fileURLToPath(new URL('../core/src/index.ts', import.meta.url)) },
      { find: '@i18n-micro/types', replacement: fileURLToPath(new URL('../types/src/index.ts', import.meta.url)) },
    ],
  },
  test: {
    name: 'solid',
    globals: true,
    environment: 'jsdom',
    // one Solid instance: the router and solid-js/web go through Vite with the browser build
    server: { deps: { inline: [/solid-js/, /@solidjs\/router/] } },
    include: ['tests/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['**/node_modules/**', 'tests/publish/**', '**/perf-benchmark*', '**/__perf__/**'],
  },
})
