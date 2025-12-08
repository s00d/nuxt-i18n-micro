import { fileURLToPath } from 'node:url'
import { resolve, dirname } from 'node:path'
import { existsSync, cpSync, rmSync, mkdirSync } from 'node:fs'
import DevtoolsUIKit from '@nuxt/devtools-ui-kit'

const currentDir = dirname(fileURLToPath(import.meta.url))

// Целевая папка в корне монорепозитория
const targetDistDir = resolve(currentDir, '../dist/client')

export default defineNuxtConfig({
  modules: [
    DevtoolsUIKit,
  ],

  $production: {
    app: {
      baseURL: '/__NUXT_DEVTOOLS_I18N_BASE__/',
    },
  },

  ssr: false,

  devtools: {
    enabled: false,
  },

  app: {
    baseURL: '/__nuxt-i18n-micro/client',
  },

  compatibilityDate: '2024-08-16',

  vite: {
    server: {
      hmr: {
        protocol: 'ws',
        host: 'localhost',
        clientPort: 3000,
        path: '/_nuxt/',
      },
    },
  },

  // Убираем nitro.output, так как оно работает ненадежно для путей вне корня
  // при nuxi generate

  hooks: {
    // Хук 'close' срабатывает, когда Nuxt полностью завершил сборку и генерацию
    close: async () => {
      // Стандартный путь вывода Nuxt 3 (Nitro)
      const outputDir = resolve(currentDir, '.output/public')

      if (existsSync(outputDir)) {
        console.log(`[i18n-client] Moving build from ${outputDir} to ${targetDistDir}...`)

        // 1. Очищаем целевую папку
        rmSync(targetDistDir, { recursive: true, force: true })

        // 2. Создаем её заново
        mkdirSync(targetDistDir, { recursive: true })

        // 3. Копируем файлы рекурсивно
        cpSync(outputDir, targetDistDir, { recursive: true })

        console.log('[i18n-client] Build successfully copied to root dist/client')
      }
      else {
        console.error(`[i18n-client] Error: Build output not found at ${outputDir}`)
      }
    },
  },
})
