export default defineNuxtRouteMiddleware((to) => {
  const { $getLocale, $getRouteName } = useNuxtApp()
  const log = useState<string[]>('bench-mw-global', () => [])
  log.value = [...log.value.slice(-9), `${to.path}|${$getLocale(to)}|${$getRouteName(to)}`]
})
