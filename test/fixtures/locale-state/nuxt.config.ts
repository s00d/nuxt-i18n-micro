import MyModule from '../../../src/module'

export default defineNuxtConfig({
  modules: [
    MyModule,
  ],
  devtools: { enabled: false },
  compatibilityDate: '2024-08-16',

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  i18n: {
    locales: [{ code: 'en' }, { code: 'ja' }],
    localeCookie: 'user-locale',
    autoDetectLanguage: false,
    strategy: 'no_prefix',
    defaultLocale: 'en',
    translationDir: 'locales',
  },
})
