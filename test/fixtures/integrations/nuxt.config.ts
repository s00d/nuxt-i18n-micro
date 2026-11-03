import MyModule from '../../../src/module'

// Third-party Nuxt modules next to the i18n one, in one build: @nuxt/content renders content/*.md through
// pages/[key]/[...slug].vue (integrations-content.spec.ts), @nuxtjs/seo adds robots, sitemaps, site config and
// schema.org (integrations-nuxt-seo.spec.ts, #133, #240).
export default defineNuxtConfig({
  modules: [MyModule, '@nuxt/content', '@nuxtjs/seo'],
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
      { code: 'cs', iso: 'cs-CZ', dir: 'ltr' },
    ],
  },
})
