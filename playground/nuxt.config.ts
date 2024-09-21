import { resolve } from 'node:path'
import { defineNuxtConfig } from 'nuxt/config'
import { defineNuxtModule } from '@nuxt/kit'
import { startSubprocess } from '@nuxt/devtools-kit'

export default defineNuxtConfig({
  modules: [
    'nuxt-i18n-micro',
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
    meta: true,
    defaultLocale: 'en',
    translationDir: 'locales',
    autoDetectLanguage: true,
    autoDetectPath: '/',
    routesLocaleLinks: {
      'dir1-slug': 'dir1',
      'dir1-subdir-hash-subhash': 'dir1-subdir',
      'dir1-subdir-slug-id-key': 'dir1-subdir',
    },
    plural: (key, count, _locale, getTranslation) => {
      const translation = getTranslation(key, {})
      if (!translation) {
        return null
      }
      const forms = translation.toString().split('|')
      if (count === 0 && forms.length > 2) {
        return forms[0].trim() // Case for "no apples"
      }
      if (count === 1 && forms.length > 1) {
        return forms[1].trim() // Case for "one apple"
      }
      return (forms.length > 2 ? forms[2].trim() : forms[forms.length - 1].trim()).replace('{count}', count.toString())
    },
  },
  devtools: { enabled: true },
  compatibilityDate: '2024-08-14',
})
