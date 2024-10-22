import MyModule from '../../../src/module'

export default defineNuxtConfig({
  modules: [
    MyModule,
  ],

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  i18n: {
    locales: [{ code: 'de' }, { code: 'en' }],
    defaultLocale: 'de',
    includeDefaultLocaleRoute: true,
  },

  compatibilityDate: '2024-08-16',
})
