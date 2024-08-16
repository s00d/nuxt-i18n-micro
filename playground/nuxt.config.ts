import { resolve } from 'node:path'
import { defineNuxtConfig } from 'nuxt/config'
import { defineNuxtModule } from '@nuxt/kit'
import { startSubprocess } from '@nuxt/devtools-kit'

export default defineNuxtConfig({
  modules: [
    '../src/module',
    defineNuxtModule({
      setup(_, nuxt) {
        if (!nuxt.options.dev)
          return

        startSubprocess(
          {
            command: 'npx',
            args: ['nuxi', 'dev', '--port', '3030'],
            cwd: resolve(__dirname, '../client'),
          },
          {
            id: 'nuxt:i18n:micro',
            name: 'i18n Micro',
          },
        )
      },
    }),
  ],
  i18n: {
    locales: [
      { code: 'en', iso: 'en_EN' },
      { code: 'de', iso: 'de_DE' },
      { code: 'ru', iso: 'ru_RU' },
    ],
    mata: true,
    defaultLocale: 'en',
    translationDir: 'locales',
    autoDetectLanguage: true,
  },
  devtools: { enabled: true },
  compatibilityDate: '2024-08-14',
})
