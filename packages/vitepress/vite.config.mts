import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

function dualPackageBeforeWriteFile(filePath: string, content: string) {
  if (!filePath.endsWith('.d.ts')) {
    return { filePath, content }
  }
  let next = content
  if (filePath.endsWith('index.d.ts') || filePath.endsWith('node.d.ts') || filePath.endsWith('config.d.ts')) {
    if (filePath.endsWith('index.d.ts') && !next.includes('@i18n-micro/vitepress/client')) {
      next = `/// <reference types="@i18n-micro/vitepress/client" />\n${next}`
    }
    const ctsPath = filePath.replace(/\.d\.ts$/, '.d.cts')
    mkdirSync(dirname(ctsPath), { recursive: true })
    writeFileSync(ctsPath, next)
  }
  return { filePath, content: next }
}

export default defineConfig({
  build: {
    lib: {
      entry: {
        index: resolve(import.meta.dirname, 'src/index.ts'),
        config: resolve(import.meta.dirname, 'src/config.ts'),
        node: resolve(import.meta.dirname, 'src/node.ts'),
      },
      name: '@i18n-micro/vitepress',
      formats: ['cjs', 'es'],
      fileName: (format, entryName) => `${entryName}.${format === 'cjs' ? 'cjs' : 'mjs'}`,
    },
    rollupOptions: {
      external: [
        '@i18n-micro/core',
        '@i18n-micro/types',
        '@i18n-micro/utils',
        '@i18n-micro/utils/parse-path',
        '@i18n-micro/utils/deep-merge',
        '@i18n-micro/vue',
        'vue',
        'vitepress',
        'vite',
        /^node:/,
        /^virtual:/,
      ],
      output: {
        exports: 'named',
      },
    },
    outDir: 'dist',
    sourcemap: true,
  },
  plugins: [
    // Cast: root typecheck can see duplicate Vite copies (@types/node 20 vs 26).
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
    }) as never,
  ],
})
