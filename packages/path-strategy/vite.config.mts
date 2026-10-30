import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

const rootDir = import.meta.dirname

const libEntries = {
  index: resolve(rootDir, 'src/index.ts'),
  types: resolve(rootDir, 'src/types.ts'),
}

function isPublishedDeclaration(filePath: string) {
  const normalized = filePath.replace(/\\/g, '/')
  return normalized.endsWith('/index.d.ts') || normalized.endsWith('/types.d.ts')
}

function beforeWriteDeclaration(filePath: string, content: string) {
  if (isPublishedDeclaration(filePath)) {
    const ctsPath = filePath.replace(/\.d\.ts$/, '.d.cts')
    mkdirSync(dirname(ctsPath), { recursive: true })
    writeFileSync(ctsPath, content)
  }
  return { filePath, content }
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
      external: ['@i18n-micro/types'],
      output: [
        {
          format: 'es',
          entryFileNames: '[name].mjs',
          chunkFileNames: '[name].js',
          exports: 'named',
        },
        {
          format: 'cjs',
          entryFileNames: '[name].cjs',
          chunkFileNames: '[name].cjs',
          exports: 'named',
        },
      ],
      onwarn(warning, warn) {
        if (warning.code === 'EMPTY_BUNDLE') return
        warn(warning)
      },
    },
  },
})
