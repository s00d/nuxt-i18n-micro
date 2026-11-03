import { defineEventHandler, getRouterParam } from 'h3'

const slugs: Record<string, Record<string, string>> = {
  1: { en: '1-one', de: '1-eins', ru: '1-odin' },
  2: { en: '2-two', de: '2-zwei', ru: '2-dva' },
}

export default defineEventHandler((event) => {
  const entries = Object.entries(slugs[getRouterParam(event, 'id') ?? ''] ?? {})
  return Object.fromEntries(entries.map(([locale, id]) => [locale, { id }]))
})
