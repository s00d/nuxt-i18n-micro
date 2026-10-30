import MyModule from '../../../src/module'

// TRANSLATION_PAYLOADS=source: the `translation-watcher-source-tmp` dev recipe (payloads merged by the API route)
const sourcePayloads = process.env.TRANSLATION_PAYLOADS === 'source'

export default defineNuxtConfig({
  modules: [MyModule],
  devtools: { enabled: false },
  compatibilityDate: '2024-08-16',

  i18n: {
    debug: true,
    // iso and dir feed the manual useLocaleHead page (/manual-head, seo-use-locale-head.spec.ts)
    locales: [
      { code: 'en', iso: 'en-US', dir: 'ltr' },
      { code: 'de', iso: 'de-DE', dir: 'ltr', fallbackLocale: 'en' },
      { code: 'fr', iso: 'fr-FR', dir: 'ltr' },
    ],
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
    // meta off app-wide: the head of /manual-head comes only from useLocaleHead + useHead
    meta: false,
    ...(sourcePayloads ? { translationPayloads: { mode: 'source' as const } } : {}),
    routesLocaleLinks: {
      'about-alias': 'about',
    },
  },
})
