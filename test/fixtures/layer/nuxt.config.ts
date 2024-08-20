// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  extends: '../basic',
  i18n: {
    locales: [
      { code: 'ru', iso: 'ru_RU' },
      { code: 'de', disabled: true },
    ],
  },
})
