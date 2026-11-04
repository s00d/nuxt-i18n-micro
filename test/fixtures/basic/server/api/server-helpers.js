import { defineEventHandler } from 'h3'

// the helpers on the server t: plurals, numbers, dates and has, as on the page
export default defineEventHandler(async (event) => {
  const t = await useTranslationServerMiddleware(event)
  return {
    plural: [0, 1, 2, 5].map((count) => t.tc('server_apples', count)),
    number: t.tn(1234.5),
    date: t.td(Date.UTC(2026, 0, 2), { timeZone: 'UTC', year: 'numeric', month: 'long', day: 'numeric' }),
    has: [t.has('server_apples'), t.has('no-such-key')],
  }
})
