import { defineEventHandler } from 'h3'
import { useTranslationServerMiddleware } from '../../../src/runtime/translation-server-middleware'

export default defineEventHandler(async (event) => {
  const t = await useTranslationServerMiddleware(event)
  return {
    hello: t('test_key'),
  }
})
