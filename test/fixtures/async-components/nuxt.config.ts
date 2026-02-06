import MyModule from '../../../src/module'

export default defineNuxtConfig({
  modules: [
    MyModule,
  ],
  devtools: { enabled: false },
  routeRules: {
    // @ts-expect-error ssr is valid in runtime but types are not updated
    '/async-components-test': { ssr: false },
    // @ts-expect-error ssr is valid in runtime but types are not updated
    '/async-components-test-2': { ssr: false },
  },
  compatibilityDate: '2024-08-16',
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  i18n: {
    locales: [
      { code: 'en', iso: 'en_EN', displayName: 'English' },
      { code: 'ru', iso: 'ru_RU', displayName: 'Russian' },
      { code: 'de', iso: 'de_DE', displayName: 'German' },
    ],
    meta: true,
    defaultLocale: 'en',
    translationDir: 'locales',
    autoDetectLanguage: false,
  },
})
