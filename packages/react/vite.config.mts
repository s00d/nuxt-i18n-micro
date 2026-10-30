import { mkdirSync, writeFileSync } from 'node:fs'
import { basename, dirname, resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

function dualPackageBeforeWriteFile(filePath: string, content: string) {
  // only the entry declarations at the top of the output dir (index.d.ts, router.d.ts)
  const entry = ['index.d.ts', 'router.d.ts', 'server.d.ts'].includes(basename(filePath))
  if (!entry || resolve(dirname(filePath)) !== resolve(import.meta.dirname, 'dist/react')) {
    return { filePath, content }
  }
  const ctsPath = filePath.replace(/\.d\.ts$/, '.d.cts')
  mkdirSync(dirname(ctsPath), { recursive: true })
  writeFileSync(ctsPath, content)
  return { filePath, content }
}

const output = (format: 'es' | 'cjs', extension: string) => ({
  format,
  exports: 'named' as const,
  chunkFileNames: `[name]-[hash].${extension}`,
  // RSC: hooks and context live behind this boundary; `server` must stay outside it
  banner: (chunk: { isEntry: boolean; name: string }) => (chunk.isEntry && chunk.name !== 'server' ? "'use client';" : ''),
})

export default defineConfig({
  resolve: { alias: { '#host': resolve(import.meta.dirname, 'src/host.ts') } },
  plugins: [
    react(),
    dts({
      afterDiagnostic(diagnostics) {
        const errors = diagnostics.filter((d) => d.category === 1)
        if (errors.length > 0) {
          throw new Error(`[vite:dts] ${errors.length} TypeScript error(s) — build aborted`)
        }
      },
      bundleTypes: true,
      entryRoot: 'src',
      outDir: 'dist/react',
      tsconfigPath: resolve(import.meta.dirname, 'tsconfig.build.json'),
      include: ['src/**/*.ts', 'src/**/*.tsx'],
      exclude: ['tests/**/*'],
      beforeWriteFile: dualPackageBeforeWriteFile,
    }) as unknown as import('vite').Plugin,
  ],
  build: {
    lib: {
      entry: {
        index: resolve(import.meta.dirname, 'src/index.ts'),
        router: resolve(import.meta.dirname, 'src/router/index.ts'),
        server: resolve(import.meta.dirname, 'src/server.ts'),
      },
      name: 'I18nMicroReact',
      formats: ['es', 'cjs'],
      fileName: (format, entryName) => `${entryName}.${format === 'es' ? 'mjs' : 'cjs'}`,
    },
    rollupOptions: {
      // Для React сборки мы помечаем все зависимости как внешние
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        'react-router-dom',
        '@i18n-micro/core',
        '@i18n-micro/core/render',
        '@i18n-micro/runtime',
        '@i18n-micro/types',
      ],
      output: [output('es', 'mjs'), output('cjs', 'cjs')],
    },
    outDir: 'dist/react',
    emptyOutDir: true,
    sourcemap: true,
  },
})
