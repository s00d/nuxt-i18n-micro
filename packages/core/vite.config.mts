// @ts-nocheck
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

function dualPackageBeforeWriteFile(filePath, content) {
  const base = filePath
    .split('/')
    .pop()
    ?.replace(/\.d\.ts$/, '')
  if (base !== 'index' && base !== 'helpers') {
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
        index: resolve(__dirname, 'src/index.ts'),
        helpers: resolve(__dirname, 'src/helpers-entry.ts'),
      },
      formats: ['cjs', 'es'],
      fileName: (format, entryName) => `${entryName}.${format === 'cjs' ? 'cjs' : 'mjs'}`,
    },
    rollupOptions: {
      external: ['@i18n-micro/types'],
      output: {
        exports: 'named',
      },
    },
  },
  plugins: [dts({ tsconfigPath: 'tsconfig.json', beforeWriteFile: dualPackageBeforeWriteFile })],
})
