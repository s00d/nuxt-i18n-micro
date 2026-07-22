import { join } from 'node:path'
import MyModule from '../../../src/module'

const testBuildDir = process.env.NUXT_TEST_BUILD_DIR

export default defineNuxtConfig({
  modules: [MyModule],
  devtools: { enabled: false },
  compatibilityDate: '2024-08-16',
  ...(testBuildDir ? { buildDir: testBuildDir } : {}),
  nitro: {
    prerender: {
      failOnError: false,
      routes: [
        '/',
        '/landing',
        '/custom-alternates',
        '/no-hreflang',
        '/reactive',
        '/post/hello-en',
        '/canonical/cms-canonical',
        '/partial/partial-only',
        '/x-default/with-xdefault',
        '/full/full-meta',
        '/blog/shared-blog',
        '/guides/shared-guide',
      ],
    },
    ...(testBuildDir ? { output: { dir: join(testBuildDir, 'output') } } : {}),
  },
  i18n: {
    locales: [
      { code: 'en', iso: 'en-US' },
      { code: 'fr', iso: 'fr-FR' },
    ],
    meta: true,
    strategy: 'prefix_except_default',
    defaultLocale: 'en',
    translationDir: 'locales',
    autoDetectLanguage: false,
  },
})
