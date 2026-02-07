import { resolve } from 'node:path'
import { i18nDevToolsPlugin } from '@i18n-micro/devtools-ui/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import VueDevtools from 'vite-plugin-vue-devtools'

export default defineConfig({
  plugins: [
    vue(),
    VueDevtools(),
    // Подключаем i18n плагин для поддержки сохранения файлов
    i18nDevToolsPlugin({
      base: '/__i18n_api',
      translationDir: 'src/locales',
      injectButton: true,
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    include: ['@i18n-micro/devtools-ui'],
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
    },
  },
  ssr: {
    noExternal: ['@i18n-micro/vue', '@i18n-micro/core', '@i18n-micro/types'],
  },
})
