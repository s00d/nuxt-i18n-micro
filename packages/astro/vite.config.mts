import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  build: {
    lib: {
      // Точки входа
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        'client/index': resolve(__dirname, 'src/client/index.ts'),
        'client/vue': resolve(__dirname, 'src/client/vue.ts'),
        'client/react': resolve(__dirname, 'src/client/react.tsx'),
        'client/preact': resolve(__dirname, 'src/client/preact.tsx'),
        'client/svelte': resolve(__dirname, 'src/client/svelte.ts'),
      },
      // УДАЛЕНО: formats: ['es', 'cjs'] — вызывает предупреждение, так как перекрывается rollupOptions
    },
    rollupOptions: {
      // Внешние зависимости
      external: [
        '@i18n-micro/core',
        '@i18n-micro/types',
        'node:fs',
        'node:path',
        'node:url',
        'node:module',
        'astro',
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
          exports: 'named',
        },
      ],
    },
    outDir: 'dist',
    emptyOutDir: true,
  },
  plugins: [
    dts({
      rollupTypes: false,
      insertTypesEntry: true,
      copyDtsFiles: true,
      outDir: 'dist',
      tsconfigPath: resolve(__dirname, 'tsconfig.json'),
      exclude: ['src/**/*.test.ts', 'src/**/*.spec.ts', 'tests/**/*'],
    }),
    // Плагин очистки: удаляет CJS файлы для клиента, так как Rollup генерирует их для всех entry point'ов
    {
      name: 'clean-client-cjs',
      generateBundle(options, bundle) {
        if (options.format === 'cjs') {
          for (const fileName in bundle) {
            if (fileName.startsWith('client/')) {
              delete bundle[fileName]
            }
          }
        }
      },
    },
  ],
})
