import MyModule from '../../../src/module'

// TRANSLATION_PAYLOADS=source: the `translation-watcher-source-tmp` dev recipe (payloads merged by the API route)
const sourcePayloads = process.env.TRANSLATION_PAYLOADS === 'source'

export default defineNuxtConfig({
  modules: [MyModule],
  devtools: { enabled: false },
  compatibilityDate: '2024-08-16',

  i18n: {
    debug: true,
    locales: [{ code: 'en' }, { code: 'de', fallbackLocale: 'en' }, { code: 'fr' }],
    defaultLocale: 'en',
    fallbackLocale: 'en',
    strategy: 'prefix',
    translationDir: 'locales',
    additionalTranslationDirs: ['common'],
    autoDetectLanguage: false,
    // Avoid ensureTranslationFilesExist creating empty locales/{fr}.json for
    // locales that intentionally live only under additionalTranslationDirs.
    disableWatcher: true,
    hmr: true,
    meta: false,
    ...(sourcePayloads ? { translationPayloads: { mode: 'source' as const } } : {}),
    routesLocaleLinks: {
      'about-alias': 'about',
    },
  },
})
