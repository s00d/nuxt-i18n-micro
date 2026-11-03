export default defineEventHandler(async (event) => {
  const { locale = 'de', page = 'about' } = getQuery(event) as { locale?: string; page?: string }
  return await loadTranslationsFromServer(locale, page)
})
