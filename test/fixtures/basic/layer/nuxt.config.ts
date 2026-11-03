// The `basic-layer` recipe: an app that extends basic as a Nuxt layer. Its own locale files and pages win over
// the layer's; ru gets a new text, de is disabled (test/journeys/loading-layer.spec.ts).
export default defineNuxtConfig({
  extends: '..',
  devtools: { enabled: false },
  i18n: {
    locales: [
      { code: 'ru', iso: 'ru_RU' },
      { code: 'de', disabled: true },
    ],
    fallbackLocale: 'en',
  },
})
