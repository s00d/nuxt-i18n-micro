import { defineEventHandler } from 'h3'

export default defineEventHandler(async (event) => {
  const t = await useTranslationServerMiddleware(event)
  // a second helper in another locale, in the same request: its own dictionary
  const tEn = await useTranslationServerMiddleware(event, undefined, 'en')
  return {
    hello: t('test_key'),
    helloEn: tEn('test_key'),
  }
})
