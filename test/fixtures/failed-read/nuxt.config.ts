import MyModule from '../../../src/module'

// A dictionary host only: `test/failed-read.e2e.test.ts` runs it and makes it fail.
const host = process.env.FAILED_READ_HOST

export default defineNuxtConfig({
  modules: [MyModule],
  devtools: { enabled: false },
  compatibilityDate: '2024-08-16',
  routeRules: {
    '/swr': { swr: 60 },
    '/swr-kept': { swr: 1 },
    '/burst': { swr: 60 },
    '/cached': { cache: { swr: false, maxAge: 60 } },
  },
  i18n: {
    locales: [{ code: 'en', iso: 'en-US' }],
    defaultLocale: 'en',
    strategy: 'prefix_except_default',
    apiBaseClientHost: host,
    apiBaseServerHost: host,
    translationPayloads: { serverHandler: false, publicAssets: false, serverAssets: false },
    // the host is read again a second on: a page that was healthy can fail
    cacheTtl: 1,
  },
})
