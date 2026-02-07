export default defineNuxtPlugin((nuxtApp) => {
  // @ts-expect-error
  nuxtApp.hook('i18n:register', async (register: (translations: unknown, locale?: string) => void, locale: string) => {
    console.log('i18n:register', locale)
    register(
      {
        hook: 'hook value',
      },
      locale,
    )
  })
})
