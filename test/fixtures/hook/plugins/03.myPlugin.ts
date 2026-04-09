import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin((nuxtApp) => {
  const hookableNuxtApp = nuxtApp as {
    hook: (name: 'i18n:register', callback: (register: (translations: unknown, locale?: string) => void, locale: string) => void) => void
  }

  // const { $t, $getLocale } = useI18n() // or const { $t, $getLocale } = useNuxtApp()
  // const translatedMessage = $t('test_key')
  // const locale = $getLocale() // error here
  //
  // console.log(translatedMessage, locale)

  hookableNuxtApp.hook('i18n:register', async (register: (translations: unknown, locale?: string) => void, locale: string) => {
    register(
      {
        hook: 'hook value',
      },
      locale,
    )
  })
})
