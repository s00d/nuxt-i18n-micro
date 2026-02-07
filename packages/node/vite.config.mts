// @ts-nocheck
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: '@i18n-micro/node',
      formats: ['cjs', 'es'],
      fileName: (format) => `index.${format === 'cjs' ? 'cjs' : 'mjs'}`,
    },
    rollupOptions: {
      // Важно: не бандлим зависимости, они должны ставиться через npm
      external: ['@i18n-micro/core', '@i18n-micro/types', 'node:fs/promises', 'node:path', 'node:fs'],
    },
    // Для Node.js таргета
    target: 'node18',
    outDir: 'dist',
  },
  plugins: [
    dts({
      rollupTypes: true, // Собираем типы в один файл
    }),
  ],
})
