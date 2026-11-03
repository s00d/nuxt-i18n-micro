import { defineEventHandler } from 'h3'

// a server route outside /api: the helpers still use the API order (?locale, [locale], cookie, header)
export default defineEventHandler(async (event) => {
  const t = await useTranslationServerMiddleware(event)
  return { current: useLocaleServerMiddleware(event).current, hello: t('test_key') }
})
