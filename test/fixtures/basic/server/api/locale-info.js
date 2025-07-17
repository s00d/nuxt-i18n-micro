import { defineEventHandler } from 'h3'
import { useLocaleServerMiddleware } from '#imports'

export default defineEventHandler((event) => {
  const localeInfo = useLocaleServerMiddleware(event)

  return {
    success: true,
    data: localeInfo,
    timestamp: new Date().toISOString(),
  }
})
