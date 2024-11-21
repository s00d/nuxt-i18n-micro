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
      { code: 'en', iso: 'en_EN', displayName: 'English' },
      { code: 'de', iso: 'de_DE', displayName: 'German' },
      { code: 'ru', iso: 'ru_RU', displayName: 'Russian' },
      { code: 'fr', iso: 'fr_FR', displayName: 'French' },
      { code: 'ch', iso: 'ch_CH', displayName: 'Chinese' },
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
    includeDefaultLocaleRoute: true,
    globalLocaleRoutes: {
      // pages/page.vue
      'page': {
        en: '/pageEN',
        de: '/seite',
        ru: '/stranitsa',
      },

      // pages/dir1/[slug].vue
      'dir1-slug': {
        en: '/dir-one/:slug()',
        de: '/dir-eins/:slug()',
        ru: '/dir-odin/:slug()',
      },

      // pages/unlocalized.vue
      'unlocalized': false,
    },
    plural: (key, count, params, _locale, getTranslation) => {
      const translation = getTranslation(key, params)
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
