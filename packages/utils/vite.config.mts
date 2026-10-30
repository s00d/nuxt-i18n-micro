import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

const rootDir = import.meta.dirname

const libEntries = {
  'deep-merge': resolve(rootDir, 'src/deep-merge.ts'),
  'merge-source': resolve(rootDir, 'src/merge-source.ts'),
  'source-loader': resolve(rootDir, 'src/source-loader.ts'),
  'payload-url': resolve(rootDir, 'src/payload-url.ts'),
  'payload-fetch': resolve(rootDir, 'src/payload-fetch.ts'),
  'accept-language': resolve(rootDir, 'src/accept-language.ts'),
  'resolve-locale': resolve(rootDir, 'src/resolve-locale.ts'),
  'auto-detect-path': resolve(rootDir, 'src/auto-detect-path.ts'),
  'split-locale-routes': resolve(rootDir, 'src/split-locale-routes.ts'),
  'resolve-og-locale': resolve(rootDir, 'src/resolve-og-locale.ts'),
  'resolve-hreflang': resolve(rootDir, 'src/resolve-hreflang.ts'),
  'merge-i18n-head': resolve(rootDir, 'src/merge-i18n-head.ts'),
  'active-locales': resolve(rootDir, 'src/active-locales.ts'),
  domains: resolve(rootDir, 'src/domains.ts'),
  cookie: resolve(rootDir, 'src/cookie.ts'),
  'cache-control': resolve(rootDir, 'src/cache-control.ts'),
  'parse-path': resolve(rootDir, 'src/parse-path.ts'),
  'runtime-config': resolve(rootDir, 'src/runtime-config.ts'),
  normalize: resolve(rootDir, 'src/normalize.ts'),
  'app-path': resolve(rootDir, 'src/app-path.ts'),
} as const

const publishedEntryNames = new Set(Object.keys(libEntries))

function isPublishedDeclaration(filePath: string) {
  const normalized = filePath.replace(/\\/g, '/')
  const base = normalized
    .split('/')
    .pop()
    ?.replace(/\.d\.ts$/, '')
  return base !== undefined && publishedEntryNames.has(base)
}

function beforeWriteDeclaration(filePath: string, content: string) {
  if (isPublishedDeclaration(filePath)) {
    const ctsPath = filePath.replace(/\.d\.ts$/, '.d.cts')
    mkdirSync(dirname(ctsPath), { recursive: true })
    writeFileSync(ctsPath, content)
  }
  return { filePath, content }
}

function manualChunks(id: string): string | undefined {
  const normalized = id.replace(/\\/g, '/')
  if (normalized.endsWith('/src/deep-merge.ts')) return 'deep-merge'
  if (normalized.endsWith('/src/accept-language.ts')) return 'accept-language'
  if (normalized.endsWith('/src/payload-url.ts')) return 'payload-url'
  return undefined
}

export default defineConfig({
  plugins: [
    dts({
      afterDiagnostic(diagnostics) {
        const errors = diagnostics.filter((d) => d.category === 1)
        if (errors.length > 0) {
          throw new Error(`[vite:dts] ${errors.length} TypeScript error(s) — build aborted`)
        }
      },
      tsconfigPath: resolve(rootDir, 'tsconfig.build.json'),
      entryRoot: resolve(rootDir, 'src'),
      outDir: resolve(rootDir, 'dist'),
      beforeWriteFile: beforeWriteDeclaration,
    }),
  ],
  build: {
    emptyOutDir: true,
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    lib: {
      entry: libEntries,
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: ['@i18n-micro/types', 'globby', /^node:/],
      output: [
        {
          format: 'es',
          entryFileNames: '[name].mjs',
          chunkFileNames: '[name].js',
          exports: 'named',
          manualChunks,
        },
        {
          format: 'cjs',
          entryFileNames: '[name].cjs',
          chunkFileNames: '[name].cjs',
          exports: 'named',
          manualChunks,
        },
      ],
      onwarn(warning, warn) {
        if (warning.code === 'EMPTY_BUNDLE') return
        warn(warning)
      },
    },
  },
})
