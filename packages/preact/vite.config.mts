import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  esbuild: {
    // Используем современный (automatic) JSX трансформ
    // Это позволяет не импортировать 'h' в каждом файле
    jsx: 'automatic',
    jsxImportSource: 'preact',
  },
  plugins: [
    dts({
      rollupTypes: true,
      entryRoot: 'src',
      outDir: 'dist',
      tsconfigPath: resolve(__dirname, 'tsconfig.json'),
      compilerOptions: {
        // Убеждаемся, что типы генерируются с учетом preact
        jsx: 4 as const, // JsxEmit.ReactJSX
        jsxImportSource: 'preact' as const,
        types: ['preact'] as const,
      },
    }) as unknown as import('vite').Plugin,
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'I18nMicroPreact',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'mjs' : 'cjs'}`,
    },
    rollupOptions: {
      external: [
        'preact',
        'preact/hooks',
        // ВАЖНО: Добавляем jsx-runtime, чтобы он не попал в бандл
        'preact/jsx-runtime',
        '@i18n-micro/core',
        '@i18n-micro/types',
      ],
      output: {
        exports: 'named',
      },
    },
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
  },
})
