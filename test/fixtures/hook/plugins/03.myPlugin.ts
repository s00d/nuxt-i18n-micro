import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin((nuxtApp) => {
  // const { $t, $getLocale } = useI18n() // or const { $t, $getLocale } = useNuxtApp()
  // const translatedMessage = $t('test_key')
  // const locale = $getLocale() // error here
  //
  // console.log(translatedMessage, locale)

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  nuxtApp.hook('i18n:register', async (register: (translations: unknown, locale?: string) => void, locale: string) => {
    register({
      hook: 'hook value',
    }, locale)
  })
})
