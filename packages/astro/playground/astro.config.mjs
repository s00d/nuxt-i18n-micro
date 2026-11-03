import node from '@astrojs/node'
import react from '@astrojs/react'
import svelte from '@astrojs/svelte'
import vue from '@astrojs/vue'
import { i18nIntegration } from '@i18n-micro/astro'
import { i18nDevToolsIntegration } from '@i18n-micro/devtools-ui/vite'
import { defineConfig } from 'astro/config'

// `tests/publish/ssr.publish.test.ts` builds this site twice: as it is, and under a `base`
const base = process.env.I18N_BASE
// BENCH=1 builds the test bench in `bench/` instead of the demo in `src/`: see `benchmark/integrations/matrix.mjs`
const bench = process.env.BENCH === '1'
const output = process.env.BENCH_OUTPUT ?? 'server'
const outDir = process.env.BENCH_OUT

const demoLocales = [
  { code: 'en', iso: 'en-US', displayName: 'English' },
  { code: 'fr', iso: 'fr-FR', displayName: 'Français' },
  { code: 'de', iso: 'de-DE', displayName: 'Deutsch' },
  { code: 'es', iso: 'es-ES', displayName: 'Español', disabled: true },
]

const benchLocales = [
  { code: 'en', iso: 'en-US', displayName: 'English' },
  { code: 'de', iso: 'de-DE', displayName: 'Deutsch' },
  { code: 'fr', iso: 'fr-FR', displayName: 'Français' },
  { code: 'ru', iso: 'ru-RU', displayName: 'Русский' },
  { code: 'ar', iso: 'ar-EG', displayName: 'العربية', dir: 'rtl' },
  { code: 'pt', iso: 'pt-BR', displayName: 'Português' },
  { code: 'es', iso: 'es-ES', displayName: 'Español' },
  { code: 'it', iso: 'it-IT', displayName: 'Italiano', disabled: true },
]

export default defineConfig({
  output,
  ...(bench ? { srcDir: './bench' } : {}),
  ...(base ? { base, outDir: './dist/base' } : {}),
  ...(outDir ? { outDir } : {}),
  ...(output === 'server' ? { adapter: node({ mode: 'standalone' }) } : {}),
  vite: {
    cacheDir: process.env.BENCH_CACHE,
    optimizeDeps: {
      include: ['react', 'react-dom'],
    },
  },
  integrations: [
    vue(),
    react(),
    svelte(),
    ...(bench ? [] : [i18nDevToolsIntegration({ translationDir: 'src/locales' })]),
    i18nIntegration({
      locale: 'en',
      fallbackLocale: 'en',
      locales: bench ? benchLocales : demoLocales,
      translationDir: bench ? 'bench/locales' : 'src/locales',
      middleware: process.env.BENCH_STRATEGY !== 'prefix-all',
    }),
  ],
})
