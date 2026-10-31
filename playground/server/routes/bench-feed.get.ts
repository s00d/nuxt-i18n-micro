export default defineEventHandler(async (event) => {
  const t = await useTranslationServerMiddleware(event)
  const { current } = useLocaleServerMiddleware(event)
  setResponseHeader(event, 'content-type', 'application/xml')
  return `<feed locale="${current}"><title>${t('title')}</title></feed>`
})
