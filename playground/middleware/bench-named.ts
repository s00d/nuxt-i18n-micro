export default defineNuxtRouteMiddleware((to) => {
  const { $t, $getLocale } = useNuxtApp()
  useState<Record<string, unknown>>('bench-mw-named').value = { path: to.path, locale: $getLocale(to), title: $t('title') }
})
