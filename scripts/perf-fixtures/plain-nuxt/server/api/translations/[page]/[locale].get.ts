import { createError, defineEventHandler, getRouterParam } from 'h3'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

async function loadTranslations(page: string, locale: string) {
  const candidates = [
    join(process.cwd(), 'public', 'translations', page, `${locale}.json`),
    join(process.cwd(), 'public', 'translations', page, 'en.json'),
    join(process.cwd(), 'data', page, `${locale}.json`),
    join(process.cwd(), 'data', page, 'en.json'),
  ]
  for (const file of candidates) {
    try {
      return JSON.parse(await readFile(file, 'utf8'))
    } catch {
      // try next
    }
  }
  throw createError({ statusCode: 404, statusMessage: `Missing translations ${page}/${locale}` })
}

export default defineEventHandler(async (event) => {
  const page = getRouterParam(event, 'page') || 'index'
  const locale = getRouterParam(event, 'locale') || 'en'
  return loadTranslations(page, locale)
})
