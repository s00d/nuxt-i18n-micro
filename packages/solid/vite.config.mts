import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import solidPlugin from 'vite-plugin-solid'

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
  plugins: [
    solidPlugin(),
    dts({
      rollupTypes: true,
      entryRoot: 'src',
      outDir: 'dist',
      tsconfigPath: resolve(__dirname, 'tsconfig.json'),
      beforeWriteFile: dualPackageBeforeWriteFile,
    }) as unknown as import('vite').Plugin,
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'I18nMicroSolid',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'mjs' : 'cjs'}`,
    },
    rollupOptions: {
      external: ['solid-js', 'solid-js/web', 'solid-js/store', '@solidjs/router', '@i18n-micro/core', '@i18n-micro/types'],
      output: {
        exports: 'named',
      },
    },
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
  },
})
