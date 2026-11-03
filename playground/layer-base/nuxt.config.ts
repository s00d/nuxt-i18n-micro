// A Nuxt layer: adds a locale (with a custom property), a page and translations.
export default defineNuxtConfig({
  i18n: {
    locales: [{ code: 'pt', iso: 'pt-BR', displayName: 'Português', seo: false, flag: 'br' }],
  },
})
