export default defineNuxtPlugin((nuxtApp) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  nuxtApp.hook('i18n:register', async (register: (translations: unknown, locale?: string) => void, locale: string) => {
    console.log('i18n:register', locale)
    register({
      hook: 'hook value',
    }, locale)
  })
})
