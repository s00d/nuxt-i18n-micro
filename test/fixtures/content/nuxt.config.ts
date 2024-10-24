import MyModule from '../../../src/module'

export default defineNuxtConfig({
  modules: [
    '@nuxt/content', MyModule,
  ],
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  i18n: {
    locales: [
      { code: 'en', iso: 'en-US', dir: 'ltr' },
      { code: 'cs', iso: 'cs-CZ', dir: 'ltr' },
    ],
    defaultLocale: 'cs',
    translationDir: 'locales',
    meta: false,
    disablePageLocales: true,
  },
})
