// @ts-nocheck
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import pkg from './package.json'

const external = [...Object.keys(pkg.dependencies), /^@i18n-micro\//, /^node:/]

export default defineConfig({
  build: {
    lib: {
      entry: { cli: resolve(import.meta.dirname, 'src/cli.ts'), index: resolve(import.meta.dirname, 'src/index.ts') },
      formats: ['es'],
      fileName: (_format, entryName) => `${entryName}.mjs`,
    },
    rollupOptions: {
      external,
      output: {
        banner: (chunk) => (chunk.name === 'cli' ? '#!/usr/bin/env node' : ''),
        chunkFileNames: 'chunks/[name]-[hash].mjs',
      },
    },
    target: 'node20',
    minify: false,
    outDir: 'dist',
  },
  plugins: [
    dts({
      afterDiagnostic(diagnostics) {
        const errors = diagnostics.filter((d) => d.category === 1)
        if (errors.length > 0) throw new Error(`[vite:dts] ${errors.length} TypeScript error(s) — build aborted`)
      },
      bundleTypes: false,
      include: ['src/**/*.ts'],
      outDir: 'dist',
      tsconfigPath: resolve(import.meta.dirname, 'tsconfig.json'),
    }),
  ],
})
