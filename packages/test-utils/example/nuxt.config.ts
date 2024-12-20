// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({

  modules: ['@nuxt/test-utils/module', 'nuxt-i18n-micro'],
  components: {
    dirs: [{ path: '~/components', pathPrefix: false }],
  },
  devtools: { enabled: true },
  future: {
    compatibilityVersion: 4,
  },
  compatibilityDate: '2024-07-25',

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
