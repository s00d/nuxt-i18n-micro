import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Отдельная конфигурация для сборки плагина
// Плагин должен работать в Node.js окружении, не в браузере
export default defineConfig({
  build: {
    ssr: true, // SSR режим для Node.js окружения
    lib: {
      entry: resolve(__dirname, 'vite/plugin.ts'),
      name: 'i18nDevToolsPlugin',
      formats: ['es'],
      fileName: () => 'plugin.mjs',
    },
    rollupOptions: {
      external: (id) => {
        // Externalize все зависимости, включая node:*
        // Плагин работает в Node.js, поэтому node: модули должны быть external
        return !id.startsWith('.') && !id.startsWith('/')
      },
      output: {
        format: 'es',
        entryFileNames: 'plugin.mjs',
        exports: 'named',
      },
    },
    outDir: resolve(__dirname, 'dist/vite'),
    emptyOutDir: true,
    sourcemap: true,
  },
})
