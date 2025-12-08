import { defineConfig } from 'astro/config'
import node from '@astrojs/node'
import { i18nIntegration } from '@i18n-micro/astro'
import { copyFileSync, mkdirSync, existsSync, readdirSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'

export default defineConfig({
  output: 'server',
  adapter: node({
    mode: 'standalone',
  }),
  integrations: [
    i18nIntegration({
      locale: 'en',
      fallbackLocale: 'en',
      locales: [
        { code: 'en', iso: 'en-US', displayName: 'English' },
        { code: 'fr', iso: 'fr-FR', displayName: 'Français' },
        { code: 'de', iso: 'de-DE', displayName: 'Deutsch' },
      ],
      translationDir: './src/locales',
    }),
    {
      name: 'copy-locales',
      hooks: {
        'astro:build:done': ({ dir }) => {
          // Copy locales to dist/server/locales
          const srcLocales = resolve('./src/locales')
          const distLocales = join(dir.pathname, 'server', 'locales')

          if (existsSync(srcLocales)) {
            mkdirSync(distLocales, { recursive: true })
            const files = readdirSync(srcLocales)
            for (const file of files) {
              const srcFile = join(srcLocales, file)
              const distFile = join(distLocales, file)
              if (statSync(srcFile).isFile()) {
                copyFileSync(srcFile, distFile)
              }
            }
            console.log(`✓ Copied locales to ${distLocales}`)
          }
        },
      },
    },
  ],
})
