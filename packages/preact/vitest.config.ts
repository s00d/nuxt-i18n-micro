import { createRequire } from 'node:module'
import { realpathSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

/**
 * Dual-package hazard: `@testing-library/preact` v3 is ESM and resolves `preact` via
 * package exports, while our sources also import `preact`/`preact/hooks`. If those
 * resolve to different files (CJS vs ESM, or `"source"` vs dist), hooks get a
 * different options object → `Cannot read properties of undefined (reading 'context')`.
 *
 * Fix: pin every preact entry to the same ESM dist build AND inline TL so its
 * imports go through the same aliases.
 */
const require = createRequire(import.meta.url)
const preactDir = realpathSync(dirname(require.resolve('preact/package.json')))
const esm = (sub: string, file: string) => join(preactDir, sub, 'dist', file)

export default defineConfig({
  // Vite 8 / Vitest 5 transform via oxc (esbuild jsx options are ignored with a warning).
  oxc: {
    jsx: {
      runtime: 'automatic',
      importSource: 'preact',
    },
  },
  resolve: {
    // Prefer package "module"/"main"; never "source" (preact points source at src/).
    mainFields: ['module', 'main'],
    alias: [
      { find: '@i18n-micro/core', replacement: fileURLToPath(new URL('../core/src/index.ts', import.meta.url)) },
      { find: '@i18n-micro/types', replacement: fileURLToPath(new URL('../types/src/index.ts', import.meta.url)) },
      { find: '@i18n-micro/devtools-ui', replacement: fileURLToPath(new URL('./tests/mocks/devtools-ui-mock.ts', import.meta.url)) },
      { find: 'preact/hooks', replacement: esm('hooks', 'hooks.module.js') },
      { find: 'preact/compat', replacement: esm('compat', 'compat.module.js') },
      { find: 'preact/jsx-runtime', replacement: esm('jsx-runtime', 'jsxRuntime.module.js') },
      { find: 'preact/jsx-dev-runtime', replacement: esm('jsx-runtime', 'jsxRuntime.module.js') },
      { find: 'preact/test-utils', replacement: esm('test-utils', 'testUtils.module.js') },
      { find: /^preact$/, replacement: join(preactDir, 'dist', 'preact.module.js') },
      { find: 'react-dom', replacement: esm('compat', 'compat.module.js') },
      { find: /^react$/, replacement: esm('compat', 'compat.module.js') },
    ],
  },
  optimizeDeps: {
    include: ['preact', 'preact/hooks', 'preact/compat', 'preact/jsx-runtime', '@testing-library/preact'],
  },
  ssr: {
    noExternal: ['preact', 'preact/hooks', 'preact/compat', '@testing-library/preact'],
  },
  test: {
    name: 'preact',
    globals: true,
    environment: 'jsdom',
    include: ['tests/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['**/node_modules/**', 'tests/publish/**', '**/perf-benchmark*', '**/__perf__/**'],
    server: {
      deps: {
        inline: ['preact', 'preact/hooks', 'preact/compat', '@testing-library/preact'],
      },
    },
  },
})
