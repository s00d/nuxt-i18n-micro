import { defineNuxtPlugin } from '#app'

// `i18n:register` from an app plugin: its key must survive a locale switch (test/journeys/loading-hook.spec.ts)
export default defineNuxtPlugin((nuxtApp) => {
  // @ts-expect-error
  nuxtApp.hook('i18n:register', async (register: (translations: unknown, locale?: string) => void, locale: string) => {
    register({ hook: 'hook value' }, locale)
  })
})
