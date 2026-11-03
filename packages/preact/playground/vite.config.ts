import { realpathSync } from 'node:fs'
import { resolve } from 'node:path'
import { i18nDevToolsPlugin } from '@i18n-micro/devtools-ui/vite'
import preact from '@preact/preset-vite'
import { defineConfig } from 'vite'

// the walks measure the app, not the tools around it
const bench = process.env.BENCH === '1'
// the real path: a symlinked one is a second module to the dev server
const here = (path: string) => realpathSync(resolve(import.meta.dirname, 'node_modules', path))

export default defineConfig({
  // no preset aliases: they resolve from the importing file, and the shared pages live in the React playground
  plugins: [
    preact({ reactAliasesEnabled: false }),
    ...(bench ? [] : [i18nDevToolsPlugin({ base: '/__i18n_api', translationDir: 'src/locales', injectButton: true })]),
  ],
  cacheDir: process.env.BENCH_CACHE,
  publicDir: resolve(import.meta.dirname, '../../../benchmark/integrations/public'),
  resolve: {
    alias: [
      { find: '@', replacement: resolve(import.meta.dirname, './src') },
      { find: /^@i18n-micro\/react$/, replacement: here('@i18n-micro/preact/dist/index.mjs') },
      { find: /^react\/jsx-dev-runtime$/, replacement: here('preact/jsx-runtime/dist/jsxRuntime.mjs') },
      { find: /^react\/jsx-runtime$/, replacement: here('preact/jsx-runtime/dist/jsxRuntime.mjs') },
      { find: /^react$/, replacement: here('preact/compat/dist/compat.mjs') },
    ],
  },
  // one copy of preact: the aliases point at files, a prebundled copy would be a second one
  optimizeDeps: { exclude: ['preact', 'preact/hooks', 'preact/compat', 'preact/jsx-runtime', '@i18n-micro/preact', 'wouter-preact'] },
  build: { target: 'esnext' },
  ssr: {
    noExternal: [/^@i18n-micro\//, 'wouter-preact', 'preact', 'preact-render-to-string'],
  },
})
