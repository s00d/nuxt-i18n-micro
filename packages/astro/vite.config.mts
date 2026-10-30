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
      // Точки входа
      entry: {
        index: resolve(import.meta.dirname, 'src/index.ts'),
        middleware: resolve(import.meta.dirname, 'src/auto-middleware.ts'),
        node: resolve(import.meta.dirname, 'src/node.ts'),
        'client/index': resolve(import.meta.dirname, 'src/client/index.ts'),
        'client/vue': resolve(import.meta.dirname, 'src/client/vue.ts'),
        'client/react': resolve(import.meta.dirname, 'src/client/react.tsx'),
        'client/preact': resolve(import.meta.dirname, 'src/client/preact.tsx'),
        'client/svelte': resolve(import.meta.dirname, 'src/client/svelte.ts'),
      },
      // УДАЛЕНО: formats: ['es', 'cjs'] — вызывает предупреждение, так как перекрывается rollupOptions
    },
    rollupOptions: {
      // Внешние зависимости
      external: [
        /^@i18n-micro\//,
        /^node:/,
        /^virtual:/,
        'astro',
        'vue',
        'svelte/store',
        'react',
        'react/jsx-runtime',
        'preact',
        'preact/hooks',
        'preact/jsx-runtime',
      ],
      // Массив output заменяет собой formats
      output: [
        // 1. ESM Сборка (Основная + Клиент)
        {
          format: 'es',
          entryFileNames: (chunkInfo) => {
            // Основной серверный файл — .mjs
            if (chunkInfo.name === 'index') return 'index.mjs'
            // Клиентские файлы — .js (для совместимости с бандлерами)
            return '[name].js'
          },
          exports: 'named',
        },
        // 2. CJS Сборка (Только серверная часть)
        {
          format: 'cjs',
          entryFileNames: '[name].cjs',
          chunkFileNames: '[name]-[hash].cjs',
          exports: 'named',
        },
      ],
    },
    outDir: 'dist',
    emptyOutDir: true,
  },
  plugins: [
    dts({
      afterDiagnostic(diagnostics) {
        const errors = diagnostics.filter((d) => d.category === 1)
        if (errors.length > 0) {
          throw new Error(`[vite:dts] ${errors.length} TypeScript error(s) — build aborted`)
        }
      },
      bundleTypes: false,
      insertTypesEntry: true,
      copyDtsFiles: true,
      outDir: 'dist',
      tsconfigPath: resolve(import.meta.dirname, 'tsconfig.json'),
      exclude: ['src/**/*.test.ts', 'src/**/*.spec.ts', 'tests/**/*'],
      beforeWriteFile: dualPackageBeforeWriteFile,
    }),
    // Rollup writes every entry in every format; only the main server entry has a CJS build
    {
      name: 'clean-client-cjs',
      generateBundle(options, bundle) {
        if (options.format === 'cjs') {
          for (const fileName in bundle) {
            if (/^(client\/|middleware\.|node\.)/.test(fileName)) {
              delete bundle[fileName]
            }
          }
        }
      },
    },
  ],
})
