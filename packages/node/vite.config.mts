// @ts-nocheck
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

function dualPackageBeforeWriteFile(filePath, content) {
  if (!filePath.endsWith('index.d.ts')) {
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
      entry: resolve(__dirname, 'src/index.ts'),
      name: '@i18n-micro/node',
      formats: ['cjs', 'es'],
      fileName: (format) => `index.${format === 'cjs' ? 'cjs' : 'mjs'}`,
    },
    rollupOptions: {
      // Важно: не бандлим зависимости, они должны ставиться через npm
      external: ['@i18n-micro/core', '@i18n-micro/types', '@i18n-micro/utils/parse-path', 'node:fs/promises', 'node:path', 'node:fs'],
    },
    // Для Node.js таргета
    target: 'node18',
    outDir: 'dist',
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
      tsconfigPath: 'tsconfig.json',
      beforeWriteFile: dualPackageBeforeWriteFile,
    }),
  ],
})
