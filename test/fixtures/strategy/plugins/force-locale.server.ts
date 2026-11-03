import { defineNuxtPlugin, useCookie, useRequestHeader, useState } from '#imports'

// Copy of locale-state/plugins/i18n-loader.server.ts, gated on a request header so the
// strategy builds keep their normal behaviour (the integration tests never send it).
// The header value is the forced locale; `user-locale` matches LOCALE_COOKIE in test/recipes.ts.
export default defineNuxtPlugin({
  name: 'i18n-test-force-locale',
  enforce: 'pre',
  order: -10,

  setup() {
    const detectedLocale = useRequestHeader('x-test-force-locale')
    if (!detectedLocale) return

    const localeCookie = useCookie('user-locale')
    if (localeCookie.value !== detectedLocale) localeCookie.value = detectedLocale

    useState<string | null>('i18n-locale', () => null).value = detectedLocale
  },
})
