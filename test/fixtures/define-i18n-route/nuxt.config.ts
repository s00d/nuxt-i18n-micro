import MyModule from '../../../src/module'

export default defineNuxtConfig({
  modules: [
    MyModule,
  ],
  devtools: { enabled: true },
  i18n: {
    locales: [
      { code: 'en', iso: 'en_EN', displayName: 'English' },
      { code: 'es', iso: 'es-ES', displayName: 'Español' },
    ],
    meta: true,
    // metaBaseUrl: "http://localhost:3000/",
    defaultLocale: 'en',
    fallbackLocale: 'en',
    // translationDir: "locales",
    autoDetectLanguage: true,
    // autoDetectPath: "/",
    // 'no_prefix' | 'prefix_except_default' | 'prefix' | 'prefix_and_default'
    strategy: 'prefix_except_default',
  },
})
