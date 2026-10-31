// A plugin that uses the helpers, after the i18n plugin.
export default defineNuxtPlugin({
  name: 'bench-translate',
  dependsOn: ['i18n-plugin-loader'],
  setup() {
    const { $t, $getLocale } = useNuxtApp()
    useState('bench-plugin').value = { locale: $getLocale(), title: $t('title') }
  },
})
