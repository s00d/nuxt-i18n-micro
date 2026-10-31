// The i18n:register hook: merged into the chunk of every route being loaded.
export default defineNuxtPlugin((nuxtApp) => {
  const calls = useState<string[]>('bench-register', () => [])
  nuxtApp.hook('i18n:register', (register, locale) => {
    calls.value = [...calls.value.slice(-9), locale]
    register({ registered: { marker: `registered ${locale}` } }, locale)
  })
})
