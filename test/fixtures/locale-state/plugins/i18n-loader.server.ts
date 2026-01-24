import { defineNuxtPlugin, useCookie, useState } from '#imports'

export default defineNuxtPlugin({
  name: 'i18n-custom-loader',
  enforce: 'pre',
  order: -10,

  setup() {
    const cookieName = 'user-locale'
    const detectedLocale = 'ja'

    const localeCookie = useCookie(cookieName)

    // Set locale state for i18n plugin (useState is immediately available to other plugins)
    const localeState = useState<string | null>('i18n-locale', () => null)

    if (localeCookie.value !== detectedLocale) {
      localeCookie.value = detectedLocale
      console.log('[SSR] Forced locale to:', detectedLocale)
    }

    localeState.value = detectedLocale
  },
})
