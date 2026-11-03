import { defineNuxtPlugin } from '#app'

// Registers the module's own locale files through `i18n:register` (test/journeys/loading-hook.spec.ts).
// Locales without a file here (ru, ch, the n3 and pages-false variants) register nothing.
export default defineNuxtPlugin(async (nuxtApp) => {
  const loadTranslations = (lang: string) =>
    import(`../locales/${lang}.json`).then(
      (translations) => translations.default,
      () => null,
    )

  nuxtApp.hook('i18n:register', async (register: (translations: unknown, locale?: string) => void, locale: string) => {
    const translations = await loadTranslations(locale)
    if (translations) register(translations, locale)
  })
})
