export default defineNuxtPlugin({
  name: 'i18n:plugin',
  dependsOn: ['i18n-plugin-loader'],
  enforce: 'post',
  setup(_nuxtApp) {
    // const { $t, $getLocale } = useI18n() // or const { $t, $getLocale } = useNuxtApp()
    // const translatedMessage = $t('test_key')
    // const locale = $getLocale() // error here
    //
    // console.log(translatedMessage, locale)
  },
})
