// Smoke app for release verification: built against the module as it would actually
// be consumed — either the packed tarball from this checkout, or the version on npm.
// Deliberately plain: no layers, no extra modules, so a failure points at the module.
//
// SMOKE_PUBLIC_ASSETS=0 → translationPayloads.publicAssets: false (Tier-1 regression for
// function presets: SSR must work from Nitro serverAssets without a public/_locales tree).
const publicAssetsOff = process.env.SMOKE_PUBLIC_ASSETS === '0'

// Layouts where `public/` is not next to the server: SSR must embed the payloads, not read a folder that is not there.
const nitro: Record<string, unknown> = {}
if (process.env.SMOKE_PUBLIC_DIR) nitro.output = { publicDir: process.env.SMOKE_PUBLIC_DIR }
if (process.env.SMOKE_SERVE_STATIC) nitro.serveStatic = true

export default defineNuxtConfig({
  modules: ['nuxt-i18n-micro'],
  devtools: { enabled: false },
  compatibilityDate: process.env.SMOKE_COMPATIBILITY_DATE ?? '2024-08-16',
  nitro,

  i18n: {
    locales: [
      { code: 'en', iso: 'en-US', displayName: 'English' },
      { code: 'de', iso: 'de-DE', displayName: 'Deutsch' },
      { code: 'fr', iso: 'fr-FR', displayName: 'Français' },
    ],
    defaultLocale: 'en',
    strategy: 'prefix_except_default',
    translationDir: 'locales',
    meta: true,
    metaBaseUrl: 'https://smoke.example.com',
    autoDetectLanguage: false,
    ...(publicAssetsOff ? { translationPayloads: { publicAssets: false } } : {}),
  },
})
