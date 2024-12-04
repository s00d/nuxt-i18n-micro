// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-07-25',
  devtools: { enabled: true },
  future: {
    compatibilityVersion: 4,
  },
  components: {
    dirs: [{ path: '~/components', pathPrefix: false }],
  },

  modules: ['@nuxt/test-utils/module', 'nuxt-i18n-micro'],

  i18n: {
    locales: [
      {
        code: 'en-GB',
        iso: 'en-GB',
      },
    ],
    includeDefaultLocaleRoute: true,
    defaultLocale: 'en-GB',
    fallbackLocale: 'en-GB',
    localeCookie: 'locale',
    disablePageLocales: true,
    autoDetectLanguage: true,
    meta: true,
  },
})
