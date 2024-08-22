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
    cache: false,
    defaultLocale: 'en',
    translationDir: 'locales',
    autoDetectLanguage: true,
    routesLocaleLinks: {
      'dir1-slug': 'dir1',
      'dir1-subdir-hash-subhash': 'dir1-subdir',
      'dir1-subdir-slug-id-key': 'dir1-subdir',
    },
  },
  devtools: { enabled: true },
  compatibilityDate: '2024-08-14',
})
