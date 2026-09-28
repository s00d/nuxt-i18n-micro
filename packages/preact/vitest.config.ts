import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

// Pin every preact entrypoint to the file require() loads. @testing-library/preact
// is externalized and require()s preact natively; aliasing the test/source
// imports to the same files puts everyone in one Node module cache — one
// preact instance, working hooks dispatcher. (Without this the source loads
// the ESM build and the hooks dispatcher never sees the renderer: the classic
// dual-package hazard.) Preact 10 resolves to its CJS build; Preact 11 ships
// only ESM, which require() loads natively.
const { resolve: preactEntry } = createRequire(import.meta.url)

export default defineConfig({
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: 'preact',
  },
  resolve: {
    alias: [
      { find: '@i18n-micro/core', replacement: fileURLToPath(new URL('../core/src/index.ts', import.meta.url)) },
      { find: '@i18n-micro/types', replacement: fileURLToPath(new URL('../types/src/index.ts', import.meta.url)) },
      { find: '@i18n-micro/devtools-ui', replacement: fileURLToPath(new URL('./tests/mocks/devtools-ui-mock.ts', import.meta.url)) },
      { find: 'preact/hooks', replacement: preactEntry('preact/hooks') },
      { find: 'preact/compat', replacement: preactEntry('preact/compat') },
      { find: 'preact/jsx-runtime', replacement: preactEntry('preact/jsx-runtime') },
      { find: 'preact/test-utils', replacement: preactEntry('preact/test-utils') },
      { find: /^preact$/, replacement: preactEntry('preact') },
      { find: 'react-dom', replacement: preactEntry('preact/compat') },
      { find: /^react$/, replacement: preactEntry('preact/compat') },
    ],
  },
  test: {
    name: 'preact',
    globals: true,
    environment: 'jsdom',
    include: ['tests/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['**/node_modules/**', 'tests/publish/**', '**/perf-benchmark*', '**/__perf__/**'],
  },
})
