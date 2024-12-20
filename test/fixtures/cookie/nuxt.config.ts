import MyModule from '../../../src/module'

export default defineNuxtConfig({
  modules: [
    MyModule,
  ],

  compatibilityDate: '2024-08-16',

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  i18n: {
    locales: [{ code: 'de' }, { code: 'en' }],
    defaultLocale: 'en',
    // localeCookie: 'user-change-coockie',
    disablePageLocales: true,
    includeDefaultLocaleRoute: false,
  },
})
