import type { Strategies } from '../../../src/module'
import MyModule from '../../../src/module'

export default defineNuxtConfig({
  modules: [MyModule],
  devtools: { enabled: false },
  compatibilityDate: '2024-08-16',

  i18n: {
    locales: [{ code: 'en' }, { code: 'ja' }],
    localeCookie: 'user-locale',
    autoDetectLanguage: false,
    strategy: (process.env.STRATEGY ?? 'no_prefix') as Strategies,
    defaultLocale: 'en',
    translationDir: 'locales',
  },
})
