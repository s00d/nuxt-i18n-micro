import { realpathSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

// Pin every preact entrypoint to the CJS build. @testing-library/preact is
// externalized and require()s the CJS files natively; aliasing the test/source
// imports to the same CJS files puts everyone in one Node module cache — one
// preact instance, working hooks dispatcher. (Without this the source loads
// the ESM build and the hooks dispatcher never sees the renderer: the classic
// dual-package hazard.)
const preactDir = realpathSync(fileURLToPath(new URL('./node_modules/preact', import.meta.url)))
const cjs = (sub: string, file: string) => join(preactDir, sub, 'dist', file)

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
      { find: 'preact/hooks', replacement: cjs('hooks', 'hooks.js') },
      { find: 'preact/compat', replacement: cjs('compat', 'compat.js') },
      { find: 'preact/jsx-runtime', replacement: cjs('jsx-runtime', 'jsxRuntime.js') },
      { find: 'preact/test-utils', replacement: cjs('test-utils', 'testUtils.js') },
      { find: /^preact$/, replacement: join(preactDir, 'dist', 'preact.js') },
      { find: 'react-dom', replacement: cjs('compat', 'compat.js') },
      { find: /^react$/, replacement: cjs('compat', 'compat.js') },
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
