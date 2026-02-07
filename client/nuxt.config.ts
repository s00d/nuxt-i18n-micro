import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import DevtoolsUIKit from '@nuxt/devtools-ui-kit'

const currentDir = dirname(fileURLToPath(import.meta.url))

// Target directory in the monorepo root
const targetDistDir = resolve(currentDir, '../dist/client')

export default defineNuxtConfig({
  modules: [DevtoolsUIKit],

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

  // Remove nitro.output as it works unreliably for paths outside the root
  // during nuxi generate

  hooks: {
    // The 'close' hook fires when Nuxt has completely finished building and generating
    close: async () => {
      // Default Nuxt 3 (Nitro) output path
      const outputDir = resolve(currentDir, '.output/public')

      if (existsSync(outputDir)) {
        console.log(`[i18n-client] Moving build from ${outputDir} to ${targetDistDir}...`)

        // 1. Clean the target directory
        rmSync(targetDistDir, { recursive: true, force: true })

        // 2. Recreate it
        mkdirSync(targetDistDir, { recursive: true })

        // 3. Copy files recursively
        cpSync(outputDir, targetDistDir, { recursive: true })

        console.log('[i18n-client] Build successfully copied to root dist/client')
      } else {
        console.error(`[i18n-client] Error: Build output not found at ${outputDir}`)
      }
    },
  },
})
