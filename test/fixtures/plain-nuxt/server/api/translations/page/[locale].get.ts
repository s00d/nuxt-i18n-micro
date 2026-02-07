import { defineEventHandler, getRouterParam } from 'h3'
import pageDe from '../../../../data/page/de.json'
import pageEn from '../../../../data/page/en.json'
import pageRu from '../../../../data/page/ru.json'

const translations: Record<string, Record<string, unknown>> = {
  en: pageEn,
  de: pageDe,
  ru: pageRu,
}

export default defineEventHandler((event) => {
  const locale = getRouterParam(event, 'locale') || 'en'
  return translations[locale] || translations.en
})
