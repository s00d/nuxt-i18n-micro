export default defineEventHandler(async (event) => {
  const t = await useTranslationServerMiddleware(event)
  return { param: getRouterParam(event, 'locale'), detected: useLocaleServerMiddleware(event).current, title: t('title') }
})
