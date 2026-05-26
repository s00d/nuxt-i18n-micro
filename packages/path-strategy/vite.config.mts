import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

const rootDir = fileURLToPath(new URL('.', import.meta.url))

const libEntries = {
  index: resolve(rootDir, 'src/index.ts'),
  'prefix-strategy': resolve(rootDir, 'src/strategies/prefix.ts'),
  'no-prefix-strategy': resolve(rootDir, 'src/strategies/no-prefix.ts'),
  'prefix-except-default-strategy': resolve(rootDir, 'src/strategies/prefix-except-default.ts'),
  'prefix-and-default-strategy': resolve(rootDir, 'src/strategies/prefix-and-default.ts'),
  types: resolve(rootDir, 'src/types.ts'),
}

function isPublishedDeclaration(filePath: string) {
  const normalized = filePath.replace(/\\/g, '/')
  if (normalized.endsWith('/index.d.ts') || normalized.endsWith('/types.d.ts')) return true
  return /\/strategies\/(prefix|no-prefix|prefix-except-default|prefix-and-default)\.d\.ts$/.test(normalized)
}

function beforeWriteDeclaration(filePath: string, content: string) {
  if (isPublishedDeclaration(filePath)) {
    const ctsPath = filePath.replace(/\.d\.ts$/, '.d.cts')
    mkdirSync(dirname(ctsPath), { recursive: true })
    writeFileSync(ctsPath, content)
  }
  return { filePath, content }
}

/** Stable shared chunks (no content hash in file names). */
function manualChunks(id: string): string | undefined {
  const normalized = id.replace(/\\/g, '/')
  if (normalized.includes('/strategies/base-strategy') || normalized.endsWith('base-strategy.ts')) {
    return 'base-strategy'
  }
  if (normalized.includes('/strategies/common') || normalized.endsWith('strategies/common.ts')) {
    return 'common'
  }
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
      external: ['@i18n-micro/types'],
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
