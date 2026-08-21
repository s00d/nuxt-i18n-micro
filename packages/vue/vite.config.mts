import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

function dualPackageBeforeWriteFile(filePath: string, content: string) {
  // Only top-level entry declarations in dist/ (index.d.ts, router.d.ts).
  const parent = dirname(filePath)
  const file = filePath.split(/[/\\]/).pop() ?? ''
  if (!parent.endsWith('dist')) {
    return { filePath, content }
  }
  if (file !== 'index.d.ts' && file !== 'router.d.ts') {
    return { filePath, content }
  }
  const ctsPath = filePath.replace(/\.d\.ts$/, '.d.cts')
  mkdirSync(dirname(ctsPath), { recursive: true })
  writeFileSync(ctsPath, content)
  return { filePath, content }
}

export default defineConfig({
  build: {
    lib: {
      entry: {
        index: resolve(import.meta.dirname, 'src/index.ts'),
        router: resolve(import.meta.dirname, 'src/router/index.ts'),
      },
      formats: ['cjs', 'es'],
      fileName: (format, entryName) => `${entryName}.${format === 'cjs' ? 'cjs' : 'mjs'}`,
    },
    rollupOptions: {
      external: ['@i18n-micro/core', '@i18n-micro/types', '@i18n-micro/utils', 'vue', 'vue-router'],
      output: {
        exports: 'named',
      },
    },
    outDir: 'dist',
    sourcemap: true,
  },
  plugins: [
    dts({
      afterDiagnostic(diagnostics) {
        const errors = diagnostics.filter((d) => d.category === 1)
        if (errors.length > 0) {
          throw new Error(`[vite:dts] ${errors.length} TypeScript error(s) — build aborted`)
        }
      },
      rollupTypes: true,
      entryRoot: 'src',
      outDir: 'dist',
      tsconfigPath: resolve(import.meta.dirname, 'tsconfig.json'),
      beforeWriteFile: dualPackageBeforeWriteFile,
    }),
  ],
})
