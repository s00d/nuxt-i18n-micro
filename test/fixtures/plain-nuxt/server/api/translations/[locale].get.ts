import { defineEventHandler, getRouterParam } from 'h3'
import indexDe from '../../../data/index/de.json'
import indexEn from '../../../data/index/en.json'
import indexRu from '../../../data/index/ru.json'

const translations: Record<string, Record<string, unknown>> = {
  en: indexEn,
  de: indexDe,
  ru: indexRu,
}

export default defineEventHandler((event) => {
  const locale = getRouterParam(event, 'locale') || 'en'
  return translations[locale] || translations.en
})
