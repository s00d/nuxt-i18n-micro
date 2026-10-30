export default {
  modules: ['nuxt-i18n-micro'],
  i18n: {
    locales: [
      { code: 'en', iso: 'en-US' },
      { code: 'de', iso: 'de-DE' },
      { code: 'ru', iso: 'ru-RU' },
    ],
    defaultLocale: 'en',
    translationDir: 'locales',
  },
}
