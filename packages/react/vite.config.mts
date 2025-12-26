import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    react(),
    dts({
      rollupTypes: true,
      entryRoot: 'src',
      outDir: 'dist/react',
      tsconfigPath: resolve(__dirname, 'tsconfig.json'),
    }) as unknown as import('vite').Plugin,
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'I18nMicroReact',
      formats: ['es', 'cjs'],
      fileName: format => `index.${format === 'es' ? 'mjs' : 'cjs'}`,
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
