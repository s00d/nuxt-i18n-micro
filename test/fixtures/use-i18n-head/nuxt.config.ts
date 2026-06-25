import MyModule from '../../../src/module'

export default defineNuxtConfig({
  modules: [MyModule],
  devtools: { enabled: false },
  compatibilityDate: '2024-08-16',
  nitro: {
    prerender: {
      failOnError: false,
      routes: [
        '/',
        '/landing',
        '/custom-alternates',
        '/no-hreflang',
        '/reactive',
        '/post/hello-en',
        '/canonical/cms-canonical',
        '/partial/partial-only',
        '/x-default/with-xdefault',
        '/full/full-meta',
        '/blog/shared-blog',
        '/guides/shared-guide',
      ],
    },
  },
  i18n: {
    locales: [
      { code: 'en', iso: 'en-US' },
      { code: 'fr', iso: 'fr-FR' },
    ],
    meta: true,
    strategy: 'prefix_except_default',
    defaultLocale: 'en',
    translationDir: 'locales',
    autoDetectLanguage: false,
  },
})
