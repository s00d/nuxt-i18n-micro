export default defineEventHandler(async (event) => {
  const t = await useTranslationServerMiddleware(event, undefined, 'de')
  return { message: t('title'), info: useLocaleServerMiddleware(event, undefined, 'de') }
})
