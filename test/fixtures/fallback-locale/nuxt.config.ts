import MyModule from '../../../src/module'

export default defineNuxtConfig({
  modules: [
    MyModule,
  ],
  devtools: { enabled: false },
  experimental: {
    appManifest: false,
  },
  compatibilityDate: '2024-08-16',
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  i18n: {
    locales: [
      { code: 'de' },
      { code: 'en' },
      { code: 'fr', fallbackLocale: 'de' },
      { code: 'ru' },
    ],
    defaultLocale: 'en',
    fallbackLocale: 'en',
    // disablePageLocales: true,
    includeDefaultLocaleRoute: false,
  },
})
