import { mkdirSync, writeFileSync } from 'node:fs'
import { basename, dirname, resolve } from 'node:path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import solidPlugin from 'vite-plugin-solid'

function dualPackageBeforeWriteFile(filePath: string, content: string) {
  // only the entry declarations at the top of the output dir (index.d.ts, router.d.ts)
  const entry = ['index.d.ts', 'router.d.ts'].includes(basename(filePath))
  if (!entry || resolve(dirname(filePath)) !== resolve(import.meta.dirname, 'dist')) {
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
      afterDiagnostic(diagnostics) {
        const errors = diagnostics.filter((d) => d.category === 1)
        if (errors.length > 0) {
          throw new Error(`[vite:dts] ${errors.length} TypeScript error(s) — build aborted`)
        }
      },
      bundleTypes: true,
      entryRoot: 'src',
      outDir: 'dist',
      tsconfigPath: resolve(import.meta.dirname, 'tsconfig.json'),
      beforeWriteFile: dualPackageBeforeWriteFile,
    }) as unknown as import('vite').Plugin,
  ],
  build: {
    lib: {
      entry: {
        index: resolve(import.meta.dirname, 'src/index.ts'),
        router: resolve(import.meta.dirname, 'src/router/index.ts'),
      },
      name: 'I18nMicroSolid',
      formats: ['es', 'cjs'],
      fileName: (format, entryName) => `${entryName}.${format === 'es' ? 'mjs' : 'cjs'}`,
    },
    rollupOptions: {
      external: ['solid-js', 'solid-js/web', 'solid-js/store', '@solidjs/router', '@i18n-micro/core', '@i18n-micro/core/render', '@i18n-micro/runtime', '@i18n-micro/types'],
      output: {
        exports: 'named',
      },
    },
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
  },
})
