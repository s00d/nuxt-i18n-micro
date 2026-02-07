import MyModule from '../../../src/module'

export default defineNuxtConfig({
  modules: [MyModule],
  devtools: { enabled: false },
  compatibilityDate: '2024-08-16',

  i18n: {
    locales: [
      { code: 'en-us', iso: 'en_EN' },
      { code: 'de-de', iso: 'de_DE' },
    ],
    defaultLocale: 'en',
    // localeCookie: 'user-change-coockie',
    disablePageLocales: true,
    includeDefaultLocaleRoute: false,
    customRegexMatcher: '[a-z]{2}-[a-z]{2}',
  },
})
