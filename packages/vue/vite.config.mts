import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

function dualPackageBeforeWriteFile(filePath: string, content: string) {
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
      entry: resolve(import.meta.dirname, 'src/index.ts'),
      name: '@i18n-micro/vue',
      formats: ['cjs', 'es'],
      fileName: (format) => `index.${format === 'cjs' ? 'cjs' : 'mjs'}`,
    },
    rollupOptions: {
      external: ['@i18n-micro/core', '@i18n-micro/types', 'vue', 'vue-router'],
      output: {
        exports: 'named',
      },
    },
    outDir: 'dist',
    sourcemap: true,
  },
  plugins: [
    dts({
      rollupTypes: true,
      entryRoot: 'src',
      outDir: 'dist',
      tsconfigPath: resolve(import.meta.dirname, 'tsconfig.json'),
      beforeWriteFile: dualPackageBeforeWriteFile,
    }),
  ],
})
