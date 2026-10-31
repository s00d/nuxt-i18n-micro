export default defineEventHandler(async (event) => {
  const t = await useTranslationServerMiddleware(event)
  return { message: t('welcome', { name: 'Ada' }), missing: t('missing.key'), fallback: t('missing.key', {}, 'Fallback') }
})
