import { createResolver, defineNuxtModule } from '@nuxt/kit'

// A module with translations of its own, listed after nuxt-i18n-micro: it adds its folder by absolute path.
export default defineNuxtModule({
  meta: { name: 'vendor-locales' },
  setup(_options, nuxt) {
    const { resolve } = createResolver(import.meta.url)
    const i18n = ((nuxt.options as { i18n?: { additionalTranslationDirs?: string[] } }).i18n ??= {})
    ;(i18n.additionalTranslationDirs ??= []).push(resolve('./locales'))
  },
})
