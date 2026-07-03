import MyModule from '../../../src/module'

export default defineNuxtConfig({
  modules: [MyModule, '@nuxtjs/seo'],
  devtools: { enabled: false },
  compatibilityDate: '2024-08-16',

  // @ts-expect-error site from @nuxtjs/seo / nuxt-site-config
  site: {
    url: 'https://example.com',
    name: 'Nuxt SEO Test',
    description: 'Default site description',
    indexable: true,
  },

  schemaOrg: {
    identity: {
      type: 'Organization',
      name: 'Nuxt SEO Test Org',
    },
  },

  i18n: {
    strategy: 'prefix',
    defaultLocale: 'en',
    translationDir: 'locales',
    autoDetectLanguage: false,
    meta: true,
    locales: [
      { code: 'en', iso: 'en-US', dir: 'ltr' },
      { code: 'de', iso: 'de-DE', dir: 'ltr' },
    ],
  },
})
