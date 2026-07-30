import { resolve } from 'node:path'
import { defineNuxtConfig } from 'nuxt/config'

const routesLocaleLinks: Record<string, string> = {
  'dir1-slug': 'dir1',
  'dir1-subdir-hash-subhash': 'dir1-subdir',
  'dir1-subdir-slug-id-key': 'dir1-subdir',
}

export default defineNuxtConfig({
  modules: ['../src/module', '../packages/types-generator/src/nuxt'],
  hooks: {
    // Nuxt pages later does `plugins ||= []` then `.push('vue-router/volar/…')`.
    // Those exports need vue-router@5; this workspace peers @4 — swallow the push.
    'prepare:types'({ tsConfig }) {
      tsConfig.vueCompilerOptions ||= {}
      const plugins: unknown[] = []
      const push = Array.prototype.push.bind(plugins) as (...items: unknown[]) => number
      plugins.push = (...items: unknown[]) =>
        push(
          ...items.filter((plugin) => {
            const name = typeof plugin === 'string' ? plugin : (plugin as { name?: string } | null)?.name
            return !String(name ?? '').startsWith('vue-router/volar/')
          }),
        )
      // Nuxt types this as string[], but also pushes `{ name, options }` for typedPages.
      tsConfig.vueCompilerOptions.plugins = plugins as string[]
    },
  },
  devtools: {
    enabled: true,
  },
  experimental: {
    // typedPages: true,
    // appManifest: false — disabling may break payload initialization in Nuxt 4
  },
  // app: {
  //   baseURL: '/prefix/',
  // },
  compatibilityDate: '2024-08-14',
  i18n: {
    locales: [
      { code: 'en', iso: 'en_EN', displayName: 'English' },
      { code: 'de', iso: 'de_DE', displayName: 'German' },
      { code: 'ru', iso: 'ru_RU', displayName: 'Russian' },
      { code: 'fr', iso: 'fr_FR', displayName: 'French', fallbackLocale: 'de' },
      { code: 'es', iso: 'es_ES', displayName: 'Spanish' },
      { code: 'ch', iso: 'ch_CH', displayName: 'Chinese' },
    ],
    meta: true,
    metaBaseUrl: 'http://localhost:3000/',
    defaultLocale: 'en',
    fallbackLocale: 'en',
    translationDir: 'locales',
    autoDetectLanguage: true,
    autoDetectPath: '/',
    routesLocaleLinks: routesLocaleLinks,

    // 'no_prefix' | 'prefix_except_default' | 'prefix' | 'prefix_and_default'
    strategy: 'prefix',
    // strategy: 'no_prefix',
    // noPrefixRedirect: true,
    globalLocaleRoutes: {
      // pages/page.vue
      page: {
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
      unlocalized: false,
    },
    plural: (key, count, params, _locale, getTranslation) => {
      const translation = getTranslation(key, params)
      if (!translation) {
        return null
      }
      const forms = translation.toString().split('|')
      if (forms.length === 0) return null
      const selectedForm = count < forms.length ? forms[count] : forms[forms.length - 1]
      if (!selectedForm) return null
      return selectedForm.trim().replace('{count}', count.toString())
    },
    // Test excludePatterns functionality
    excludePatterns: ['/sitemap*.xml', '/robots.txt', '/api/**', /\.(pdf|doc)$/],
  },
  i18nTypes: {
    translationDir: 'locales',
  },
})
