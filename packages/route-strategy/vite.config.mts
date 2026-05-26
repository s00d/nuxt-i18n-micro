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
      name: '@i18n-micro/route-strategy',
      formats: ['cjs', 'es'],
      fileName: (format) => `index.${format === 'cjs' ? 'cjs' : 'mjs'}`,
    },
    rollupOptions: {
      external: ['@i18n-micro/core', '@i18n-micro/types', '@nuxt/schema', 'node:path', 'path', 'node:fs', 'fs'],
      output: {
        exports: 'named',
      },
    },
  },
  plugins: [dts({ tsconfigPath: 'tsconfig.build.json', beforeWriteFile: dualPackageBeforeWriteFile })],
})
