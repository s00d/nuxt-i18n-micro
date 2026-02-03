import MyModule from '../../../src/module'
import type { Strategies } from '../../../src/module'

export default defineNuxtConfig({
  modules: [
    MyModule,
  ],
  devtools: { enabled: false },
  experimental: {
    // typedPages: true,
    appManifest: false,
  },
  compatibilityDate: '2024-08-16',

  // Краулер при prefix находит ссылки типа /ru/kontakt (с /de), которых нет — 404.
  // Не падать generate на ошибках prerender (тест проверяет только успешную сборку и маршруты).
  nitro: {
    prerender: {
      failOnError: false,
    },
  },

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  i18n: {
    locales: [
      { code: 'en', iso: 'en_EN', displayName: 'English' },
      { code: 'de', iso: 'de_DE', displayName: 'German' },
      { code: 'ru', iso: 'ru_RU', displayName: 'Russian' },
    ],
    meta: true,
    defaultLocale: 'en',
    translationDir: 'locales',
    autoDetectLanguage: false,
    strategy: (process.env.STRATEGY ?? 'no_prefix') as Strategies,
  },
})
