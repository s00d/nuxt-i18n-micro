import node from '@astrojs/node'
import react from '@astrojs/react'
import svelte from '@astrojs/svelte'
import vue from '@astrojs/vue'
import { i18nIntegration } from '@i18n-micro/astro'
import { i18nDevToolsIntegration } from '@i18n-micro/devtools-ui/vite'
import { defineConfig } from 'astro/config'

// `tests/publish/ssr.publish.test.ts` builds this site twice: as it is, and under a `base`
const base = process.env.I18N_BASE

export default defineConfig({
  output: 'server',
  ...(base ? { base, outDir: './dist/base' } : {}),
  adapter: node({
    mode: 'standalone',
  }),
  vite: {
    optimizeDeps: {
      include: ['react', 'react-dom'],
    },
  },
  integrations: [
    vue(),
    react(),
    svelte(),
    i18nDevToolsIntegration({ translationDir: 'src/locales' }),
    i18nIntegration({
      locale: 'en',
      fallbackLocale: 'en',
      locales: [
        { code: 'en', iso: 'en-US', displayName: 'English' },
        { code: 'fr', iso: 'fr-FR', displayName: 'Français' },
        { code: 'de', iso: 'de-DE', displayName: 'Deutsch' },
        { code: 'es', iso: 'es-ES', displayName: 'Español', disabled: true },
      ],
      translationDir: 'src/locales',
    }),
  ],
})
