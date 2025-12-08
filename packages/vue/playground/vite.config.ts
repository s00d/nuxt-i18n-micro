import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import VueDevtools from 'vite-plugin-vue-devtools'
import { resolve } from 'node:path'

export default defineConfig({
  plugins: [
    vue(),
    VueDevtools(),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    include: ['@i18n-micro/devtools-ui'],
  },
})
