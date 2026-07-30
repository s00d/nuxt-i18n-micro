import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import react from '@vitejs/plugin-react'
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
  plugins: [
    react(),
    dts({
      afterDiagnostic(diagnostics) {
        const errors = diagnostics.filter((d) => d.category === 1)
        if (errors.length > 0) {
          throw new Error(`[vite:dts] ${errors.length} TypeScript error(s) — build aborted`)
        }
      },
      rollupTypes: true,
      entryRoot: 'src',
      outDir: 'dist/react',
      tsconfigPath: resolve(__dirname, 'tsconfig.build.json'),
      include: ['src/**/*.ts', 'src/**/*.tsx'],
      exclude: ['tests/**/*'],
      beforeWriteFile: dualPackageBeforeWriteFile,
    }) as unknown as import('vite').Plugin,
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'I18nMicroReact',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'mjs' : 'cjs'}`,
    },
    rollupOptions: {
      // Для React сборки мы помечаем все зависимости как внешние
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        'react-router-dom',
        '@i18n-micro/core',
        '@i18n-micro/types',
        'use-sync-external-store',
        'use-sync-external-store/shim',
      ],
      output: {
        exports: 'named',
      },
    },
    outDir: 'dist/react',
    emptyOutDir: true,
    sourcemap: true,
  },
})
