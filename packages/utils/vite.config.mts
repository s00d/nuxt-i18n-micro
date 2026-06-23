import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

const rootDir = fileURLToPath(new URL('.', import.meta.url))

const libEntries = {
  'deep-merge': resolve(rootDir, 'src/deep-merge.ts'),
  'merge-source': resolve(rootDir, 'src/merge-source.ts'),
  'source-loader': resolve(rootDir, 'src/source-loader.ts'),
  'payload-config': resolve(rootDir, 'src/payload-config.ts'),
  'payload-url': resolve(rootDir, 'src/payload-url.ts'),
  'payload-fetch': resolve(rootDir, 'src/payload-fetch.ts'),
  'payload-stats': resolve(rootDir, 'src/payload-stats.ts'),
  'accept-language': resolve(rootDir, 'src/accept-language.ts'),
  'resolve-locale': resolve(rootDir, 'src/resolve-locale.ts'),
  'resolve-og-locale': resolve(rootDir, 'src/resolve-og-locale.ts'),
  'active-locales': resolve(rootDir, 'src/active-locales.ts'),
  cookie: resolve(rootDir, 'src/cookie.ts'),
  'cache-control': resolve(rootDir, 'src/cache-control.ts'),
  'parse-path': resolve(rootDir, 'src/parse-path.ts'),
  'route-pattern': resolve(rootDir, 'src/route-pattern.ts'),
  route: resolve(rootDir, 'src/route.ts'),
  'runtime-config': resolve(rootDir, 'src/runtime-config.ts'),
  normalize: resolve(rootDir, 'src/normalize.ts'),
  build: resolve(rootDir, 'src/build.ts'),
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
  if (normalized.endsWith('/src/payload-config.ts')) return 'payload-config'
  if (normalized.endsWith('/src/payload-url.ts')) return 'payload-url'
  if (normalized.endsWith('/src/route-pattern.ts')) return 'route-pattern'
  return undefined
}

export default defineConfig({
  plugins: [
    dts({
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
