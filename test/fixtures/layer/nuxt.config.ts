// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  extends: '../basic',
  devtools: { enabled: false },
  i18n: {
    locales: [
      { code: 'ru', iso: 'ru_RU' },
      { code: 'de', disabled: true },
    ],
    fallbackLocale: 'en',
  },
})
